'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

/**
 * Page de connexion admin TOKOSSA.
 * Utilise le provider NextAuth "admin" (email + mot de passe).
 * Design : fond indigo, carte blanche centree, logo bicolore.
 */
export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('admin', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-secondary-500 flex items-center justify-center p-4">
      {/* Carte de connexion */}
      <div className="w-full max-w-md">
        {/* Logo TOKOSSA bicolore */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-primary-500">TO</span>
            <span className="text-white">KOSSA</span>
          </h1>
          <p className="text-secondary-200 mt-2 text-sm">
            Administration
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-secondary-500 text-center mb-6">
            Connexion admin
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-warm-600 mb-1"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="admin@tokossa.bj"
                required
                autoComplete="email"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-warm-600 mb-1"
              >
                Mot de passe
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Votre mot de passe"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Bouton de soumission */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              Se connecter
            </Button>
          </form>

          {/* Lien retour boutique */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-warm-500 hover:text-primary-500 transition-colors"
            >
              Retour a la boutique
            </a>
          </div>
        </div>

        {/* Mention securite */}
        <p className="text-center text-secondary-300 text-xs mt-6">
          Acces reserve aux administrateurs TOKOSSA
        </p>
      </div>
    </div>
  )
}
