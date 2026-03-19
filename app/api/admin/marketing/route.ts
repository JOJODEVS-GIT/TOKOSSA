import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API admin Marketing Facebook — TOKOSSA
 * Connecte Meta Marketing API pour récupérer :
 * - Insights globaux du compte publicitaire (spend, reach, clicks, achats, ROAS)
 * - Liste des campagnes actives avec leur performance
 * - Données quotidiennes pour le graphique d'évolution
 *
 * Variables d'env requises :
 * - FACEBOOK_ACCESS_TOKEN  → Meta Business Settings → System Users → Token
 * - FACEBOOK_AD_ACCOUNT_ID → Meta Ads Manager → URL : act_XXXXXXXXX
 */

const FB_API_VERSION = 'v21.0'
const FB_GRAPH_URL = `https://graph.facebook.com/${FB_API_VERSION}`

type DatePreset = 'last_7d' | 'last_14d' | 'last_30d' | 'last_90d' | 'this_month' | 'last_month'

/** Champs d'insights demandés à Meta */
const INSIGHT_FIELDS = [
  'spend',
  'impressions',
  'clicks',
  'ctr',
  'cpc',
  'reach',
  'frequency',
  'actions',
  'cost_per_action_type',
  'purchase_roas',
].join(',')

/** Appel générique à l'API Graph Facebook */
async function fetchFB(path: string, params: Record<string, string>) {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN
  if (!accessToken) throw new Error('FACEBOOK_ACCESS_TOKEN manquant')

  const url = new URL(`${FB_GRAPH_URL}/${path}`)
  url.searchParams.set('access_token', accessToken)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 }, // Cache 5 minutes
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ||
      `Facebook API erreur ${res.status}`
    )
  }

  return res.json()
}

/** Extraire la valeur d'une action spécifique (ex: 'purchase', 'add_to_cart') */
function extractAction(
  actions: Array<{ action_type: string; value: string }> | undefined,
  type: string
): number {
  if (!actions) return 0
  const found = actions.find((a) => a.action_type === type)
  return found ? Math.round(parseFloat(found.value)) : 0
}

/** Labels lisibles pour les objectifs de campagne */
const OBJECTIVE_LABELS: Record<string, string> = {
  LINK_CLICKS: 'Clics vers le site',
  CONVERSIONS: 'Conversions',
  REACH: 'Portée',
  BRAND_AWARENESS: 'Notoriété',
  VIDEO_VIEWS: 'Vues vidéo',
  LEAD_GENERATION: 'Génération de leads',
  MESSAGES: 'Messages',
  APP_INSTALLS: 'Installations app',
  OUTCOME_TRAFFIC: 'Trafic',
  OUTCOME_SALES: 'Ventes',
  OUTCOME_LEADS: 'Leads',
  OUTCOME_AWARENESS: 'Notoriété',
  OUTCOME_ENGAGEMENT: 'Engagement',
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID

    // Si les credentials ne sont pas configurés, retourner un statut clair
    if (!accessToken || !adAccountId) {
      return NextResponse.json({
        configured: false,
        pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || null,
      })
    }

    const { searchParams } = new URL(request.url)
    const datePreset = (searchParams.get('datePreset') || 'last_30d') as DatePreset

    // Requêtes parallèles pour optimiser le temps de réponse
    const [accountInsightsRaw, campaignsRaw, dailyInsightsRaw] = await Promise.all([
      // 1. Insights globaux du compte sur la période
      fetchFB(`act_${adAccountId}/insights`, {
        date_preset: datePreset,
        fields: INSIGHT_FIELDS,
      }),

      // 2. Campagnes avec leurs insights intégrés
      fetchFB(`act_${adAccountId}/campaigns`, {
        fields: `id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(${datePreset}){${INSIGHT_FIELDS}}`,
        limit: '30',
      }),

      // 3. Données quotidiennes pour le graphique (time_increment=1 = par jour)
      fetchFB(`act_${adAccountId}/insights`, {
        date_preset: datePreset,
        time_increment: '1',
        fields: 'date_start,date_stop,spend,impressions,clicks,actions,reach',
        limit: '90',
      }),
    ])

    // --- Stats globales ---
    type FbInsight = {
      spend?: string
      impressions?: string
      clicks?: string
      ctr?: string
      cpc?: string
      reach?: string
      frequency?: string
      actions?: Array<{ action_type: string; value: string }>
      purchase_roas?: Array<{ action_type: string; value: string }>
    }
    const acc: FbInsight = (accountInsightsRaw.data?.[0] as FbInsight) || {}
    const globalStats = {
      spend: parseFloat(acc.spend || '0'),
      impressions: parseInt(acc.impressions || '0'),
      clicks: parseInt(acc.clicks || '0'),
      ctr: parseFloat(acc.ctr || '0'),
      cpc: parseFloat(acc.cpc || '0'),
      reach: parseInt(acc.reach || '0'),
      frequency: parseFloat(acc.frequency || '0'),
      purchases: extractAction(acc.actions, 'purchase'),
      addToCarts: extractAction(acc.actions, 'add_to_cart'),
      initiateCheckouts: extractAction(acc.actions, 'initiate_checkout'),
      viewContents: extractAction(acc.actions, 'view_content'),
      roas: parseFloat(acc.purchase_roas?.[0]?.value || '0'),
      // CPA = Coût par achat
      cpa: extractAction(acc.actions, 'purchase') > 0
        ? parseFloat(acc.spend || '0') / extractAction(acc.actions, 'purchase')
        : 0,
    }

    // --- Campagnes ---
    type FbCampaign = {
      id: string
      name: string
      status: string
      objective?: string
      daily_budget?: string
      lifetime_budget?: string
      insights?: { data: FbInsight[] }
    }
    const campaigns = ((campaignsRaw.data as FbCampaign[]) || []).map((c) => {
      const ins: FbInsight = c.insights?.data?.[0] || {}
      const purchases = extractAction(ins.actions, 'purchase')
      const spend = parseFloat(ins.spend || '0')
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        objective: OBJECTIVE_LABELS[c.objective || ''] || (c.objective ?? ''),
        dailyBudget: c.daily_budget ? parseInt(c.daily_budget) : null,
        lifetimeBudget: c.lifetime_budget ? parseInt(c.lifetime_budget) : null,
        spend,
        impressions: parseInt(ins.impressions || '0'),
        clicks: parseInt(ins.clicks || '0'),
        ctr: parseFloat(ins.ctr || '0'),
        cpc: parseFloat(ins.cpc || '0'),
        reach: parseInt(ins.reach || '0'),
        purchases,
        addToCarts: extractAction(ins.actions, 'add_to_cart'),
        roas: parseFloat(ins.purchase_roas?.[0]?.value || '0'),
        cpa: purchases > 0 ? spend / purchases : 0,
      }
    })

    // --- Données quotidiennes pour graphique ---
    type FbDayInsight = FbInsight & { date_start?: string; date_stop?: string }
    const chartData = ((dailyInsightsRaw.data as FbDayInsight[]) || []).map((d) => ({
      date: d.date_start || '',
      spend: parseFloat(d.spend || '0'),
      clicks: parseInt(d.clicks || '0'),
      impressions: parseInt(d.impressions || '0'),
      reach: parseInt(d.reach || '0'),
      purchases: extractAction(d.actions, 'purchase'),
    }))

    return NextResponse.json({
      configured: true,
      pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || null,
      adAccountId,
      datePreset,
      globalStats,
      campaigns,
      chartData,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('GET /api/admin/marketing error:', error)
    return NextResponse.json(
      { configured: true, error: msg },
      { status: 500 }
    )
  }
}
