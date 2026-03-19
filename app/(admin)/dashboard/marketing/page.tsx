'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Dashboard Marketing Facebook — TOKOSSA
 *
 * Permet de suivre en temps réel :
 * - Performance globale du compte publicitaire (dépenses, reach, clics, achats, ROAS)
 * - Performance par campagne
 * - Graphique d'évolution des dépenses et clics
 * - Statut du Pixel Facebook
 * - Tunnel de conversion (ViewContent → AddToCart → Checkout → Purchase)
 *
 * Requiert : FACEBOOK_ACCESS_TOKEN + FACEBOOK_AD_ACCOUNT_ID dans les variables d'env
 */

// ─── Types ───────────────────────────────────────────────────────────────────

interface GlobalStats {
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  reach: number
  frequency: number
  purchases: number
  addToCarts: number
  initiateCheckouts: number
  viewContents: number
  roas: number
  cpa: number
}

interface Campaign {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | string
  objective: string
  dailyBudget: number | null
  lifetimeBudget: number | null
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  reach: number
  purchases: number
  addToCarts: number
  roas: number
  cpa: number
}

interface ChartPoint {
  date: string
  spend: number
  clicks: number
  impressions: number
  reach: number
  purchases: number
}

interface MarketingData {
  configured: boolean
  pixelId: string | null
  adAccountId?: string
  datePreset?: string
  globalStats?: GlobalStats
  campaigns?: Campaign[]
  chartData?: ChartPoint[]
  error?: string
}

type DatePreset = 'last_7d' | 'last_14d' | 'last_30d' | 'last_90d' | 'this_month' | 'last_month'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA'
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return n.toString()
}

function formatPct(n: number): string {
  return n.toFixed(2) + '%'
}

