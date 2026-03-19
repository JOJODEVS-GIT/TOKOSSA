'use client'

/**
 * AnalyticsPanel — Panneau d'analytics avances pour le dashboard admin TOKOSSA.
 *
 * Affiche :
 * - Selecteur de periode (7 / 30 / 90 jours)
 * - KPI cards avec variation vs periode precedente
 * - Graphique barres CSS du CA (par jour ou semaine)
 * - Top 5 produits vendus
 * - Top 5 quartiers de livraison
 */

import { useState, useEffect, useCallback } from 'react'
import type { AnalyticsResponse } from '@/app/api/admin/analytics/route'

// ============================================================
// Types locaux
// ============================================================

type Period = 7 | 30 | 90

interface PeriodOption {
  value: Period
  label: string
}

// ============================================================
// Constantes
// ============================================================

const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 7, label: '7 jours' },
  { value: 30, label: '30 jours' },
  { value: 90, label: '90 jours' },
]

/** Couleurs alternees pour les barres du top produits */
const PRODUCT_BAR_COLORS = [
  'bg-orange-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
]

// ============================================================
// Utilitaires
// ============================================================

/** Formate un montant en FCFA */
function formatPrice(amount: number): string {
  return (
    new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA'
  )
}

/** Retourne les classes CSS de couleur selon le signe de la variation */
function variationColor(value: number): string {
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-500'
  return 'text-gray-500'
}

/** Formatte une variation avec son signe et son symbole % */
function formatVariation(value: number): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value}%`
}

// ============================================================
// Sous-composants
// ============================================================

/**
 * KpiCard — Carte KPI avec titre, valeur, variation vs periode precedente.
 */
function KpiCard({
  title,
  value,
  variation,
  subtitle,
  accentClass,
}: {
  title: string
  value: string
  variation: number | null
  subtitle?: string
  accentClass: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
      <p className={`text-xl font-bold mt-1 ${accentClass}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      )}
      {variation !== null && (
        <p className={`text-xs font-medium mt-2 ${variationColor(variation)}`}>
          {formatVariation(variation)} vs periode precedente
        </p>
      )}
    </div>
  )
}

/**
 * BarChart — Graphique barres CSSpur.
 * Affiche jusqu'a 30 barres, avec labels tournants si > 15 barres.
 */
