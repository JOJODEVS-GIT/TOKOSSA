'use client'

import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import AnnounceBanner from '@/components/layout/AnnounceBanner'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/shop/CartDrawer'
import dynamic from 'next/dynamic'

const LiveNotification = dynamic(() => import('@/components/shop/LiveNotification'), {
  ssr: false,
})
const RecentlyViewed = dynamic(() => import('@/components/shop/RecentlyViewed'), {
  ssr: false,
})
const FloatingWhatsApp = dynamic(() => import('@/components/ui/FloatingWhatsApp'), {
  ssr: false,
})

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      {/* Banniere annonces ticker */}
      <AnnounceBanner />

      {/* Navigation */}
      <Navbar />

      {/* Contenu principal */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Produits recemment consultes */}
      <RecentlyViewed />

      {/* Footer */}
      <Footer />

      {/* Navigation mobile fixe */}
      <BottomNav />

      {/* Panier lateral */}
      <CartDrawer />

      {/* Notifications social proof */}
      <LiveNotification />

      {/* Bouton WhatsApp flottant */}
      <FloatingWhatsApp />
    </div>
  )
}
