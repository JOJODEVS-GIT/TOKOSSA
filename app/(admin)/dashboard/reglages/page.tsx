'use client'

import { useState, useEffect, useCallback } from 'react'
import { QUARTIERS_COTONOU } from '@/lib/utils'

/**
 * Page de reglages admin TOKOSSA.
 * Permet de configurer : nom boutique, frais de livraison,
 * commande minimum, messages WhatsApp, seuil stock, fidelite, etc.
 */

/** Cles de reglages avec leurs labels et valeurs par defaut */
const SETTINGS_CONFIG = [
  {
    section: 'Boutique',
    fields: [
      { key: 'store_name', label: 'Nom de la boutique', type: 'text', default: 'TOKOSSA', placeholder: 'TOKOSSA' },
      { key: 'store_description', label: 'Description courte', type: 'text', default: 'E-commerce Benin', placeholder: 'Votre description...' },
      { key: 'store_phone', label: 'Telephone principal', type: 'tel', default: '', placeholder: '+229 01 97 00 00 00' },
      { key: 'store_email', label: 'Email de contact', type: 'email', default: '', placeholder: 'contact@tokossa.bj' },
    ],
  },
  {
    section: 'Commandes',
    fields: [
      { key: 'min_order_amount', label: 'Montant minimum de commande (FCFA)', type: 'number', default: '0', placeholder: '5000' },
      { key: 'cash_on_delivery_enabled', label: 'Activer le paiement a la livraison', type: 'toggle', default: 'true' },
      { key: 'split_payment_enabled', label: 'Activer le paiement en 2 fois', type: 'toggle', default: 'true' },
    ],
  },
  {
    section: 'Stock',
    fields: [
      { key: 'stock_alert_threshold', label: 'Seuil d\'alerte stock bas', type: 'number', default: '5', placeholder: '5' },
      { key: 'hide_out_of_stock', label: 'Masquer les produits en rupture', type: 'toggle', default: 'false' },
    ],
  },
  {
    section: 'Fidelite',
    fields: [
      { key: 'loyalty_enabled', label: 'Activer le programme de fidelite', type: 'toggle', default: 'true' },
      { key: 'loyalty_points_per_1000', label: 'Points gagnes par 1000 FCFA depense', type: 'number', default: '10', placeholder: '10' },
      { key: 'loyalty_point_value', label: 'Valeur d\'un point en FCFA', type: 'number', default: '10', placeholder: '10' },
    ],
  },
  {
    section: 'Messages WhatsApp',
    fields: [
      { key: 'whatsapp_confirmation_msg', label: 'Message de confirmation commande', type: 'textarea', default: 'Bonjour {name}, votre commande #{orderNumber} est confirmee ! Total : {total}. Livraison a {address}.', placeholder: 'Utilisez {name}, {orderNumber}, {total}, {address}...' },
      { key: 'whatsapp_delivery_msg', label: 'Message de mise en livraison', type: 'textarea', default: 'Bonjour {name}, votre commande #{orderNumber} est en cours de livraison ! Estimee dans {duration}.', placeholder: 'Utilisez {name}, {orderNumber}, {duration}...' },
      { key: 'whatsapp_delivered_msg', label: 'Message de livraison effectuee', type: 'textarea', default: 'Bonjour {name}, votre commande #{orderNumber} a ete livree ! Merci pour votre confiance.', placeholder: 'Utilisez {name}, {orderNumber}...' },
    ],
  },
] as const

type SettingsKey = typeof SETTINGS_CONFIG[number]['fields'][number]['key']

export default function ReglagesPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [deliveryFees, setDeliveryFees] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        // Charger les frais de livraison depuis les settings
        const fees: Record<string, string> = {}
        for (const q of QUARTIERS_COTONOU) {
          fees[q] = data[`delivery_fee_${q}`] || ''
        }
        setDeliveryFees(fees)
      }
    } catch (err) {
      console.error('Erreur chargement reglages:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const getValue = (key: string, defaultVal: string): string => {
    return settings[key] ?? defaultVal
  }

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Merge les frais de livraison dans les settings
      const allSettings = { ...settings }
      for (const [quarter, fee] of Object.entries(deliveryFees)) {
        if (fee) allSettings[`delivery_fee_${quarter}`] = fee
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allSettings),
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tete */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reglages</h1>
          <p className="text-gray-600">Configurez votre boutique TOKOSSA</p>
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

      {/* Sections de reglages */}
      {SETTINGS_CONFIG.map((section) => (
        <div key={section.section} className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {section.section}
          </h2>

          <div className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>

                {field.type === 'toggle' ? (
                  <button
                    onClick={() =>
                      handleChange(
                        field.key,
                        getValue(field.key, field.default) === 'true' ? 'false' : 'true'
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      getValue(field.key, field.default) === 'true' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        getValue(field.key, field.default) === 'true' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                ) : field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    rows={3}
                    value={getValue(field.key, field.default)}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.type as string}
                    value={getValue(field.key, field.default)}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder as string}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none max-w-md"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Frais de livraison par quartier */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Frais de livraison par quartier</h2>
        <p className="text-sm text-gray-500 mb-4">
          Definissez les frais de livraison en FCFA pour chaque quartier. Laissez vide pour utiliser les valeurs par defaut.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUARTIERS_COTONOU.map((quarter) => (
            <div key={quarter} className="flex items-center gap-2">
              <label className="text-sm text-gray-700 w-32 flex-shrink-0">{quarter}</label>
              <input
                type="number"
                min="0"
                step="100"
                value={deliveryFees[quarter] || ''}
                onChange={(e) => {
                  setDeliveryFees((prev) => ({ ...prev, [quarter]: e.target.value }))
                  setSaved(false)
                }}
                placeholder="Auto"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <span className="text-xs text-gray-400">FCFA</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