function BarChart({
  data,
  period,
}: {
  data: AnalyticsResponse['dailyRevenue']
  period: Period
}) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1)

  // Pour 30 jours, n'afficher qu'un label sur 5 pour eviter la surcharge
  const showLabel = (index: number): boolean => {
    if (period === 7) return true
    if (period === 30) return index % 5 === 0 || index === data.length - 1
    return true // 90 jours = semaines, toujours afficher
  }

  if (maxAmount <= 1) {
    return (
      <p className="text-center text-gray-400 py-8 text-sm">
        Aucune donnee pour cette periode
      </p>
    )
  }

  return (
    <div
      className="flex items-end justify-between gap-1"
      style={{ height: '200px' }}
      role="img"
      aria-label="Graphique du chiffre d'affaires"
    >
      {data.map((bucket, index) => {
        const heightPercent =
          maxAmount > 0 ? (bucket.amount / maxAmount) * 100 : 0
        const hasValue = bucket.amount > 0

        return (
          <div
            key={bucket.date}
            className="flex-1 flex flex-col items-center gap-1 group"
            title={
              hasValue
                ? `${bucket.label} : ${formatPrice(bucket.amount)}`
                : `${bucket.label} : aucune vente`
            }
          >
            {/* Valeur au survol — visible uniquement si > 0 */}
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
              {hasValue ? formatPrice(bucket.amount) : ''}
            </span>

            {/* Zone de barre */}
            <div
              className="w-full flex items-end"
              style={{ height: '160px' }}
            >
              <div
                className="w-full rounded-t-md transition-all duration-300"
                style={{
                  height: `${Math.max(heightPercent, hasValue ? 3 : 1)}%`,
                  background: hasValue
                    ? 'linear-gradient(to top, #f97316, #fb923c)'
                    : '#e5e7eb',
                }}
              />
            </div>

            {/* Label */}
            <span
              className={`text-xs font-medium text-gray-400 ${
                showLabel(index) ? '' : 'invisible'
              }`}
            >
              {bucket.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * TopProductsList — Liste des 5 produits les plus vendus avec barres de progression.
 */
function TopProductsList({
  products,
}: {
  products: AnalyticsResponse['topProducts']
}) {
  if (products.length === 0) {
    return (
      <p className="text-center text-gray-400 py-6 text-sm">
        Aucune vente sur la periode
      </p>
    )
  }

  const maxQty = Math.max(...products.map((p) => p.quantity), 1)

  return (
    <div className="space-y-4">
      {products.map((product, index) => {
        const percentage = (product.quantity / maxQty) * 100
        const barColor = PRODUCT_BAR_COLORS[index] ?? 'bg-gray-400'

        return (
          <div key={`${product.name}-${index}`} className="flex items-center gap-3">
            {/* Rang */}
            <span className="text-base font-bold text-gray-200 w-5 flex-shrink-0 text-right">
              {index + 1}
            </span>

            {/* Nom + barre */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {product.quantity} vendu{product.quantity > 1 ? 's' : ''}
                  </span>
                  <span className="text-xs font-semibold text-gray-700">
                    {formatPrice(product.revenue)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.max(percentage, 3)}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * TopQuartersList — Top 5 quartiers de Cotonou par volume de commandes.
 */
function TopQuartersList({
  quarters,
}: {
  quarters: AnalyticsResponse['topQuarters']
}) {
  if (quarters.length === 0) {
    return (
      <p className="text-center text-gray-400 py-6 text-sm">
        Aucune donnee de quartier sur la periode
      </p>
    )
  }

  const maxOrders = Math.max(...quarters.map((q) => q.orders), 1)

  return (
    <div className="space-y-3">
      {quarters.map((quarter, index) => {
        const percentage = (quarter.orders / maxOrders) * 100
        const rankColors = [
          'text-yellow-500',
          'text-gray-400',
          'text-amber-600',
          'text-gray-500',
          'text-gray-500',
        ]

        return (
          <div key={quarter.name} className="flex items-center gap-3">
            <span
              className={`text-sm font-bold w-5 flex-shrink-0 text-right ${
                rankColors[index] ?? 'text-gray-400'
              }`}
            >
              #{index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {quarter.name}
                </p>
                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {quarter.orders} cmd{quarter.orders > 1 ? 's' : ''}
                  </span>
                  <span className="text-xs font-semibold text-orange-600">
                    {formatPrice(quarter.revenue)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-orange-400 transition-all duration-500"
                  style={{ width: `${Math.max(percentage, 3)}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// Composant principal
// ============================================================

/**
 * AnalyticsPanel — Point d'entree du panneau analytics avances.
 * Charge les donnees via /api/admin/analytics?period=X.
 */
export default function AnalyticsPanel() {
  const [period, setPeriod] = useState<Period>(30)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (p: Period) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/analytics?period=${p}`, {
        // Cache court : 2 minutes, le dashboard admin tolere une legere latence
        next: { revalidate: 120 },
      })

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`)
      }

      const json = (await res.json()) as AnalyticsResponse
      setData(json)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur de chargement'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Charger au montage et a chaque changement de periode
  useEffect(() => {
    void fetchAnalytics(period)
  }, [period, fetchAnalytics])

  // Label de comparaison pour les KPI
  const comparisonLabel =
    period === 7
      ? '7 j. precedents'
      : period === 30
        ? '30 j. precedents'
        : '90 j. precedents'

  return (
    <section aria-label="Analytics avances" className="space-y-6">
      {/* En-tete avec titre et selecteur de periode */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Analytics avances</h2>
          <p className="text-sm text-gray-500">
            Performance sur la periode selectionnee vs periode precedente
          </p>
        </div>

        {/* Selecteur de periode */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1 self-start sm:self-auto">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === opt.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={period === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Etat d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          Impossible de charger les analytics : {error}
          <button
            onClick={() => void fetchAnalytics(period)}
            className="ml-3 underline hover:no-underline"
          >
            Reessayer
          </button>
        </div>
      )}

      {/* KPI Cards — squelettes pendant le chargement */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          // Squelettes de chargement
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm animate-pulse"
            >
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : data ? (
          <>
            <KpiCard
              title="CA total"
              value={formatPrice(data.revenue)}
              variation={data.revenueVariation}
              accentClass="text-orange-500"
            />
            <KpiCard
              title="Commandes"
              value={String(data.orders)}
              variation={data.ordersVariation}
              subtitle={`vs ${comparisonLabel}`}
              accentClass="text-gray-900"
            />
            <KpiCard
              title="Panier moyen"
              value={formatPrice(data.averageCart)}
              variation={null}
              subtitle="Par commande (hors annulations)"
              accentClass="text-blue-600"
            />
            <KpiCard
              title="Taux de conversion"
              value={`${data.conversionRate}%`}
              variation={null}
              subtitle="Commandes livrees / total"
              accentClass="text-green-600"
            />
          </>
        ) : null}
      </div>

      {/* Comparaison periode precedente — resume textuel */}
      {!loading && data && (
        <div className="bg-gray-50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 sm:gap-8">
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              CA periode precedente
            </p>
            <p className="text-base font-semibold text-gray-700">
              {formatPrice(data.previousRevenue)}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Commandes periode precedente
            </p>
            <p className="text-base font-semibold text-gray-700">
              {data.previousOrders}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Evolution CA
            </p>
            <p
              className={`text-base font-bold ${variationColor(data.revenueVariation)}`}
            >
              {formatVariation(data.revenueVariation)}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Evolution commandes
            </p>
            <p
              className={`text-base font-bold ${variationColor(data.ordersVariation)}`}
            >
              {formatVariation(data.ordersVariation)}
            </p>
          </div>
        </div>
      )}

      {/* Graphique CA en barres CSS */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {period === 90
            ? 'CA par semaine (90 jours)'
            : `CA par jour (${period} jours)`}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Hors commandes annulees — survol pour le detail
        </p>

        {loading ? (
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ) : data ? (
          <BarChart data={data.dailyRevenue} period={period} />
        ) : null}
      </div>

      {/* Top 5 produits + Top 5 quartiers cote a cote */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 produits vendus */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Top 5 produits
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Par quantite vendue sur la periode
          </p>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between mb-1">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full w-full" />
                </div>
              ))}
            </div>
          ) : data ? (
            <TopProductsList products={data.topProducts} />
          ) : null}
        </div>

        {/* Top 5 quartiers */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Top 5 quartiers
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Par volume de commandes sur la periode
          </p>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between mb-1">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full w-full" />
                </div>
              ))}
            </div>
          ) : data ? (
            <TopQuartersList quarters={data.topQuarters} />
          ) : null}
        </div>
      </div>
    </section>
  )
}
