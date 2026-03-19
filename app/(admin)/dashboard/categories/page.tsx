'use client'

import { useState, useEffect, useCallback } from 'react'
import { generateSlug } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  description: string | null
  isActive: boolean
  order: number
  _count: { products: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Champs du formulaire
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [order, setOrder] = useState(0)
  const [saving, setSaving] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json() as Category[]
        setCategories(data)
      }
    } catch {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Auto-generation slug
  useEffect(() => {
    if (!editingId && name) {
      setSlug(generateSlug(name))
    }
  }, [name, editingId])

  const resetForm = () => {
    setName('')
    setSlug('')
    setImage('')
    setDescription('')
    setIsActive(true)
    setOrder(0)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const startEdit = (cat: Category) => {
    setName(cat.name)
    setSlug(cat.slug)
    setImage(cat.image || '')
    setDescription(cat.description || '')
    setIsActive(cat.isActive)
    setOrder(cat.order)
    setEditingId(cat.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body = { name: name.trim(), slug: slug.trim(), image: image || null, description: description || null, isActive, order }

    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        resetForm()
        fetchCategories()
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Supprimer la categorie "${catName}" ?`)) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCategories()
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur de connexion')
    }
  }

  const toggleActive = async (cat: Category) => {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !cat.isActive }),
    })
    fetchCategories()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-warm-200 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-warm-200 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categorie{categories.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle categorie
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Fermer</button>
        </div>
      )}

      {/* Formulaire creation/edition */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4 border border-warm-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Modifier la categorie' : 'Nouvelle categorie'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">Nom *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Ex : Electronique"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="form-input font-mono text-sm"
                placeholder="electronique"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1">Image (URL optionnelle)</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="form-input"
              placeholder="https://res.cloudinary.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1">Description (optionnelle)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input resize-y min-h-[60px]"
              placeholder="Courte description de la categorie"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">Ordre d&apos;affichage</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                className="form-input w-24"
                min="0"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Enregistrement...' : editingId ? 'Modifier' : 'Creer'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste des categories */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-lg font-medium">Aucune categorie</p>
            <p className="text-sm mt-1">Cliquez sur &quot;Nouvelle categorie&quot; pour commencer</p>
          </div>
        ) : (
          <div className="divide-y divide-warm-100">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 p-4 hover:bg-warm-50 transition-colors">
                {/* Image miniature */}
                <div className="w-12 h-12 rounded-xl bg-warm-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-warm-300">
                      {cat.name[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{cat.name}</h3>
                    {!cat.isActive && (
                      <span className="px-2 py-0.5 bg-warm-100 text-warm-500 text-xs rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    /{cat.slug} — {cat._count.products} produit{cat._count.products > 1 ? 's' : ''}
                    {cat.order > 0 && <span className="ml-2">Ordre : {cat.order}</span>}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(cat)}
                    className={`p-2 rounded-lg transition-colors ${
                      cat.isActive
                        ? 'text-green-500 hover:bg-green-50'
                        : 'text-gray-300 hover:bg-gray-50'
                    }`}
                    title={cat.isActive ? 'Desactiver' : 'Activer'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
