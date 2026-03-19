// KKiaPay Integration - Paiement Mobile Money Bénin
// Documentation: https://docs.kkiapay.me

export interface KKiapayConfig {
  publicKey: string
  privateKey: string
  sandbox: boolean
}

export interface PaymentInitParams {
  amount: number
  reason: string
  name: string
  phone: string
  email?: string
  orderId: string
  callback: string
}

export interface KKiapayTransaction {
  transactionId: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  amount: number
  phone: string
  fullname: string
  source: 'MTN' | 'MOOV' | 'CARD' | 'CELTIS'
  createdAt: string
}

// Configuration KKiaPay
export function getKKiapayConfig(): KKiapayConfig {
  return {
    publicKey: process.env.KKIAPAY_PUBLIC_KEY || '',
    privateKey: process.env.KKIAPAY_PRIVATE_KEY || '',
    sandbox: process.env.NODE_ENV !== 'production',
  }
}

// Vérifier une transaction côté serveur
export async function verifyTransaction(transactionId: string): Promise<KKiapayTransaction | null> {
  const config = getKKiapayConfig()

  try {
    const response = await fetch(`https://api.kkiapay.me/api/v1/transactions/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': config.privateKey,
      },
      body: JSON.stringify({ transactionId }),
    })

    if (!response.ok) {
      console.error('KKiaPay verification failed:', response.status)
      return null
    }

    const data = await response.json()
    return data as KKiapayTransaction
  } catch (error) {
    console.error('KKiaPay verification error:', error)
    return null
  }
}

// Script client pour initialiser le widget KKiaPay
export function getKKiapayScript(): string {
  return `
    <script src="https://cdn.kkiapay.me/k.js"></script>
  `
}

// Configuration widget client
export function getKKiapayWidgetConfig(params: PaymentInitParams) {
  const config = getKKiapayConfig()

  return {
    amount: params.amount,
    position: 'center' as const,
    callback: params.callback,
    data: params.orderId,
    theme: '#f97316', // Orange TOKOSSA
    key: config.publicKey,
    sandbox: config.sandbox,
    name: params.name,
    phone: params.phone,
    email: params.email || '',
    reason: params.reason,
  }
}
