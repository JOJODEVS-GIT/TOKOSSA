// Email Integration - Resend.com
// Documentation: https://resend.com/docs

import { formatPrice } from './utils'

interface EmailParams {
  to: string
  subject: string
  html: string
}

// Envoyer un email via Resend
export async function sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM || 'noreply@tokossa.bj'

  if (!resendApiKey) {
    console.error('Resend API key not configured')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `TOKOSSA <${fromEmail}>`,
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      console.error('Email send failed:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

// Template email confirmation commande
export function getOrderConfirmationEmail(params: {
  customerName: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  deliveryFee: number
  total: number
  address: string
  quarter: string
}): string {
  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price)}</td>
      </tr>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background-color: #f97316; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">TOKOSSA</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Votre commande est confirmée !</p>
    </div>

    <!-- Content -->
    <div style="padding: 24px;">
      <p style="font-size: 16px; color: #374151;">Bonjour <strong>${params.customerName}</strong>,</p>
      <p style="font-size: 16px; color: #374151;">Merci pour votre commande ! Voici le récapitulatif :</p>

      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Numéro de commande</p>
        <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #f97316;">#${params.orderNumber}</p>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Produit</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qté</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="border-top: 2px solid #e5e7eb; padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #6b7280;">Sous-total</span>
          <span>${formatPrice(params.subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #6b7280;">Livraison</span>
          <span>${params.deliveryFee === 0 ? 'Gratuite' : formatPrice(params.deliveryFee)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 12px; padding-top: 12px; border-top: 2px solid #f97316;">
          <span>Total</span>
          <span style="color: #f97316;">${formatPrice(params.total)}</span>
        </div>
      </div>

      <!-- Delivery Info -->
      <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; font-weight: bold; color: #92400e;">📍 Adresse de livraison</p>
        <p style="margin: 8px 0 0; color: #92400e;">${params.address}, ${params.quarter}</p>
        <p style="margin: 8px 0 0; font-size: 14px; color: #92400e;">Livraison sous 24h maximum</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Des questions ? Contactez-nous sur WhatsApp</p>
      <p style="margin: 8px 0 0; font-size: 14px; color: #f97316; font-weight: bold;">TOKOSSA - E-commerce Bénin</p>
    </div>
  </div>
</body>
</html>
`
}
