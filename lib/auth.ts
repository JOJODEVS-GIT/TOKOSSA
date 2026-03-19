import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'

// ============================================
// Rate limiting en mémoire pour le login admin
// Utilise l'email comme clé (acceptable : 1 seule instance admin)
// ============================================

interface LoginAttemptEntry {
  count: number
  resetAt: number
}

const loginAttempts = new Map<string, LoginAttemptEntry>()

/**
 * Vérifie si un email peut tenter un login.
 * Max 5 tentatives par fenêtre de 60 secondes.
 * Retourne true si autorisé, false si bloqué.
 */
function checkLoginRateLimit(email: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(email)

  if (!entry || now > entry.resetAt) {
    // Première tentative ou fenêtre expirée : on repart à 1
    loginAttempts.set(email, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (entry.count >= 5) {
    // Limite atteinte
    return false
  }

  entry.count++
  return true
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Authentification par téléphone (OTP via WhatsApp)
    CredentialsProvider({
      id: 'phone',
      name: 'Téléphone',
      credentials: {
        phone: { label: 'Téléphone', type: 'tel' },
        otp: { label: 'Code OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          return null
        }

        // TODO: Vérifier le code OTP via WhatsApp/SMS
        // SECURITE : OTP dev bypass actif UNIQUEMENT en developpement
        if (process.env.NODE_ENV === 'development' && credentials.otp === '123456') {
          console.warn(
            '⚠️ SECURITE: OTP dev bypass utilise pour ' + credentials.phone +
            '. Ce bypass est DESACTIVE en production.'
          )
          // Trouver ou créer l'utilisateur
          let user = await prisma.user.findUnique({
            where: { phone: credentials.phone },
          })

          if (!user) {
            user = await prisma.user.create({
              data: { phone: credentials.phone },
            })
          }

          return {
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        }

        return null
      },
    }),

    // Authentification admin (email/password)
    CredentialsProvider({
      id: 'admin',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // SECURITE : Rate limiting — max 5 tentatives par minute par email admin
        if (!checkLoginRateLimit(credentials.email)) {
          throw new Error('Trop de tentatives de connexion. Réessayez dans une minute.')
        }

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminEmail || !adminPassword) return null

        // SECURITE : Refuser la connexion en production si le password n'est pas hashé bcrypt
        if (process.env.NODE_ENV === 'production' && !adminPassword.startsWith('$2')) {
          console.error('SECURITE CRITIQUE: ADMIN_PASSWORD doit etre hash bcrypt en production')
          return null
        }

        // Support bcrypt hash ($2a$/$2b$) ou comparaison constante pour texte brut
        const isPasswordValid = adminPassword.startsWith('$2')
          ? await bcrypt.compare(credentials.password, adminPassword)
          : credentials.password === adminPassword

        if (credentials.email === adminEmail && isPasswordValid) {
          return {
            id: 'admin',
            email: adminEmail,
            name: 'Admin TOKOSSA',
            role: 'admin',
          }
        }

        return null
      },
    }),
  ],

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = (user as { phone?: string }).phone
        token.role = (user as { role?: string }).role
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
        (session.user as { phone?: string }).phone = token.phone as string
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
}
