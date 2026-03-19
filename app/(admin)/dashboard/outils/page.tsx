'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Page Outils & API admin TOKOSSA.
 * Permet de configurer graphiquement les cles API et integrations
 * sans toucher au code : KKiaPay, Twilio, Resend, Cloudinary, etc.
 */

/** Configuration des services avec leurs champs */
const API_SERVICES = [
  {
    id: 'kkiapay',
    name: 'KKiaPay',
    description: 'Paiement mobile (MTN, Moov, Wave)',
    color: 'bg-blue-500',
    fields: [
      { key: 'kkiapay_public_key', label: 'Public Key', type: 'text', secret: false },
      { key: 'kkiapay_private_key', label: 'Private Key', type: 'password', secret: true },
      { key: 'kkiapay_secret', label: 'Secret', type: 'password', secret: true },
      { key: 'kkiapay_sandbox', label: 'Mode Sandbox (test)', type: 'toggle', secret: false },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud API',
    description: 'Notifications WhatsApp via Meta Business (API officielle)',
    color: 'bg-green-500',
    fields: [
      { key: 'whatsapp_api_token', label: 'API Token (System User)', type: 'password', secret: true },
      { key: 'whatsapp_phone_number_id', label: 'Phone Number ID', type: 'text', secret: false },
      { key: 'admin_whatsapp_number', label: 'Numero admin (avec indicatif)', type: 'tel', secret: false },
    ],
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Envoi d\'emails transactionnels',
    color: 'bg-purple-500',
    fields: [
      { key: 'resend_api_key', label: 'API Key', type: 'password', secret: true },
      { key: 'resend_from_email', label: 'Email expediteur', type: 'email', secret: false },
    ],
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    description: 'Hebergement et optimisation d\'images',
    color: 'bg-orange-500',
    fields: [
      { key: 'cloudinary_cloud_name', label: 'Cloud Name', type: 'text', secret: false },
      { key: 'cloudinary_api_key', label: 'API Key', type: 'text', secret: false },
      { key: 'cloudinary_api_secret', label: 'API Secret', type: 'password', secret: true },
    ],
  },
  {
    id: 'facebook_ads',
    name: 'Facebook Ads',
    description: 'Connecter Meta Ads Manager pour le dashboard Marketing',
    color: 'bg-blue-600',
    fields: [
      { key: 'facebook_access_token', label: 'Access Token (System User)', type: 'password', secret: true },
      { key: 'facebook_ad_account_id', label: 'Ad Account ID (sans act_)', type: 'text', secret: false },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics & Tracking',
    description: 'Facebook Pixel, Sentry, Google Analytics',
    color: 'bg-indigo-500',
    fields: [
      { key: 'facebook_pixel_id', label: 'Facebook Pixel ID', type: 'text', secret: false },
      { key: 'sentry_dsn', label: 'Sentry DSN', type: 'text', secret: false },
      { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'text', secret: false },
    ],
  },
  {
    id: 'app',
    name: 'Application',
    description: 'Configuration generale de l\'app',
    color: 'bg-gray-500',
    fields: [
      { key: 'app_url', label: 'URL du site', type: 'url', secret: false },
      { key: 'nextauth_secret', label: 'NextAuth Secret', type: 'password', secret: true },
      { key: 'database_url', label: 'Database URL', type: 'password', secret: true },
    ],
  },
] as const

export default function OutilsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (err) {
      console.error('Erreur chargement:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
    } finally {
      setSaving(false)
    }
  }

  /** Verifier si un service est configure (au moins un champ rempli) */
  const isConfigured = (serviceId: string): boolean => {
    const service = API_SERVICES.find((s) => s.id === serviceId)
    if (!service) return false
    return service.fields.some((f) => settings[f.key] && settings[f.key] !== 'false')
  }

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tete */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outils & API</h1>
          <p className="text-gray-600">Configurez vos integrations et cles API</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          } disabled:opacity-50`}
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sauvegarde...
            </>
          ) : saved ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sauvegarde !
            </>
          ) : (
            'Sauvegarder'
          )}
        </button>
      </div>

      {/* Services */}
      <div className="space-y-3">
        {API_SERVICES.map((service) => {
          const configured = isConfigured(service.id)
          const expanded = expandedService === service.id

          return (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Header du service */}
              <button
                onClick={() => setExpandedService(expanded ? null : service.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${service.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                    {service.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                    configured
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {configured ? 'Configure' : 'Non configure'}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Formulaire du service */}
              {expanded && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                  <div className="space-y-4">
                    {service.fields.map((field) => (
                      <div key={field.key}>
                        <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>

                        {field.type === 'toggle' ? (
                          <button
                            onClick={() =>
                              handleChange(
                                field.key,
                                (settings[field.key] || 'false') === 'true' ? 'false' : 'true'
                              )
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              (settings[field.key] || 'false') === 'true' ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                (settings[field.key] || 'false') === 'true' ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        ) : (
                          <div className="relative max-w-lg">
                            <input
                              id={field.key}
                              type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                              value={settings[field.key] || ''}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              placeholder={`Entrez votre ${field.label.toLowerCase()}`}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none pr-12 font-mono"
                            />
                            {field.secret && (
                              <button
                                type="button"
                                onClick={() => toggleSecret(field.key)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showSecrets[field.key] ? (
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Note de securite */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Note importante</p>
            <p className="text-sm text-amber-700 mt-1">
              Les cles API sont stockees en base de donnees. Pour une securite optimale en production,
              utilisez les variables d&apos;environnement de votre hebergeur (Vercel, Railway...).
              Ces reglages permettent une configuration rapide sans toucher au code.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
