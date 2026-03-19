// WhatsApp Business Cloud API (Meta) — API officielle directe
// Plus besoin de Twilio — connexion directe a Meta

import { formatPrice } from './utils'

export interface WhatsAppMessage {
  to: string
  template: string
  params: Record<string, string>
}

export type MessageTemplate =
  | 'order_confirmation'
  | 'order_delivering'
  | 'order_delivered'
  | 'cart_abandoned'
  | 'reactivation'
  | 'upsell'

// Templates de messages WhatsApp (texte libre)
export const MESSAGE_TEMPLATES: Record<MessageTemplate, (params: Record<string, string>) => string> = {
  order_confirmation: (p) => `Bonjour ${p.name} ! 🎉
Ta commande TOKOSSA #${p.orderNumber} est confirmée.
📦 ${p.products}
💰 Total : ${p.total}
🏠 Livraison : ${p.address}, ${p.quarter}
⏱️ Délai : 24h maximum
Merci de ta confiance ! 🙏`,

  order_delivering: (p) => `Bonjour ${p.name} ! 🛵
Ta commande #${p.orderNumber} est en route !
Notre livreur arrive dans ~${p.duration}.
📍 Assure-toi d'être disponible.
Contact livreur : ${p.deliveryPhone}`,

  order_delivered: (p) => `Commande livrée ! ✅
J'espère que tu es satisfait(e) ${p.name}.
Une note rapide nous aiderait beaucoup : ${p.reviewLink}
À bientôt sur TOKOSSA ! 🛍️`,

  cart_abandoned: (p) => `Hey ${p.name} 👋
Tu as laissé ${p.product} dans ton panier !
Il reste seulement ${p.stock} en stock. ⚡
Commander : ${p.link}
Des questions ? Réponds ici 😊`,

  reactivation: (p) => `${p.name}, c'est TOKOSSA ! 🔥
Nouveau produit qui va te plaire :
${p.product} — ${p.price}
Livraison demain à Cotonou 🚀
Voir : ${p.link}`,

  upsell: (p) => `Bonjour ${p.name} !
Les clients qui ont acheté ${p.boughtProduct}
adorent aussi ${p.suggestedProduct} ⭐
-10% pour toi ce week-end : ${p.code}
${p.link}`,
}

/**
 * Envoyer un message WhatsApp via l'API WhatsApp Business Cloud (Meta).
 *
 * Variables d'environnement requises :
 * - WHATSAPP_API_TOKEN : Token d'acces permanent (System User Token)
 * - WHATSAPP_PHONE_NUMBER_ID : ID du numero de telephone WhatsApp Business
 *
 * Documentation : https://developers.facebook.com/docs/whatsapp/cloud-api
 */
export async function sendWhatsAppMessage(
  phone: string,
  template: MessageTemplate,
  params: Record<string, string>
): Promise<boolean> {
  const message = MESSAGE_TEMPLATES[template](params)

  const apiToken = process.env.WHATSAPP_API_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!apiToken || !phoneNumberId) {
    console.warn('WhatsApp Business API non configuree (WHATSAPP_API_TOKEN ou WHATSAPP_PHONE_NUMBER_ID manquant)')
    // En dev, on log le message au lieu d'echouer
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 [WhatsApp DEV] Message pour', phone, ':', message)
      return true
    }
    return false
  }

  try {
    // Formater le numero : enlever le 0 initial et ajouter l'indicatif Benin (229)
    let formattedPhone = phone.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '229' + formattedPhone.substring(1)
    }
    if (!formattedPhone.startsWith('229')) {
      formattedPhone = '229' + formattedPhone
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('WhatsApp API error:', response.status, errorData)
      return false
    }

    const data = await response.json()
    console.log('WhatsApp message sent:', data.messages?.[0]?.id)
    return true
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return false
  }
}

/**
 * Envoyer un message WhatsApp avec template pre-approuve par Meta.
 * Necessaire pour envoyer des messages aux utilisateurs qui n'ont pas initie la conversation.
 *
 * Les templates doivent etre crees et approuves dans le Meta Business Manager.
 */
export async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  languageCode: string = 'fr',
  components: Array<{
    type: 'body' | 'header' | 'button'
    parameters: Array<{ type: 'text'; text: string }>
  }> = []
): Promise<boolean> {
  const apiToken = process.env.WHATSAPP_API_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!apiToken || !phoneNumberId) {
    console.warn('WhatsApp Business API non configuree')
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 [WhatsApp DEV] Template', templateName, 'pour', phone)
      return true
    }
    return false
  }

  try {
    let formattedPhone = phone.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '229' + formattedPhone.substring(1)
    }
    if (!formattedPhone.startsWith('229')) {
      formattedPhone = '229' + formattedPhone
    }

    const body: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components.length > 0 ? { components } : {}),
      },
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('WhatsApp template error:', response.status, errorData)
      return false
    }

    return true
  } catch (error) {
    console.error('WhatsApp template error:', error)
    return false
  }
}

// Generer lien WhatsApp pour commander (fallback)
export function generateOrderWhatsAppLink(
  productName: string,
  price: number,
  quantity: number = 1
): string {
  const businessPhone = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS || '22990000000'
  const message = `Bonjour TOKOSSA ! 👋
Je souhaite commander :
📦 ${productName}
💰 Prix : ${formatPrice(price)}
📊 Quantité : ${quantity}

Merci de me confirmer la disponibilité !`

  return `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`
}

// Notifier admin d'une nouvelle commande
export async function notifyAdminNewOrder(orderDetails: {
  orderNumber: string
  customerName: string
  phone: string
  total: number
  quarter: string
  paymentMethod: string
}): Promise<boolean> {
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER

  if (!adminPhone) {
    console.error('Admin WhatsApp number not configured')
    return false
  }

  return sendWhatsAppMessage(adminPhone, 'order_confirmation', {
    name: 'Admin',
    orderNumber: orderDetails.orderNumber,
    products: `Voir dashboard`,
    total: formatPrice(orderDetails.total),
    address: orderDetails.quarter,
    quarter: '',
  })
}
