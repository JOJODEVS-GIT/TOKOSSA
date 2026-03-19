import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Nettoyage de la base de donnees...')

  // Nettoyer dans l'ordre (respect des relations)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.whatsAppLog.deleteMany()
  await prisma.saleNotification.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  console.log('Creation des produits...')

  // ============================================
  // PRODUITS — 24 produits, 6 categories
  // ============================================

  const products = await prisma.product.createMany({
    data: [
      // ---- ELECTRONIQUE (4 produits) ----
      {
        name: 'Ecouteurs Bluetooth Sans Fil Pro',
        slug: 'ecouteurs-bluetooth-sans-fil-pro',
        description: 'Ecouteurs Bluetooth 5.3 avec reduction de bruit active, autonomie 30h, etui de charge compact. Son haute fidelite et micro integre pour appels clairs. Compatibles iPhone et Android.',
        price: 15000,
        oldPrice: 22000,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop',
        ],
        stock: 23,
        category: 'Electronique',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Montre Connectee Sport',
        slug: 'montre-connectee-sport',
        description: 'Montre intelligente avec suivi cardiaque, GPS integre, notifications smartphone, etanche IP68. Ecran AMOLED tactile 1.4 pouces. Autonomie 7 jours.',
        price: 25000,
        oldPrice: 35000,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop',
        ],
        stock: 12,
        category: 'Electronique',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Enceinte Bluetooth Portable',
        slug: 'enceinte-bluetooth-portable',
        description: 'Enceinte sans fil 20W avec basses puissantes, etanche IPX7, autonomie 12h. Parfaite pour la plage, les fetes et les sorties. Micro integre.',
        price: 12000,
        oldPrice: 18000,
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&h=600&fit=crop',
        ],
        stock: 18,
        category: 'Electronique',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Chargeur Solaire Portable 20000mAh',
        slug: 'chargeur-solaire-portable',
        description: 'Power bank solaire 20000mAh avec double USB, lampe LED integree. Rechargement solaire ou USB-C. Ideal pour les deplacements et coupures de courant.',
        price: 8500,
        oldPrice: null,
        images: [
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop',
        ],
        stock: 30,
        category: 'Electronique',
        isFeatured: false,
        isActive: true,
      },

      // ---- MODE (4 produits) ----
      {
        name: 'Robe Wax Traditionnelle Moderne',
        slug: 'robe-wax-traditionnelle-moderne',
        description: 'Robe en tissu wax africain authentique, coupe moderne et elegante. Disponible en plusieurs motifs. Fabrication artisanale locale. Tailles S a XXL.',
        price: 18000,
        oldPrice: 25000,
        images: [
          'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
        ],
        stock: 8,
        category: 'Mode',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Chemise Lin Premium Homme',
        slug: 'chemise-lin-premium-homme',
        description: 'Chemise en lin naturel, coupe slim, respirante et legere. Parfaite pour le climat tropical. Col mao moderne. Coloris blanc casse.',
        price: 12000,
        oldPrice: 15000,
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop',
        ],
        stock: 15,
        category: 'Mode',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Sac a Main Cuir Artisanal',
        slug: 'sac-main-cuir-artisanal',
        description: 'Sac a main en cuir veritable fait main, doublure en tissu wax. Bandouliere amovible, fermeture eclair. Fabrication artisanale beninoise.',
        price: 22000,
        oldPrice: 30000,
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
        ],
        stock: 5,
        category: 'Mode',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Sneakers Urban Style',
        slug: 'sneakers-urban-style',
        description: 'Baskets tendance avec semelle confort, design urbain moderne. Legeres et respirantes. Pointures 39 a 45. Coloris noir/blanc.',
        price: 15000,
        oldPrice: null,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
        ],
        stock: 20,
        category: 'Mode',
        isFeatured: false,
        isActive: true,
      },

      // ---- BEAUTE (4 produits) ----
      {
        name: 'Coffret Soin Visage Naturel',
        slug: 'coffret-soin-visage-naturel',
        description: 'Kit complet de soins visage aux ingredients naturels africains : beurre de karite, huile de baobab, savon noir. 5 produits pour une peau eclatante.',
        price: 20000,
        oldPrice: 28000,
        images: [
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop',
        ],
        stock: 14,
        category: 'Beaute',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Huile de Coco Vierge Bio 500ml',
        slug: 'huile-coco-vierge-bio',
        description: 'Huile de coco 100% vierge, pressee a froid. Multi-usage : cheveux, peau, cuisine. Sans additifs. Production locale certifiee.',
        price: 5000,
        oldPrice: 7000,
        images: [
          'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&h=600&fit=crop',
        ],
        stock: 40,
        category: 'Beaute',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Palette Maquillage 24 Couleurs',
        slug: 'palette-maquillage-24-couleurs',
        description: 'Palette professionnelle de 24 teintes mats et shimmer adaptees a toutes les carnations. Pigments intenses et longue tenue. Miroir integre.',
        price: 8000,
        oldPrice: 12000,
        images: [
          'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=600&h=600&fit=crop',
        ],
        stock: 22,
        category: 'Beaute',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Beurre de Karite Pur 200g',
        slug: 'beurre-karite-pur',
        description: 'Beurre de karite 100% pur et non raffine du nord Benin. Hydrate peau et cheveux en profondeur. Pot en verre ecologique.',
        price: 3500,
        oldPrice: null,
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop',
        ],
        stock: 50,
        category: 'Beaute',
        isFeatured: false,
        isActive: true,
      },

      // ---- SPORT (4 produits) ----
      {
        name: 'Tapis de Yoga Premium Antiderapant',
        slug: 'tapis-yoga-premium',
        description: 'Tapis de yoga epais 6mm, antiderapant double face, materiau TPE ecologique. Sangle de transport incluse. 183x61cm.',
        price: 10000,
        oldPrice: 14000,
        images: [
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop',
        ],
        stock: 16,
        category: 'Sport',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Halteres Reglables 2x10kg',
        slug: 'halteres-reglables-2x10kg',
        description: 'Paire d\'halteres ajustables de 1 a 10kg chacun. Revetement caoutchouc antiderapant. Ideal pour entrainement maison. Compact et facile a ranger.',
        price: 28000,
        oldPrice: 35000,
        images: [
          'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=600&fit=crop',
        ],
        stock: 7,
        category: 'Sport',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Sac de Sport Multifonction',
        slug: 'sac-sport-multifonction',
        description: 'Sac de sport 40L avec compartiment chaussures separe, poche humide, bandouliere rembourrée. Tissu impermeable. Noir/orange.',
        price: 9000,
        oldPrice: null,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
        ],
        stock: 25,
        category: 'Sport',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Gourde Isotherme Inox 750ml',
        slug: 'gourde-isotherme-inox',
        description: 'Gourde en acier inoxydable double paroi. Garde au frais 24h, au chaud 12h. Sans BPA, anti-fuite. Design elegant noir mat.',
        price: 6000,
        oldPrice: 8500,
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop',
        ],
        stock: 35,
        category: 'Sport',
        isFeatured: false,
        isActive: true,
      },

      // ---- MAISON (4 produits) ----
      {
        name: 'Lampe LED Solaire Exterieure',
        slug: 'lampe-led-solaire-exterieure',
        description: 'Lampe solaire puissante pour jardin/terrasse. Capteur de mouvement, 3 modes d\'eclairage, etanche IP65. Installation sans fil.',
        price: 7000,
        oldPrice: 10000,
        images: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop',
        ],
        stock: 19,
        category: 'Maison',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Ventilateur Rechargeable USB',
        slug: 'ventilateur-rechargeable-usb',
        description: 'Ventilateur de bureau rechargeable avec 3 vitesses, silencieux, autonomie 8h. Tete orientable 360 degres. Rechargement USB-C. Ideal coupures SBEE.',
        price: 8000,
        oldPrice: 12000,
        images: [
          'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&h=600&fit=crop',
        ],
        stock: 3,
        category: 'Maison',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Set de Cuisine Bambou 5 Pieces',
        slug: 'set-cuisine-bambou',
        description: 'Ensemble d\'ustensiles de cuisine en bambou naturel : spatule, cuillere, louche, pince, support. Ecologique et durable.',
        price: 5500,
        oldPrice: null,
        images: [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop',
        ],
        stock: 28,
        category: 'Maison',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Organisateur Bureau Multi-Rangement',
        slug: 'organisateur-bureau-multi',
        description: 'Organisateur de bureau en bois avec 6 compartiments. Range stylos, telephone, telecommande, cles. Design minimaliste et elegant.',
        price: 6500,
        oldPrice: 9000,
        images: [
          'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=600&fit=crop',
        ],
        stock: 17,
        category: 'Maison',
        isFeatured: false,
        isActive: true,
      },

      // ---- ENFANTS (4 produits) ----
      {
        name: 'Robot Educatif Programmable',
        slug: 'robot-educatif-programmable',
        description: 'Robot interactif pour enfants 6-12 ans. Programmation par blocs, capteurs de mouvement, haut-parleur. Apprendre en s\'amusant ! Piles incluses.',
        price: 18000,
        oldPrice: 25000,
        images: [
          'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=600&fit=crop',
        ],
        stock: 9,
        category: 'Enfants',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Sac a Dos Enfant Safari',
        slug: 'sac-dos-enfant-safari',
        description: 'Sac a dos colore pour enfants 3-8 ans, motif animaux africains. Bretelles rembourrées, poche avant, materiau resistant a l\'eau. 10L.',
        price: 7500,
        oldPrice: null,
        images: [
          'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop',
        ],
        stock: 20,
        category: 'Enfants',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Kit Dessin Artiste Junior 120 Pieces',
        slug: 'kit-dessin-artiste-junior',
        description: 'Mallette complete : crayons de couleur, feutres, pastels, aquarelle, gomme, taille-crayon. 120 pieces dans une valise en bois.',
        price: 12000,
        oldPrice: 16000,
        images: [
          'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop',
        ],
        stock: 13,
        category: 'Enfants',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Jeu de Construction Magnetique 64pcs',
        slug: 'jeu-construction-magnetique',
        description: 'Blocs de construction magnetiques 64 pieces. Stimule creativite et motricite fine. Formes geometriques variees. Ages 3+. Boite de rangement incluse.',
        price: 14000,
        oldPrice: 20000,
        images: [
          'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=600&fit=crop',
        ],
        stock: 4,
        category: 'Enfants',
        isFeatured: false,
        isActive: true,
      },
    ],
  })

  console.log(`${products.count} produits crees`)

  // ============================================
  // ADMIN USER
  // ============================================
  const admin = await prisma.user.create({
    data: {
      phone: '+22990000001',
      name: 'Admin TOKOSSA',
      email: 'admin@tokossa.bj',
      role: 'admin',
    },
  })
  console.log(`Admin cree: ${admin.email}`)

  // ============================================
  // UTILISATEURS DE DEMO
  // ============================================
  const users = await prisma.user.createMany({
    data: [
      { phone: '+22996001234', name: 'Kevin Hounkpatin', quarter: 'Cadjehoun' },
      { phone: '+22997002345', name: 'Carine Ahouansou', email: 'carine@gmail.com', quarter: 'Akpakpa' },
      { phone: '+22995003456', name: 'Boris Dossou', quarter: 'Cotonou Centre' },
      { phone: '+22996004567', name: 'Felicia Agbangla', quarter: 'Godomey' },
      { phone: '+22997005678', name: 'Patrick Soglo', email: 'patrick.s@yahoo.fr', quarter: 'Fidjrosse' },
    ],
  })
  console.log(`${users.count} utilisateurs demo crees`)

  // ============================================
  // SALE NOTIFICATIONS (Social Proof)
  // ============================================
  const notifications = await prisma.saleNotification.createMany({
    data: [
      { productName: 'Ecouteurs Bluetooth Sans Fil Pro', customerName: 'Kevin H.', quarter: 'Cadjehoun' },
      { productName: 'Montre Connectee Sport', customerName: 'Carine A.', quarter: 'Akpakpa' },
      { productName: 'Robe Wax Traditionnelle Moderne', customerName: 'Felicia A.', quarter: 'Godomey' },
      { productName: 'Coffret Soin Visage Naturel', customerName: 'Amina K.', quarter: 'Fidjrosse' },
      { productName: 'Sac a Main Cuir Artisanal', customerName: 'Grace T.', quarter: 'Cotonou Centre' },
      { productName: 'Ventilateur Rechargeable USB', customerName: 'Boris D.', quarter: 'Calavi' },
      { productName: 'Robot Educatif Programmable', customerName: 'Patrick S.', quarter: 'Ganhi' },
      { productName: 'Halteres Reglables 2x10kg', customerName: 'Yves M.', quarter: 'Akpakpa' },
    ],
  })
  console.log(`${notifications.count} notifications social proof creees`)

  // ============================================
  // COMMANDES DE DEMO
  // ============================================
  const allProducts = await prisma.product.findMany({ take: 5 })

  if (allProducts.length >= 3) {
    // Commande 1 — Livree
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'TOK-20260301-ABCD',
        customerName: 'Kevin Hounkpatin',
        phone: '+22996001234',
        email: null,
        address: '123 Rue de la Marina',
        quarter: 'Cadjehoun',
        subtotal: allProducts[0].price + allProducts[1].price,
        deliveryFee: 0,
        total: allProducts[0].price + allProducts[1].price,
        status: 'DELIVERED',
        paymentMethod: 'MTN_MOBILE_MONEY',
        paymentRef: 'KKP-TEST-001',
        paidAt: new Date('2026-03-01T10:00:00Z'),
        deliveredAt: new Date('2026-03-02T14:00:00Z'),
        items: {
          create: [
            { productId: allProducts[0].id, quantity: 1, price: allProducts[0].price },
            { productId: allProducts[1].id, quantity: 1, price: allProducts[1].price },
          ],
        },
      },
    })

    // Commande 2 — En attente
    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'TOK-20260304-EFGH',
        customerName: 'Carine Ahouansou',
        phone: '+22997002345',
        email: 'carine@gmail.com',
        address: '45 Boulevard St-Michel',
        quarter: 'Akpakpa',
        subtotal: allProducts[2].price * 2,
        deliveryFee: 500,
        total: allProducts[2].price * 2 + 500,
        status: 'PENDING',
        paymentMethod: 'CASH_ON_DELIVERY',
        items: {
          create: [
            { productId: allProducts[2].id, quantity: 2, price: allProducts[2].price },
          ],
        },
      },
    })

    // Commande 3 — Confirmee
    const order3 = await prisma.order.create({
      data: {
        orderNumber: 'TOK-20260305-IJKL',
        customerName: 'Boris Dossou',
        phone: '+22995003456',
        address: '8 Avenue Clozel',
        quarter: 'Cotonou Centre',
        subtotal: allProducts[0].price + allProducts[3].price,
        deliveryFee: 0,
        total: allProducts[0].price + allProducts[3].price,
        status: 'CONFIRMED',
        paymentMethod: 'MOOV_MONEY',
        paymentRef: 'KKP-TEST-002',
        paidAt: new Date('2026-03-05T08:30:00Z'),
        items: {
          create: [
            { productId: allProducts[0].id, quantity: 1, price: allProducts[0].price },
            { productId: allProducts[3].id, quantity: 1, price: allProducts[3].price },
          ],
        },
      },
    })

    console.log(`3 commandes demo creees: ${order1.orderNumber}, ${order2.orderNumber}, ${order3.orderNumber}`)
  }

  // ============================================
  // CODES PROMO
  // ============================================
  await prisma.promoCode.deleteMany()
  const promos = await prisma.promoCode.createMany({
    data: [
      {
        code: 'BIENVENUE10',
        discount: 10,
        type: 'percent',
        minOrder: 5000,
        maxUses: 100,
        isActive: true,
        expiresAt: new Date('2026-12-31'),
      },
      {
        code: 'TOKOSSA500',
        discount: 500,
        type: 'fixed',
        minOrder: 3000,
        maxUses: 50,
        isActive: true,
        expiresAt: new Date('2026-06-30'),
      },
      {
        code: 'FLASH20',
        discount: 20,
        type: 'percent',
        minOrder: 10000,
        maxUses: 30,
        isActive: true,
        expiresAt: new Date('2026-04-30'),
      },
    ],
  })
  console.log(`${promos.count} codes promo crees`)

  // ============================================
  // AVIS CLIENTS DEMO
  // ============================================
  await prisma.review.deleteMany()
  if (allProducts.length >= 4) {
    const reviews = await prisma.review.createMany({
      data: [
        {
          productId: allProducts[0].id,
          phone: '+22901900000',
          name: 'Amina K.',
          rating: 5,
          comment: 'Ecouteurs de tres bonne qualite ! Le son est clair et la batterie dure longtemps. Je recommande a 100%.',
          isVerified: true,
        },
        {
          productId: allProducts[0].id,
          phone: '+22901900001',
          name: 'Roland A.',
          rating: 4,
          comment: 'Bon produit, livraison rapide. Le seul bemol c\'est que l\'etui est un peu fragile.',
          isVerified: true,
        },
        {
          productId: allProducts[1].id,
          phone: '+22901900002',
          name: 'Kevin D.',
          rating: 5,
          comment: 'Montre au top ! Le GPS fonctionne bien et l\'ecran est magnifique. Tres content de mon achat.',
          isVerified: true,
        },
        {
          productId: allProducts[2].id,
          phone: '+22901900003',
          name: 'Fatou B.',
          rating: 4,
          comment: 'Bon son pour le prix. La batterie tient bien toute la journee.',
          isVerified: true,
        },
        {
          productId: allProducts[3].id,
          phone: '+22901900004',
          name: 'Grace T.',
          rating: 5,
          comment: 'Parfait pour les coupures de courant ! Charge bien au soleil et le port USB-C est pratique.',
          isVerified: true,
        },
      ],
    })
    console.log(`${reviews.count} avis clients demo crees`)
  }

  console.log('\nSeed termine avec succes !')
}

main()
  .catch((e) => {
    console.error('Erreur seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
