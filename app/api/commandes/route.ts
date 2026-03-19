import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateOrderNumber, formatPrice, getDeliveryFee, isValidBeninPhone } from '@/lib/utils'
import { sendWhatsAppMessage, notifyAdminNewOrder } from '@/lib/whatsapp'
import { sendEmail, getOrderConfirmationEmail } from '@/lib/email'
import { checkRateLimit, getClientIP, RATE_LIMIT_ORDERS } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

// GET /api/commandes - Liste des commandes d'un client
export async function GET(request: NextRequest) {
  try {
    // SECURITE : Rate limiting — max 10 consultations par minute par IP
    const clientIP = getClientIP(request)
    if (!(await checkRateLimit(clientIP, 'commandes-get', { max: 10, windowMs: 60000 }))) {
      return NextResponse.json(
        { error: 'Trop de requetes. Reessayez dans une minute.' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Valider que le status est dans les valeurs autorisées
    const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED']
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    // SECURITE : le telephone est obligatoire pour eviter de lister toutes les commandes
    if (!phone) {
      return NextResponse.json(
        { error: 'Le parametre phone est requis' },
        { status: 400 }
      )
    }

    // Normaliser le telephone pour chercher dans tous les formats possibles
    // Les commandes peuvent etre stockees en +22901XXXXXXXX ou 01XXXXXXXX
    const digits = phone.replace(/\D/g, '')
    const withoutPrefix = digits.startsWith('229') ? digits.slice(3) : digits
    const withPrefix = '+229' + withoutPrefix

    const where: Record<string, unknown> = {
      phone: { in: [phone, withPrefix, withoutPrefix] },
    }

    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                stock: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('GET /api/commandes error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}

// POST /api/commandes - Créer une commande
export async function POST(request: NextRequest) {
  try {
    // SECURITE : Rate limiting — max 5 commandes par minute par IP
    const clientIP = getClientIP(request)
    if (!(await checkRateLimit(clientIP, 'commandes', RATE_LIMIT_ORDERS))) {
      return NextResponse.json(
        { error: 'Trop de requetes. Reessayez dans une minute.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    const {
      customerName,
      phone,
      email,
      address,
      quarter,
      notes,
      paymentMethod,
      items,
      isSplitPayment,
      loyaltyPointsUsed,
      promoCode,
    } = body

    // Validation des champs requis
    if (!customerName || !phone || !address || !quarter || !paymentMethod) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // SECURITE : Valider le quartier contre la liste des zones connues
    const VALID_QUARTERS = [
      'Cadjehoun', 'Cotonou Centre', 'Ganhi',
      'Akpakpa', 'Fidjrossè', 'Haie Vive', 'Gbèdjromédé', 'Zogbo',
      'Agla', 'Godomey', 'Calavi', 'Tokpa', 'Dantokpa', 'Jéricho',
      'Porto-Novo', 'Sèmè-Kpodji', 'Ouidah', 'Pahou',
      'Autre',
    ]
    if (!VALID_QUARTERS.includes(quarter)) {
      return NextResponse.json(
        { error: 'Zone de livraison invalide' },
        { status: 400 }
      )
    }

    // SECURITE : Whitelist des méthodes de paiement acceptées
    const VALID_PAYMENT_METHODS = [
      'MOBILE_MONEY',
      'MTN_MOBILE_MONEY',
      'MOOV_MONEY',
      'CELTIS_MONEY',
      'CASH_ON_DELIVERY',
    ]
    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Méthode de paiement invalide' },
        { status: 400 }
      )
    }

    // SECURITE : Valider le format du telephone beninois
    if (!isValidBeninPhone(phone)) {
      return NextResponse.json(
        { error: 'Numero de telephone invalide. Format attendu : +229 01 XX XX XX XX' },
        { status: 400 }
      )
    }

    // Normaliser le telephone au format +229XXXXXXXXXX pour coherence en base
    const phoneDigits = phone.replace(/\D/g, '')
    const normalizedPhone = '+229' + (phoneDigits.startsWith('229') ? phoneDigits.slice(3) : phoneDigits)

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Le panier est vide' },
        { status: 400 }
      )
    }

    // Limiter le nombre d'articles par commande
    if (items.length > 50) {
      return NextResponse.json(
        { error: 'Trop d\'articles dans la commande (max 50)' },
        { status: 400 }
      )
    }

    // SECURITE : Sanitizer les champs texte
    const safeCustomerName = sanitizeText(customerName, 100)
    const safeAddress = sanitizeText(address, 300)
    const safeNotes = sanitizeText(notes, 500)
    const safeEmail = email ? sanitizeText(email, 100) : null

    // Générer le numéro de commande
    const orderNumber = generateOrderNumber()

    // ============================================
    // SECURITE : Recalculer tous les montants cote serveur
    // Ne JAMAIS faire confiance au subtotal/total/deliveryFee du client
    // ============================================

    let serverSubtotal = 0
    const verifiedItems: Array<{ productId: string; quantity: number; price: number; productName: string }> = []

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Donnees article invalides' },
          { status: 400 }
        )
      }

      // Quantite maximale par article
      if (item.quantity > 100) {
        return NextResponse.json(
          { error: 'Quantite trop elevee pour un article (max 100)' },
          { status: 400 }
        )
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, price: true, stock: true, isActive: true },
      })

      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Produit introuvable ou desactive` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product.name}` },
          { status: 400 }
        )
      }

      // Utiliser le prix REEL depuis la base de donnees, pas celui du client
      const itemTotal = product.price * item.quantity
      serverSubtotal += itemTotal

      verifiedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        productName: product.name,
      })
    }

    // Calculer les frais de livraison depuis la fonction serveur
    const serverDeliveryFee = getDeliveryFee(quarter)

    // SECURITE : Valider les points de fidelite si utilises
    let serverLoyaltyDiscount = 0
    let serverLoyaltyPointsUsed = 0

    if (typeof loyaltyPointsUsed === 'number' && loyaltyPointsUsed > 0) {
      // Verifier le solde reel de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        select: { loyaltyPoints: true },
      })

      if (!user || user.loyaltyPoints < loyaltyPointsUsed) {
        return NextResponse.json(
          { error: 'Points de fidelite insuffisants' },
          { status: 400 }
        )
      }

      if (loyaltyPointsUsed < 500) {
        return NextResponse.json(
          { error: 'Minimum 500 points pour utiliser vos points' },
          { status: 400 }
        )
      }

      serverLoyaltyPointsUsed = Math.floor(loyaltyPointsUsed)
      // S6: Plafonner au subtotal + livraison (promo calculee apres, total < 0 deja verifie)
      serverLoyaltyDiscount = Math.min(
        serverLoyaltyPointsUsed,
        Math.max(0, serverSubtotal + serverDeliveryFee)
      )
    }

    // SECURITE : Valider le code promo si fourni
    let serverPromoDiscount = 0
    let validatedPromoCode: string | null = null

    if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.trim().toUpperCase() },
      })

      if (!promo) {
        return NextResponse.json(
          { error: 'Code promo invalide' },
          { status: 400 }
        )
      }

      if (!promo.isActive) {
        return NextResponse.json(
          { error: 'Ce code promo n\'est plus actif' },
          { status: 400 }
        )
      }

      if (promo.expiresAt && promo.expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Ce code promo a expire' },
          { status: 400 }
        )
      }

      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        return NextResponse.json(
          { error: 'Ce code promo a atteint son nombre maximum d\'utilisations' },
          { status: 400 }
        )
      }

      if (promo.minOrder && serverSubtotal < promo.minOrder) {
        return NextResponse.json(
          { error: `Commande minimum de ${formatPrice(promo.minOrder)} requise pour ce code promo` },
          { status: 400 }
        )
      }

      // Calculer la reduction cote serveur
      if (promo.type === 'percent') {
        serverPromoDiscount = Math.floor(serverSubtotal * promo.discount / 100)
      } else {
        serverPromoDiscount = promo.discount
      }

      // La reduction ne peut pas depasser le sous-total
      serverPromoDiscount = Math.min(serverPromoDiscount, serverSubtotal)
      validatedPromoCode = promo.code
    }

    // Calculer le total final cote serveur
    const serverTotal = serverSubtotal + serverDeliveryFee - serverLoyaltyDiscount - serverPromoDiscount

    if (serverTotal < 0) {
      return NextResponse.json(
        { error: 'Montant total invalide' },
        { status: 400 }
      )
    }

    // Calculer les montants split si applicable
    let serverSplitFirst: number | null = null
    let serverSplitSecond: number | null = null

    if (isSplitPayment) {
      // Paiement en 2x : 60% maintenant, 40% a la livraison
      serverSplitFirst = Math.ceil(serverTotal * 0.6)
      serverSplitSecond = serverTotal - serverSplitFirst
    }

    // ============================================
    // SECURITE : Transaction atomique — creation commande + decrement stock
    // Empeche les oversells si deux commandes arrivent simultanement
    // ============================================
    const order = await prisma.$transaction(async (tx) => {
      // 1. Decrementer le stock de maniere atomique avec verification
      for (const item of verifiedItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        })

        if (updated.count === 0) {
          throw new Error(`Stock insuffisant pour ${item.productName}`)
        }
      }

      // 2. Debiter les points de fidelite si utilises
      if (serverLoyaltyPointsUsed > 0) {
        const updatedUser = await tx.user.updateMany({
          where: {
            phone: normalizedPhone,
            loyaltyPoints: { gte: serverLoyaltyPointsUsed },
          },
          data: { loyaltyPoints: { decrement: serverLoyaltyPointsUsed } },
        })

        if (updatedUser.count === 0) {
          throw new Error('Points de fidelite insuffisants')
        }
      }

      // 3. Creer la commande avec les montants RECALCULES par le serveur
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: safeCustomerName,
          phone: normalizedPhone,
          email: safeEmail,
          address: safeAddress,
          quarter: sanitizeText(quarter, 100),
          notes: safeNotes,
          paymentMethod,
          subtotal: serverSubtotal,
          deliveryFee: serverDeliveryFee,
          promoCode: validatedPromoCode,
          promoDiscount: serverPromoDiscount,
          total: serverTotal,
          isSplitPayment: isSplitPayment || false,
          splitFirstAmount: serverSplitFirst,
          splitSecondAmount: serverSplitSecond,
          loyaltyPointsUsed: serverLoyaltyPointsUsed,
          loyaltyPointsEarned: Math.floor(serverTotal / 100),
          items: {
            create: verifiedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // 4. Enregistrer l'utilisation des points fidelite
      if (serverLoyaltyPointsUsed > 0) {
        const user = await tx.user.findUnique({
          where: { phone: normalizedPhone },
          select: { id: true },
        })
        if (user) {
          await tx.loyaltyPoint.create({
            data: {
              userId: user.id,
              points: -serverLoyaltyPointsUsed,
              type: 'REDEEM',
              reason: 'order_discount',
              orderId: newOrder.id,
            },
          })
        }
      }

      // 5. Incrementer le compteur d'utilisation du code promo
      if (validatedPromoCode) {
        await tx.promoCode.update({
          where: { code: validatedPromoCode },
          data: { usedCount: { increment: 1 } },
        })
      }

      // 6. Crediter les points de fidelite gagnes (COD uniquement, mobile money = via webhook)
      const pointsEarned = Math.floor(serverTotal / 100)
      if (paymentMethod === 'CASH_ON_DELIVERY' && pointsEarned > 0) {
        // S2: upsert atomique — evite la race condition findUnique + create
        const user = await tx.user.upsert({
          where: { phone: normalizedPhone },
          update: {},
          create: { phone: normalizedPhone, name: safeCustomerName },
          select: { id: true },
        })

        // Crediter les points
        await tx.user.update({
          where: { id: user.id },
          data: { loyaltyPoints: { increment: pointsEarned } },
        })

        // Historique des points gagnes
        await tx.loyaltyPoint.create({
          data: {
            userId: user.id,
            points: pointsEarned,
            type: 'EARN',
            reason: 'order_purchase',
            orderId: newOrder.id,
          },
        })
      }

      return newOrder
    })

    // Notifications (fire-and-forget pour ne pas bloquer la reponse)
    // Les notifications ne sont envoyees que pour les commandes COD.
    // Les commandes mobile money sont confirmees via le webhook KKiaPay.
    if (paymentMethod === 'CASH_ON_DELIVERY') {
      const productsList = verifiedItems
        .map((item) => `${item.quantity}x ${item.productName}`)
        .join(', ')

      // Confirmation WhatsApp au client
      sendWhatsAppMessage(phone, 'order_confirmation', {
        name: customerName.split(' ')[0],
        orderNumber: order.orderNumber,
        products: productsList,
        total: formatPrice(order.total),
        address: `${address}, ${quarter}`,
        quarter,
      }).catch(console.error)

      // Email de confirmation si disponible
      if (email) {
        const orderItems = order.items as Array<{
          product: { name: string } | null
          quantity: number
          price: number
        }>

        const emailHtml = getOrderConfirmationEmail({
          customerName,
          orderNumber: order.orderNumber,
          items: orderItems.map((oi) => ({
            name: oi.product?.name || 'Produit',
            quantity: oi.quantity,
            price: oi.price,
          })),
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          address: `${address}, ${quarter}`,
          quarter,
        })

        sendEmail({
          to: email,
          subject: `Commande TOKOSSA #${order.orderNumber} confirmee`,
          html: emailHtml,
        }).catch(console.error)
      }

      // Notification WhatsApp a l'admin
      notifyAdminNewOrder({
        orderNumber: order.orderNumber,
        customerName,
        phone,
        total: order.total,
        quarter,
        paymentMethod: 'CASH_ON_DELIVERY',
      }).catch(console.error)

      // Social proof : enregistrer la notification de vente
      prisma.saleNotification
        .create({
          data: {
            productName: 'Commande',
            customerName:
              customerName.split(' ')[0] +
              ' ' +
              (customerName.split(' ')[1]?.[0] || '') +
              '.',
            quarter,
          },
        })
        .catch(console.error)
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/commandes error:', error)

    // Erreurs metier de la transaction (stock insuffisant, points insuffisants)
    const message = error instanceof Error ? error.message : ''
    if (message.includes('Stock insuffisant') || message.includes('Points de fidelite')) {
      return NextResponse.json({ error: message }, { status: 409 })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}
