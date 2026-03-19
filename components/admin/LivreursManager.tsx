'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Composant Client pour la gestion interactive des livreurs.
 * Gere : ajout, toggle actif/inactif, suppression avec confirmation.
 * Recoit la liste initiale des livreurs depuis le Server Component parent.
 */

/** Type livreur depuis Prisma */
interface DeliveryPerson {
  id: string
  name: string
  phone: string
  zone: string
  isActive: boolean
  totalDeliveries: number
  createdAt: string
  updatedAt: string
}

interface LivreursManagerProps {
  initialLivreurs: DeliveryPerson[]
}

export default function LivreursManager({ initialLivreurs }: LivreursManagerProps) {
  const router = useRouter()
  const [livreurs, setLivreurs] = useState<DeliveryPerson[]>(initialLivreurs)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Champs du formulaire
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formZone, setFormZone] = useState('')
  const [formError, setFormError] = useState('')

  /** Ajouter un nouveau livreur */
  const handleAdd = async () => {
    if (!formName.trim() || !formPhone.trim() || !formZone.trim()) {
      setFormError('Tous les champs sont obligatoires')
      return
    }

    setLoading(true)
    setFormError('')

    try {
      const res = await fetch('/api/admin/delivery-persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          phone: formPhone.trim(),
          zone: formZone.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || 'Erreur lors de la creation')
        return
      }

      const newLivreur = await res.json()
      setLivreurs((prev) => [...prev, newLivreur].sort((a, b) => a.name.localeCompare(b.name)))
      setFormName('')
      setFormPhone('')
      setFormZone('')
      setShowForm(false)
      router.refresh()
    } catch {
      setFormError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  /** Toggle actif/inactif */
  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/delivery-persons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (res.ok) {
        setLivreurs((prev) =>
          prev.map((l) => (l.id === id ? { ...l, isActive: !currentStatus } : l))
        )
        router.refresh()
      }
    } catch {
      console.error('Erreur lors du toggle')
    }
  }

  /** Supprimer un livreur */
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/delivery-persons/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setLivreurs((prev) => prev.filter((l) => l.id !== id))
        setDeleteConfirmId(null)
        router.refresh()
      }
    } catch {
      console.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tete avec bouton ajouter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Livreurs</h1>
          <p className="text-gray-600">
            {livreurs.length} livreur{livreurs.length > 1 ? 's' : ''} enregistre{livreurs.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium text-sm hover:bg-primary-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouveau livreur</h2>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="livreur-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                id="livreur-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Koffi Mensah"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="livreur-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telephone
              </label>
              <input
                id="livreur-phone"
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+229 01 97 00 00 00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="livreur-zone" className="block text-sm font-medium text-gray-700 mb-1">
                Zone de livraison
              </label>
              <input
                id="livreur-zone"
                type="text"
                value={formZone}
                onChange={(e) => setFormZone(e.target.value)}
                placeholder="Cotonou Centre"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le livreur'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setFormError('')
              }}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des livreurs */}
      {livreurs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
          <p className="text-gray-500 text-lg">Aucun livreur enregistre</p>
          <p className="text-gray-400 text-sm mt-2">
            Cliquez sur &quot;Ajouter&quot; pour enregistrer votre premier livreur
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* En-tete du tableau (desktop) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Nom</div>
            <div className="col-span-2">Telephone</div>
            <div className="col-span-2">Zone</div>
            <div className="col-span-1">Statut</div>
            <div className="col-span-2">Livraisons</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Lignes du tableau */}
          <div className="divide-y">
            {livreurs.map((livreur) => (
              <div
                key={livreur.id}
                className="px-6 py-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0"
              >
                {/* Nom avec avatar */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    livreur.isActive
                      ? 'bg-gradient-to-br from-primary-400 to-primary-600'
                      : 'bg-gray-300'
                  }`}>
                    {livreur.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{livreur.name}</p>
                </div>

                {/* Telephone */}
                <div className="col-span-2">
                  <p className="text-sm text-gray-700">{livreur.phone}</p>
                </div>

                {/* Zone */}
                <div className="col-span-2">
                  <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {livreur.zone}
                  </span>
                </div>

                {/* Statut toggle */}
                <div className="col-span-1">
                  <button
                    onClick={() => handleToggle(livreur.id, livreur.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      livreur.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    aria-label={livreur.isActive ? 'Desactiver le livreur' : 'Activer le livreur'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        livreur.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Nombre de livraisons */}
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {livreur.totalDeliveries} livraison{livreur.totalDeliveries > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${livreur.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${livreur.name.split(' ')[0]}, vous avez une nouvelle livraison TOKOSSA.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    aria-label="Contacter par WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>

                  {/* Supprimer */}
                  {deleteConfirmId === livreur.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(livreur.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(livreur.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      aria-label="Supprimer le livreur"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
