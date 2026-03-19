'use client'

import { useState, useEffect, useCallback } from 'react'

interface Testimonial {
  name: string
  quarter: string
  stars: number
  product: string
  date: string
  text: string
}

const testimonials: Testimonial[] = [
  { name: 'Amina K.', quarter: 'Cadjehoun', stars: 5, product: 'Ecouteurs Bluetooth Pro', date: 'Fev 2026', text: 'Livraison le lendemain comme promis ! Les ecouteurs sont top qualite. Mon 3eme achat sur TOKOSSA et toujours satisfaite.' },
  { name: 'Kevin D.', quarter: 'Akpakpa', stars: 5, product: 'Montre Connectee Sport', date: 'Jan 2026', text: "Service client reactif sur WhatsApp, ils m'ont aide a choisir la bonne taille. La montre est exactement comme sur les photos." },
  { name: 'Fatou B.', quarter: 'Godomey', stars: 4, product: 'Creme Hydratante Bio', date: 'Mars 2026', text: 'Paiement facile avec MTN MoMo, pas besoin de carte bancaire. Produit bien emballe et livre en bon etat a Godomey.' },
  { name: 'Roland A.', quarter: 'Calavi', stars: 5, product: 'Lampe LED Bureau', date: 'Fev 2026', text: "Je vis a Calavi et j'avais peur pour la livraison mais tout est arrive en 48h. Excellent rapport qualite-prix !" },
  { name: 'Grace T.', quarter: 'Seme-Kpodji', stars: 4, product: 'Sac a Dos Urbain', date: 'Jan 2026', text: "Tres beau sac, solide et spacieux. Le paiement a la livraison c'est vraiment pratique. Je recommande a tous." },
  { name: 'Yves M.', quarter: 'Fidjrosse', stars: 5, product: 'Tapis de Yoga Premium', date: 'Mars 2026', text: 'Commande passee le soir, livree le lendemain matin. Le tapis est epais et confortable. TOKOSSA est fiable !' },
]

const gradients = [
  'bg-gradient-to-br from-primary-400 to-primary-600',
  'bg-gradient-to-br from-secondary-400 to-secondary-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-amber-400 to-amber-600',
]

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100 min-w-[280px] snap-start text-left flex-shrink-0 w-[280px] md:w-auto md:min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${gradients[index % gradients.length]}`}>
          {t.name[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-secondary-500 text-sm">{t.name}</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verifie
            </span>
          </div>
          <p className="text-xs text-warm-400">{t.quarter} · {t.date}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className={`w-3.5 h-3.5 ${s <= t.stars ? 'text-accent-500' : 'text-warm-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-[11px] text-warm-400 mb-2">A achete : {t.product}</p>
      <p className="text-sm text-warm-600 leading-relaxed">{t.text}</p>
    </div>
  )
}

export default function TestimonialCarousel() {
  const [currentPage, setCurrentPage] = useState(0)
  const cardsPerPage = 3
  const totalPages = Math.ceil(testimonials.length / cardsPerPage)

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }, [totalPages])

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }, [totalPages])

  // Auto-play toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(nextPage, 5000)
    return () => clearInterval(interval)
  }, [nextPage])

  const visibleTestimonials = testimonials.slice(
    currentPage * cardsPerPage,
    currentPage * cardsPerPage + cardsPerPage
  )

  return (
    <>
      {/* Mobile : scroll horizontal */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar mt-8 pb-2 snap-x snap-mandatory md:hidden">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} t={t} index={i} />
        ))}
      </div>

      {/* Desktop : carrousel avec navigation */}
      <div className="hidden md:block mt-8">
        <div className="relative">
          {/* Bouton precedent */}
          <button
            onClick={prevPage}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-warm-100 flex items-center justify-center hover:bg-warm-50 transition-colors"
            aria-label="Temoignages precedents"
          >
            <svg className="w-5 h-5 text-warm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Grille de temoignages */}
          <div className="grid grid-cols-3 gap-4 transition-all duration-500">
            {visibleTestimonials.map((t, i) => (
              <TestimonialCard key={currentPage * cardsPerPage + i} t={t} index={currentPage * cardsPerPage + i} />
            ))}
          </div>

          {/* Bouton suivant */}
          <button
            onClick={nextPage}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-warm-100 flex items-center justify-center hover:bg-warm-50 transition-colors"
            aria-label="Temoignages suivants"
          >
            <svg className="w-5 h-5 text-warm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicateurs de page */}
        <div className="flex justify-center gap-1 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className="p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
              aria-label={`Page ${i + 1}`}
            >
              <span className={`block rounded-full transition-all duration-300 h-2.5 ${
                i === currentPage
                  ? 'bg-primary-500 w-8'
                  : 'bg-warm-300 hover:bg-warm-400 w-2.5'
              }`} />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
