'use client'

import { useState, useEffect, useCallback } from 'react'

interface Variant {
  id: string
  name: string
  sku: string | null
  stock: number
  price: number | null
  options: Record<string, string>
  image: string | null
  isActive: boolean
}

interface VariantsEditorProps {
  productId: string
}

/** Options de variantes predefinies pour le marche beninois */
const VARIANT_TYPES = {
  taille: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  couleur: ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert', 'Jaune', 'Rose', 'Gris'],
  pointure: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
}

export default function VariantsEditor({ productId }: VariantsEditorProps) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Champs formulaire
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [stock, setStock] = useState('0')
  const [price, setPrice] = useState('')
  const [options, setOptions] = useState<Record<string, string>>({})

  const fetchVariants = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/variants?productId=${productId}`)
      if (res.ok) {
        const data = await res.json() as Variant[]
        setVariants(data)
      }
    } catch {
      setError('Erreur de chargement des variantes')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchVariants()
  }, [fetchVariants])

  // Auto-generer le nom depuis les options
  useEffect(() => {
    if (!editingId) {
      const parts = Object.values(options).filter(Boolean)
      if (parts.length > 0) {
        setName(parts.join(' - '))
      }
    }
  }, [options, editingId])

  const resetForm = () => {
    setName('')
    setSku('')
    setStock('0')
    setPrice('')
    setOptions({})
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const startEdit = (v: Variant) => {
    setName(v.name)
    setSku(v.sku || '')
    setStock(String(v.stock))
    setPrice(v.price ? String(v.price) : '')
    setOptions(v.options || {})
    setEditingId(v.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body = {
      ...(editingId ? { id: editingId } : { productId }),
      name: name.trim(),
      sku: sku.trim() || null,
      stock: parseInt(stock) || 0,
      price: price ? parseInt(price) : null,
      options,
    }

    try {
      const res = await fetch('/api/admin/variants', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        resetForm()
        fetchVariants()
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, variantName: string) => {
    if (!confirm(`Supprimer la variante "${variantName}" ?`)) return
    try {
      const res = await fetch(`/api/admin/variants?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchVariants()
      else setError('Erreur lors de la suppression')
    } catch {
      setError('Erreur de connexion')
    }
  }

  const updateOption = (key: string, value: string) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <div className="h-20 bg-warm-100 rounded-xl animate-pulse" />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">
            Variantes ({variants.length})
          </h3>
          <p className="text-xs text-gray-400">Tailles, couleurs, etc.</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => { resetForm(); setShowForm(true) }}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-warm-50 rounded-xl p-4 space-y-3 border border-warm-100">
          {/* Selecteurs d'options rapides */}
          <div className="space-y-2">
            {Object.entries(VARIANT_TYPES).map(([type, values]) => (
              <div key={type}>
                <label className="block text-xs font-medium text-warm-600 mb-1 capitalize">{type}</label>
                <div className="flex flex-wrap gap-1.5">
                  {values.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateOption(type, val)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        options[type] === val
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-warm-600 mb-1">Nom *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input text-sm"
                placeholder="Rouge - L"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-600 mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="form-input text-sm font-mono"
                placeholder="PROD-RDG-L"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-600 mb-1">Stock *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="form-input text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-600 mb-1">Prix (si different)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input text-sm"
                placeholder="Meme que le produit"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-primary-500 text-white text-sm rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button type="button" onClick={resetForm} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste des variantes */}
      {variants.length > 0 && (
        <div className="divide-y divide-warm-100 border border-warm-100 rounded-xl overflow-hidden">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-warm-50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{v.name}</span>
                  {!v.isActive && (
                    <span className="px-1.5 py-0.5 bg-warm-100 text-warm-500 text-[10px] rounded">Inactive</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Stock: {v.stock}</span>
                  {v.price && <span>{v.price.toLocaleString()} FCFA</span>}
                  {v.sku && <span className="font-mono">{v.sku}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => startEdit(v)}
                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(v.id, v.name)}
                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
