'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/utils'
import Button from '@/components/ui/Button'
import VariantsEditor from '@/components/admin/VariantsEditor'

/**
 * Formulaire partage de creation/edition de produit.
 * Utilise en mode 'create' (formulaire vide) ou 'edit' (pre-rempli).
 * Genere le slug automatiquement depuis le nom.
 * Gere une liste dynamique d'URLs d'images.
 * Integre la generation IA de description et SEO via l'API Anthropic.
 */

/** Categories disponibles */
const CATEGORIES = [
  'Electronique',
  'Mode',
  'Beaute',
  'Sport',
  'Maison',
  'Enfants',
] as const

/** Donnees initiales du formulaire (pour le mode edition) */
interface ProductData {
  id: string
  name: string
  slug: string
  description: string
  price: number
  oldPrice: number | null
  images: string[]
  stock: number
  category: string
  isFeatured: boolean
  isActive: boolean
}

interface ProductFormProps {
  initialData?: ProductData
  action: 'create' | 'edit'
}

/** Reponse de l'API de generation IA */
interface GenerateDescriptionResponse {
  description: string
  shortDescription: string
  seoTitle: string
  seoDescription: string
}

export default function ProductForm({ initialData, action }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Champs du formulaire
  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [price, setPrice] = useState(initialData?.price?.toString() ?? '')
  const [oldPrice, setOldPrice] = useState(initialData?.oldPrice?.toString() ?? '')
  const [stock, setStock] = useState(initialData?.stock?.toString() ?? '0')
  const [category, setCategory] = useState(initialData?.category ?? CATEGORIES[0])
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [images, setImages] = useState<string[]>(initialData?.images ?? [''])
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  // Etat de la generation IA
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const [aiGenerated, setAiGenerated] = useState(false)
  const [lastAiResult, setLastAiResult] = useState<GenerateDescriptionResponse | null>(null)

  // Auto-generation du slug depuis le nom (uniquement en creation)
  useEffect(() => {
    if (action === 'create' && name) {
      setSlug(generateSlug(name))
    }
  }, [name, action])

  /** Upload un fichier image vers /api/upload */
  const handleUploadImage = async (index: number, file: File) => {
    setUploadingIndex(index)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json() as { url: string }
        updateImage(index, data.url)
      } else {
        const data = await res.json().catch(() => null) as { error?: string } | null
        setError(data?.error || 'Erreur lors de l\'upload. Verifiez que le fichier est une image valide.')
      }
    } catch {
      setError('Erreur de connexion lors de l\'upload')
    } finally {
      setUploadingIndex(null)
    }
  }

  /** Generer description + SEO via l'API IA */
  const handleGenerateDescription = async () => {
    if (!name.trim()) {
      setError('Entrez d\'abord le nom du produit')
      return
    }
    setGeneratingDesc(true)
    setError('')
    try {
      const res = await fetch('/api/admin/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: name.trim(),
          category,
          price: parseInt(price) || 0,
        }),
      })
      if (res.ok) {
        const data = await res.json() as GenerateDescriptionResponse
        setDescription(data.description)
        setLastAiResult(data)
        setAiGenerated(true)
      } else {
        setError('Erreur lors de la generation de la description')
      }
    } catch {
      setError('Erreur de connexion lors de la generation')
    } finally {
      setGeneratingDesc(false)
    }
  }

  /** Ajouter un champ image vide */
  const addImageField = () => {
    setImages((prev) => [...prev, ''])
  }

  /** Supprimer un champ image */
  const removeImageField = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  /** Mettre a jour une URL d'image */
  const updateImage = (index: number, value: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? value : img)))
  }

  /** Soumission du formulaire */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation basique
    if (!name.trim()) {
      setError('Le nom du produit est requis')
      setLoading(false)
      return
    }
    if (!description.trim()) {
      setError('La description est requise')
      setLoading(false)
      return
    }
    if (!price || parseInt(price) <= 0) {
      setError('Le prix doit etre superieur a 0')
      setLoading(false)
      return
    }

    // Filtrer les URLs vides
    const filteredImages = images.filter((img) => img.trim() !== '')

    const body = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      price: parseInt(price),
      oldPrice: oldPrice ? parseInt(oldPrice) : null,
      images: filteredImages,
      stock: parseInt(stock) || 0,
      category,
      isFeatured,
      isActive,
    }

    try {
      const url =
        action === 'create'
          ? '/api/produits'
          : `/api/produits/${initialData?.id}`

      const method = action === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      router.push('/dashboard/produits')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Section : Informations generales */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
          Informations generales
        </h2>

        {/* Nom */}
        <div>
          <label htmlFor="product-name" className="block text-sm font-medium text-warm-600 mb-1">
            Nom du produit *
          </label>
          <input
            id="product-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="Ex : Ecouteurs Bluetooth Pro"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="product-slug" className="block text-sm font-medium text-warm-600 mb-1">
            Slug (URL)
          </label>
          <input
            id="product-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="form-input font-mono text-sm"
            placeholder="ecouteurs-bluetooth-pro"
          />
          <p className="text-xs text-gray-400 mt-1">
            Genere automatiquement depuis le nom. Modifiable manuellement.
          </p>
        </div>

        {/* Description avec bouton IA */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="product-description" className="block text-sm font-medium text-warm-600">
              Description *
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generatingDesc || !name.trim()}
              className="text-xs font-medium text-primary-500 hover:text-primary-600 disabled:text-gray-300 flex items-center gap-1 transition-colors"
            >
              {generatingDesc ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generation en cours...
                </>
              ) : aiGenerated ? (
                <>&#10024; Regenerer avec IA</>
              ) : (
                <>&#10024; Generer avec IA</>
              )}
            </button>
          </div>
          <textarea
            id="product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input min-h-[120px] resize-y"
            placeholder="Decrivez le produit en detail..."
            required
            rows={4}
          />
        </div>

        {/* Resultat IA : description courte + SEO (affiches apres generation) */}
        {aiGenerated && lastAiResult && (
          <div className="bg-gradient-to-r from-primary-50 to-amber-50 border border-primary-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Contenu genere par IA
            </div>

            {/* Description courte */}
            <div>
              <p className="text-xs font-medium text-warm-600 mb-1">Description courte</p>
              <p className="text-sm text-warm-700 bg-white rounded-lg p-2 border border-warm-100">
                {lastAiResult.shortDescription}
              </p>
            </div>

            {/* Titre SEO */}
            <div>
              <p className="text-xs font-medium text-warm-600 mb-1">Titre SEO</p>
              <p className="text-sm text-warm-700 bg-white rounded-lg p-2 border border-warm-100 font-mono">
                {lastAiResult.seoTitle}
              </p>
              <p className="text-[10px] text-warm-400 mt-0.5">
                {lastAiResult.seoTitle.length} caracteres
              </p>
            </div>

            {/* Meta description SEO */}
            <div>
              <p className="text-xs font-medium text-warm-600 mb-1">Meta description SEO</p>
              <p className="text-sm text-warm-700 bg-white rounded-lg p-2 border border-warm-100">
                {lastAiResult.seoDescription}
              </p>
              <p className="text-[10px] text-warm-400 mt-0.5">
                {lastAiResult.seoDescription.length} caracteres
              </p>
            </div>
          </div>
        )}

        {/* Categorie */}
        <div>
          <label htmlFor="product-category" className="block text-sm font-medium text-warm-600 mb-1">
            Categorie *
          </label>
          <select
            id="product-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section : Prix et stock */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
          Prix et stock
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Prix */}
          <div>
            <label htmlFor="product-price" className="block text-sm font-medium text-warm-600 mb-1">
              Prix (FCFA) *
            </label>
            <input
              id="product-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="form-input"
              placeholder="15000"
              min="0"
              required
            />
          </div>

          {/* Ancien prix */}
          <div>
            <label htmlFor="product-old-price" className="block text-sm font-medium text-warm-600 mb-1">
              Ancien prix (optionnel)
            </label>
            <input
              id="product-old-price"
              type="number"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              className="form-input"
              placeholder="25000"
              min="0"
            />
            <p className="text-xs text-gray-400 mt-1">Pour afficher le prix barre</p>
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="product-stock" className="block text-sm font-medium text-warm-600 mb-1">
              Stock *
            </label>
            <input
              id="product-stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="form-input"
              placeholder="50"
              min="0"
              required
            />
          </div>
        </div>
      </div>

      {/* Section : Images */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-900">Images</h2>
          <button
            type="button"
            onClick={addImageField}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter une image
          </button>
        </div>

        <div className="space-y-3">
          {images.map((image, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* Preview miniature */}
              {image && (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="url"
                value={image}
                onChange={(e) => updateImage(index, e.target.value)}
                className="form-input flex-1"
                placeholder="URL de l'image ou utilisez le bouton upload"
              />
              {/* Bouton upload fichier */}
              <label className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors flex-shrink-0 ${
                uploadingIndex === index
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}>
                {uploadingIndex === index ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingIndex !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadImage(index, file)
                    e.target.value = ''
                  }}
                />
              </label>
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                  aria-label="Supprimer cette image"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400">
          Cliquez sur &quot;Upload&quot; pour envoyer un fichier, ou collez une URL directement. La premiere sera l&apos;image principale.
        </p>
      </div>

      {/* Section : Variantes (uniquement en mode edition) */}
      {action === 'edit' && initialData?.id && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <VariantsEditor productId={initialData.id} />
        </div>
      )}

      {/* Section : Options */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
          Options
        </h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Produit vedette</p>
            <p className="text-xs text-gray-400">Affiche en priorite sur la page d&apos;accueil</p>
          </div>
        </label>

        {action === 'edit' && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Produit actif</p>
              <p className="text-xs text-gray-400">Visible dans la boutique</p>
            </div>
          </label>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
        >
          {action === 'create' ? 'Creer le produit' : 'Enregistrer les modifications'}
        </Button>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
