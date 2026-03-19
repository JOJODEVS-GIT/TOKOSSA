import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * POST /api/admin/generate-description
 * Genere une description marketing, une description courte,
 * un titre SEO et une meta description SEO pour un produit.
 *
 * Utilise l'API Anthropic Claude si ANTHROPIC_API_KEY est configuree,
 * sinon retombe sur des templates intelligents (fallback).
 *
 * Body : { productName: string, category: string, price: number, features?: string }
 * Retour : { description: string, shortDescription: string, seoTitle: string, seoDescription: string }
 */

// ============================================
// TYPES
// ============================================

interface GenerateRequestBody {
  productName: string
  category: string
  price: number
  features?: string
}

interface GenerateResponse {
  description: string
  shortDescription: string
  seoTitle: string
  seoDescription: string
}

// ============================================
// ANTHROPIC CLAUDE (API directe via fetch)
// ============================================

/**
 * Appelle l'API Anthropic Claude pour generer les descriptions.
 * Utilise fetch directement pour eviter une dependance npm supplementaire.
 */
async function generateWithClaude(
  body: GenerateRequestBody
): Promise<GenerateResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY non configuree')
  }

  const { productName, category, price, features } = body

  const featuresText = features
    ? `\nCaracteristiques supplementaires : ${features}`
    : ''

  const prompt = `Tu es un redacteur marketing expert pour une boutique e-commerce au Benin (Cotonou). Genere du contenu commercial pour le produit suivant :

Nom du produit : ${productName}
Categorie : ${category}
Prix : ${price} FCFA${featuresText}

Genere EXACTEMENT ce JSON (sans commentaires, sans markdown, juste le JSON brut) :
{
  "description": "Description marketing en francais, 2-3 phrases orientees conversion. Mentionne la livraison a Cotonou, le paiement Mobile Money/a la livraison. Ton enthousiaste mais professionnel.",
  "shortDescription": "1 phrase courte et percutante qui resume le produit et donne envie d'acheter.",
  "seoTitle": "Titre SEO optimise de 50-60 caracteres avec le nom du produit et un mot-cle accrocheur. Format: Nom Produit - Mot-cle | TOKOSSA",
  "seoDescription": "Meta description SEO de 140-155 caracteres. Doit donner envie de cliquer avec un appel a l'action et mentionner la livraison au Benin."
}

IMPORTANT : Reponds UNIQUEMENT avec le JSON, sans aucun texte avant ou apres. Pas de blocs de code markdown.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('Erreur API Anthropic:', errorData)
    throw new Error(`Erreur API Anthropic: ${response.status}`)
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>
  }

  // Extraire le texte de la reponse Claude
  const textContent = data.content.find(
    (block: { type: string }) => block.type === 'text'
  )
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Reponse Claude invalide : pas de contenu texte')
  }

  // Parser le JSON retourne par Claude
  const rawText = textContent.text.trim()

  // Nettoyer au cas ou Claude ajoute des blocs markdown
  const cleanedText = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const parsed = JSON.parse(cleanedText) as GenerateResponse

  // Validation de la structure
  if (
    !parsed.description ||
    !parsed.shortDescription ||
    !parsed.seoTitle ||
    !parsed.seoDescription
  ) {
    throw new Error('Reponse Claude incomplete : champs manquants')
  }

  return parsed
}

// ============================================
// FALLBACK PAR TEMPLATES (sans API)
// ============================================

/** Templates de descriptions par categorie */
const templates: Record<string, (name: string, price: number) => GenerateResponse> = {
  Electronique: (name, price) => ({
    description: `Decouvrez le ${name}, un accessoire technologique de qualite superieure pour votre quotidien a Cotonou. Performance, fiabilite et design moderne reunis dans un seul produit. Livraison rapide sous 24h, paiement par MTN Mobile Money, Moov Money ou a la livraison.`,
    shortDescription: `${name} : la technologie fiable et performante, livree chez vous a Cotonou.`,
    seoTitle: `${name} - Prix ${price} FCFA | TOKOSSA Benin`,
    seoDescription: `Achetez ${name} a ${price} FCFA sur TOKOSSA. Livraison 24h a Cotonou, paiement Mobile Money ou a la livraison. Garantie qualite.`,
  }),

  Mode: (name, price) => ({
    description: `Sublimez votre style avec ${name}. Materiaux de qualite, finitions soignees et design tendance qui s'adapte a toutes les occasions. Disponible en plusieurs tailles pour un confort optimal. Commandez maintenant et recevez votre article demain a Cotonou.`,
    shortDescription: `${name} : elegance et confort au meilleur prix, livre a domicile.`,
    seoTitle: `${name} - Mode ${price} FCFA | TOKOSSA`,
    seoDescription: `${name} a partir de ${price} FCFA. Mode de qualite livree en 24h a Cotonou et environs. Paiement flexible par Mobile Money.`,
  }),

  Beaute: (name, price) => ({
    description: `Revélez votre beaute naturelle avec ${name}. Formule enrichie en ingredients naturels africains : karite, baobab, moringa. Resultats visibles des la premiere utilisation. Sans parabenes, teste dermatologiquement. Livraison a Cotonou et paiement flexible.`,
    shortDescription: `${name} : soin naturel aux actifs africains pour reveler votre beaute.`,
    seoTitle: `${name} - Beaute naturelle ${price} FCFA | TOKOSSA`,
    seoDescription: `${name} a ${price} FCFA. Soin beaute aux ingredients naturels africains. Livraison 24h a Cotonou, paiement Mobile Money.`,
  }),

  Sport: (name, price) => ({
    description: `Atteignez vos objectifs fitness avec ${name}. Concu pour les sportifs exigeants, ce produit offre confort et resistance. Design ergonomique et materiaux premium. Rejoignez les sportifs beninois qui nous font confiance. Livre en 24h a Cotonou.`,
    shortDescription: `${name} : l'equipement sportif performant pour atteindre vos objectifs.`,
    seoTitle: `${name} - Sport ${price} FCFA | TOKOSSA Benin`,
    seoDescription: `Achetez ${name} a ${price} FCFA. Equipement sport de qualite, livraison 24h a Cotonou. Paiement Mobile Money accepte.`,
  }),

  Maison: (name, price) => ({
    description: `Transformez votre interieur avec ${name}. Pratique et esthetique, cet article ameliore votre quotidien. Materiaux durables, design contemporain adapte au climat beninois. Excellent rapport qualite-prix. Livraison soignee a domicile a Cotonou.`,
    shortDescription: `${name} : l'essentiel pour un interieur moderne et pratique.`,
    seoTitle: `${name} - Maison ${price} FCFA | TOKOSSA`,
    seoDescription: `${name} a ${price} FCFA. Equipement maison de qualite, livraison a domicile a Cotonou. Paiement securise ou a la livraison.`,
  }),

  Enfants: (name, price) => ({
    description: `Faites plaisir a vos enfants avec ${name}. Educatif et divertissant, ce produit stimule la creativite. Materiaux certifies sans danger, robustes et faciles a nettoyer. Recommande par les parents beninois pour sa qualite. Commandez maintenant, livre demain a Cotonou !`,
    shortDescription: `${name} : le cadeau ideal pour l'epanouissement de vos enfants.`,
    seoTitle: `${name} - Enfants ${price} FCFA | TOKOSSA`,
    seoDescription: `${name} a ${price} FCFA. Produit enfant de qualite, securise et educatif. Livraison 24h a Cotonou, paiement a la livraison.`,
  }),
}