const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  last_7d: '7 derniers jours',
  last_14d: '14 derniers jours',
  last_30d: '30 derniers jours',
  last_90d: '90 derniers jours',
  this_month: 'Ce mois',
  last_month: 'Mois dernier',
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  DELETED: 'bg-gray-100 text-gray-500',
  ARCHIVED: 'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  PAUSED: 'Pausée',
  DELETED: 'Supprimée',
  ARCHIVED: 'Archivée',
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function MarketingPage() {
  const [data, setData] = useState<MarketingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d')
  const [sortBy, setSortBy] = useState<keyof Campaign>('spend')
  const [sortDesc, setSortDesc] = useState(true)
  const [chartMetric, setChartMetric] = useState<'spend' | 'clicks' | 'purchases'>('spend')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/marketing?datePreset=${datePreset}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      console.error('Erreur chargement marketing')
    } finally {
      setLoading(false)
    }
  }, [datePreset])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleSort = (col: keyof Campaign) => {
    if (sortBy === col) setSortDesc(!sortDesc)
    else { setSortBy(col); setSortDesc(true) }
  }

  const sortedCampaigns = [...(data?.campaigns || [])].sort((a, b) => {
    const aVal = a[sortBy] as number
    const bVal = b[sortBy] as number
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDesc ? bVal - aVal : aVal - bVal
    }
    return 0
  })

  // ─── État : non configuré ────────────────────────────────────────────────
  if (!loading && data && !data.configured) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Facebook</h1>
          <p className="text-gray-600">Analysez vos campagnes publicitaires directement ici</p>
        </div>

        {/* Setup guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 mb-1">Configurez votre compte publicitaire</h2>
              <p className="text-blue-700 text-sm mb-4">
                Pour voir vos campagnes Facebook Ads ici, ajoutez ces 2 variables dans vos réglages Vercel (ou dans votre <code className="bg-blue-100 px-1 rounded">.env</code>).
              </p>

              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Variable 1</p>
                  <code className="text-sm font-mono text-gray-800 block">FACEBOOK_ACCESS_TOKEN</code>
                  <p className="text-xs text-gray-500 mt-1">
                    → Meta Business Suite → Paramètres → Utilisateurs système → Générer un token (permission : ads_read)
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Variable 2</p>
                  <code className="text-sm font-mono text-gray-800 block">FACEBOOK_AD_ACCOUNT_ID</code>
                  <p className="text-xs text-gray-500 mt-1">
                    → Meta Ads Manager → URL du navigateur → trouvez <code>act_XXXXXXXXX</code> → copiez <code>XXXXXXXXX</code>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <a
                  href="https://business.facebook.com/settings/system-users"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Ouvrir Meta Business Suite
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://adsmanager.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Ouvrir Ads Manager
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Pixel Status */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut du Pixel Facebook</h2>
          {data.pixelId ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="font-medium text-green-800">Pixel actif</p>
                <p className="text-sm text-green-600">ID : <code className="font-mono">{data.pixelId}</code></p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div>
                <p className="font-medium text-red-800">Pixel non configuré</p>
                <p className="text-sm text-red-600">Ajoutez NEXT_PUBLIC_FB_PIXEL_ID dans vos variables d'environnement</p>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Purchase ✅', 'AddToCart ✅', 'InitiateCheckout ✅', 'ViewContent ✅'].map((ev) => (
              <div key={ev} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-sm font-medium text-gray-700">{ev}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── État : erreur API ───────────────────────────────────────────────────
  if (!loading && data?.error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketing Facebook</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="font-semibold text-red-800 mb-2">Erreur de connexion à Facebook</p>
          <code className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg block">{data.error}</code>
          <p className="text-sm text-red-600 mt-3">
            Vérifiez que votre FACEBOOK_ACCESS_TOKEN est valide et a les permissions <strong>ads_read</strong>.
          </p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const stats = data?.globalStats
  const chartData = data?.chartData || []
  const maxChartVal = Math.max(...chartData.map((d) => d[chartMetric] || 0), 1)

  // ─── Dashboard principal ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Facebook</h1>
          <p className="text-gray-600">
            Performance de vos campagnes publicitaires
            {data?.adAccountId && (
              <span className="ml-2 text-xs text-gray-400 font-mono">act_{data.adAccountId}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sélecteur de période */}
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 gap-1">
            {(Object.entries(DATE_PRESET_LABELS) as [DatePreset, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDatePreset(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  datePreset === key
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bouton actualiser */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Lien vers Ads Manager */}
          <a
            href="https://adsmanager.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Ads Manager
          </a>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      )}

      {!loading && stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Dépensé */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-t-blue-500">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dépenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatFCFA(stats.spend)}</p>
              <p className="text-xs text-gray-400 mt-1">Période sélectionnée</p>
            </div>

            {/* Reach */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-t-purple-500">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Portée</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.reach)}</p>
              <p className="text-xs text-gray-400 mt-1">Freq. {stats.frequency.toFixed(1)}x</p>
            </div>

            {/* Clics */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-t-green-500">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clics</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.clicks)}</p>
              <p className="text-xs text-gray-400 mt-1">CTR {formatPct(stats.ctr)}</p>
            </div>

            {/* Achats */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-t-orange-500">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Achats</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.purchases}</p>
              <p className="text-xs text-gray-400 mt-1">CPA {formatFCFA(stats.cpa)}</p>
            </div>

            {/* ROAS */}
            <div className={`rounded-2xl p-5 shadow-sm border-t-4 ${
              stats.roas >= 3
                ? 'bg-green-50 border-t-green-500'
                : stats.roas >= 1.5
                  ? 'bg-yellow-50 border-t-yellow-500'
                  : 'bg-red-50 border-t-red-500'
            }`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ROAS</p>
              <p className={`text-2xl font-bold mt-1 ${
                stats.roas >= 3 ? 'text-green-700' : stats.roas >= 1.5 ? 'text-yellow-700' : 'text-red-600'
              }`}>
                {stats.roas > 0 ? `${stats.roas.toFixed(2)}x` : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.roas >= 3 ? '✅ Excellent' : stats.roas >= 1.5 ? '⚠️ Moyen' : stats.roas > 0 ? '🔴 À améliorer' : 'Pas de données'}
              </p>
            </div>
          </div>

          {/* Tunnel de conversion */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tunnel de conversion</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { label: 'Impressions', value: stats.impressions, color: 'bg-gray-200' },
                { label: 'Clics', value: stats.clicks, color: 'bg-blue-200' },
                { label: 'Vues produit', value: stats.viewContents, color: 'bg-indigo-200' },
                { label: 'Ajouts panier', value: stats.addToCarts, color: 'bg-purple-200' },
                { label: 'Checkouts', value: stats.initiateCheckouts, color: 'bg-orange-200' },
                { label: 'Achats', value: stats.purchases, color: 'bg-green-300' },
              ].map((step, i, arr) => {
                const prev = i > 0 ? arr[i - 1].value : step.value
                const rate = prev > 0 ? ((step.value / prev) * 100).toFixed(1) : '—'
                return (
                  <div key={step.label} className="flex items-center gap-2 flex-shrink-0">
                    <div className={`${step.color} rounded-xl px-4 py-3 text-center min-w-[100px]`}>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(step.value)}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{step.label}</p>
                      {i > 0 && (
                        <p className="text-xs font-medium text-gray-500 mt-1">{rate}%</p>
                      )}
                    </div>
                    {i < arr.length - 1 && (
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Graphique d'évolution */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Évolution</h2>
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {(['spend', 'clicks', 'purchases'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setChartMetric(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        chartMetric === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {m === 'spend' ? 'Dépenses' : m === 'clicks' ? 'Clics' : 'Achats'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between gap-1" style={{ height: '180px' }}>
                {chartData.slice(-30).map((point) => {
                  const val = point[chartMetric] || 0
                  const heightPct = maxChartVal > 0 ? (val / maxChartVal) * 100 : 0
                  const date = new Date(point.date)
                  const label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

                  return (
                    <div key={point.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {label}
                        <br />
                        {chartMetric === 'spend' ? formatFCFA(val) : val}
                      </div>

                      <div className="w-full flex items-end" style={{ height: '140px' }}>
                        <div
                          className="w-full rounded-t-md transition-all"
                          style={{
                            height: `${Math.max(heightPct, val > 0 ? 3 : 0)}%`,
                            background: chartMetric === 'spend'
                              ? 'linear-gradient(to top, #3b82f6, #60a5fa)'
                              : chartMetric === 'clicks'
                                ? 'linear-gradient(to top, #22c55e, #4ade80)'
                                : 'linear-gradient(to top, #f97316, #fb923c)',
                          }}
                        />
                      </div>

                      <span className="text-[9px] text-gray-400 whitespace-nowrap hidden sm:block">
                        {date.getDate()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tableau des campagnes */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Campagnes ({sortedCampaigns.length})
              </h2>
              <a
                href="https://adsmanager.facebook.com/adsmanager/campaigns"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Gérer dans Ads Manager →
              </a>
            </div>

            {sortedCampaigns.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Aucune campagne trouvée pour cette période
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3 text-left">Campagne</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th
                        className="px-4 py-3 text-right cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort('spend')}
                      >
                        Dépenses {sortBy === 'spend' && (sortDesc ? '↓' : '↑')}
                      </th>
                      <th
                        className="px-4 py-3 text-right cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort('reach')}
                      >
                        Portée {sortBy === 'reach' && (sortDesc ? '↓' : '↑')}
                      </th>
                      <th
                        className="px-4 py-3 text-right cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort('clicks')}
                      >
                        Clics {sortBy === 'clicks' && (sortDesc ? '↓' : '↑')}
                      </th>
                      <th className="px-4 py-3 text-right">CTR</th>
                      <th
                        className="px-4 py-3 text-right cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort('purchases')}
                      >
                        Achats {sortBy === 'purchases' && (sortDesc ? '↓' : '↑')}
                      </th>
                      <th className="px-4 py-3 text-right">CPA</th>
                      <th
                        className="px-4 py-3 text-right cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort('roas')}
                      >
                        ROAS {sortBy === 'roas' && (sortDesc ? '↓' : '↑')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedCampaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 max-w-[200px] truncate">{c.name}</p>
                          {c.objective && (
                            <p className="text-xs text-gray-400 mt-0.5">{c.objective}</p>
                          )}
                          {c.dailyBudget && (
                            <p className="text-xs text-blue-500 mt-0.5">
                              Budget/jour : {formatFCFA(c.dailyBudget)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[c.status] || 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[c.status] || c.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-900">
                          {c.spend > 0 ? formatFCFA(c.spend) : '—'}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {c.reach > 0 ? formatNumber(c.reach) : '—'}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {c.clicks > 0 ? formatNumber(c.clicks) : '—'}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-500 text-xs">
                          {c.ctr > 0 ? formatPct(c.ctr) : '—'}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`font-semibold ${c.purchases > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {c.purchases > 0 ? c.purchases : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-gray-500 text-xs">
                          {c.cpa > 0 ? formatFCFA(c.cpa) : '—'}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {c.roas > 0 ? (
                            <span className={`font-bold text-sm ${
                              c.roas >= 3 ? 'text-green-600' : c.roas >= 1.5 ? 'text-yellow-600' : 'text-red-500'
                            }`}>
                              {c.roas.toFixed(2)}x
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pixel Status */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Facebook Pixel</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Statut pixel */}
              {data?.pixelId ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-xl border border-green-200 flex-1">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium text-green-800 text-sm">Pixel actif</p>
                    <code className="text-xs text-green-600">{data.pixelId}</code>
                  </div>
                  <a
                    href={`https://business.facebook.com/events_manager/pixel/${data.pixelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs text-green-600 hover:text-green-700 underline"
                  >
                    Events Manager →
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-xl border border-red-200 flex-1">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  <p className="text-sm font-medium text-red-700">Pixel non configuré — Ajoutez NEXT_PUBLIC_FB_PIXEL_ID</p>
                </div>
              )}
            </div>

            {/* Événements trackés */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Purchase', desc: 'Achat confirmé', ok: true },
                { label: 'AddToCart', desc: 'Ajout au panier', ok: true },
                { label: 'InitiateCheckout', desc: 'Début checkout', ok: true },
                { label: 'ViewContent', desc: 'Vue produit', ok: true },
              ].map((ev) => (
                <div key={ev.label} className={`rounded-xl p-3 border ${ev.ok ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${ev.ok ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <p className="text-xs font-semibold text-gray-700">{ev.label}</p>
                  </div>
                  <p className="text-xs text-gray-500">{ev.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Conseils ROAS */}
          {stats.roas > 0 && (
            <div className={`rounded-2xl p-5 border ${
              stats.roas >= 3 ? 'bg-green-50 border-green-200' : stats.roas >= 1.5 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex gap-3">
                <span className="text-2xl">{stats.roas >= 3 ? '🚀' : stats.roas >= 1.5 ? '⚡' : '🔴'}</span>
                <div>
                  <p className={`font-semibold ${
                    stats.roas >= 3 ? 'text-green-800' : stats.roas >= 1.5 ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {stats.roas >= 3
                      ? 'Excellent ROAS — Augmentez votre budget !'
                      : stats.roas >= 1.5
                        ? 'ROAS correct — Optimisez vos audiences'
                        : 'ROAS faible — Vos pubs coûtent plus qu\'elles ne rapportent'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    stats.roas >= 3 ? 'text-green-700' : stats.roas >= 1.5 ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {stats.roas >= 3
                      ? `Pour chaque franc dépensé en pub, vous gagnez ${stats.roas.toFixed(1)} FCFA. Doublez le budget de vos meilleures campagnes.`
                      : stats.roas >= 1.5
                        ? 'Testez des audiences Lookalike basées sur vos acheteurs. Mettez en pause les campagnes à ROAS < 1.'
                        : 'Mettez en pause les campagnes peu performantes. Testez de nouvelles audiences ou créatifs.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
