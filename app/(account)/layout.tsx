'use client'

import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/shop/CartDrawer'

/**
 * Layout pour les pages compte (profil, commandes).
 * Utilise le meme Navbar / BottomNav / Footer que le shop
 * pour une navigation coherente et fluide.
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      {/* Navigation */}
      <Navbar />

      {/* Contenu principal */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Navigation mobile fixe */}
      <BottomNav />

      {/* Panier lateral */}
      <CartDrawer />
    </div>
  )
}
