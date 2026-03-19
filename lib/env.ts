/**
 * Validation des variables d'environnement au demarrage.
 * Empeche le build/deploy si une variable critique est manquante.
 *
 * Usage : importer ce fichier dans app/layout.tsx ou next.config.js
 */

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}\n` +
      `Ajoutez-la dans .env.local ou dans les settings Vercel.`
    )
  }
  return value
}

function getOptionalEnv(name: string, fallback: string = ''): string {
  return process.env[name] || fallback
}

/**
 * Variables d'environnement validees.
 * Appeler validateEnv() au demarrage pour verifier.
 */
export function validateEnv() {
  // Skip en mode test
  if (process.env.NODE_ENV === 'test') return

  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
  ]

  const missing = required.filter(name => !process.env[name])

  if (missing.length > 0) {
    console.error('===========================================')
    console.error('VARIABLES D\'ENVIRONNEMENT MANQUANTES :')
    missing.forEach(name => console.error(`  - ${name}`))
    console.error('===========================================')
    console.error('Ajoutez-les dans .env.local ou Vercel Dashboard')

    // En production, throw pour empecher le deploy
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Variables manquantes : ${missing.join(', ')}`)
    }
  }
}

/**
 * Objet avec toutes les variables, typees et validees.
 */
export const env = {
  // Base
  DATABASE_URL: getOptionalEnv('DATABASE_URL'),
  NODE_ENV: getOptionalEnv('NODE_ENV', 'development'),

  // Auth
  NEXTAUTH_SECRET: getOptionalEnv('NEXTAUTH_SECRET'),
  NEXTAUTH_URL: getOptionalEnv('NEXTAUTH_URL', 'http://localhost:3000'),

  // Admin
  ADMIN_EMAIL: getOptionalEnv('ADMIN_EMAIL'),

  // KKiaPay
  KKIAPAY_API_KEY: getOptionalEnv('KKIAPAY_API_KEY'),
  KKIAPAY_SECRET: getOptionalEnv('KKIAPAY_SECRET'),

  // Twilio
  TWILIO_ACCOUNT_SID: getOptionalEnv('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: getOptionalEnv('TWILIO_AUTH_TOKEN'),

  // Resend
  RESEND_API_KEY: getOptionalEnv('RESEND_API_KEY'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getOptionalEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),

  // Analytics
  FB_PIXEL_ID: getOptionalEnv('NEXT_PUBLIC_FB_PIXEL_ID'),

  // Sentry
  SENTRY_DSN: getOptionalEnv('NEXT_PUBLIC_SENTRY_DSN'),

  // Helpers
  isProduction: getOptionalEnv('NODE_ENV') === 'production',
  isDevelopment: getOptionalEnv('NODE_ENV') !== 'production',
}
