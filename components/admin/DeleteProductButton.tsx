'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Bouton de suppression (soft delete) d'un produit.
 * Envoie un DELETE /api/produits/[id] puis rafraichit la page.
 */

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Desactiver le produit "${productName}" ? Il ne sera plus visible dans la boutique.`
    )
    if (!confirmed) return

    setLoading(true)

    try {
      const response = await fetch(`/api/produits/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
        return
      }

      router.refresh()
    } catch {
      alert('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50 transition-colors"
    >
      {loading ? 'Suppression...' : 'Supprimer'}
    </button>
  )
}