/**
 * Genere les descriptions via templates lorsque l'API Anthropic
 * n'est pas disponible.
 */
function generateWithTemplates(body: GenerateRequestBody): GenerateResponse {
  const { productName, category, price } = body
  const generator = templates[category] || templates['Electronique']
  return generator(productName, price)
}

// ============================================
// HANDLER POST
// ============================================

export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const rawBody = await request.json() as Record<string, unknown>

    // Support du champ "name" (ancien format) et "productName" (nouveau format)
    const productName = (rawBody.productName ?? rawBody.name) as string | undefined
    const category = rawBody.category as string | undefined
    const price = typeof rawBody.price === 'number' ? rawBody.price : 0
    const features = rawBody.features as string | undefined

    if (!productName || typeof productName !== 'string' || !productName.trim()) {
      return NextResponse.json(
        { error: 'Le nom du produit est requis' },
        { status: 400 }
      )
    }

    const body: GenerateRequestBody = {
      productName: productName.trim(),
      category: category || 'Electronique',
      price,
      features: features?.trim(),
    }

    // Tenter la generation IA, sinon fallback sur les templates
    let result: GenerateResponse

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        result = await generateWithClaude(body)
      } catch (aiError) {
        console.warn(
          'Fallback vers templates (erreur IA):',
          aiError instanceof Error ? aiError.message : aiError
        )
        result = generateWithTemplates(body)
      }
    } else {
      result = generateWithTemplates(body)
    }

    // Retour compatible avec l'ancien format (champ "description" seul)
    // ET le nouveau format complet
    return NextResponse.json({
      description: result.description,
      shortDescription: result.shortDescription,
      seoTitle: result.seoTitle,
      seoDescription: result.seoDescription,
    })
  } catch (error) {
    console.error('Erreur generation description:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la generation' },
      { status: 500 }
    )
  }
}
