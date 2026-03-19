# TOKOSSA — E-commerce Bénin

## Contexte

**TOKOSSA** est une plateforme e-commerce mobile-first ciblant le marché béninois, principalement Cotonou. L'objectif est de maximiser les conversions avec une UX optimisée pour mobile et des moyens de paiement locaux.

## Principes Directeurs

> **Mobile-first absolu. Conversion avant esthétique. Rapidité avant features.**
> Chaque décision technique doit servir une vente.

## Stack Technique

```
FRONTEND         Next.js 14 (App Router) + Tailwind CSS
BACKEND          API Routes Next.js (serverless)
DATABASE         PostgreSQL + Prisma ORM
AUTH             NextAuth.js + OTP WhatsApp
PAIEMENT         KKiaPay (MTN/Moov/Wave) + Cash on Delivery
HÉBERGEMENT      Vercel (frontend) + Railway ou Supabase (DB)
WHATSAPP         Twilio WhatsApp Business API
EMAIL            Resend.com
IMAGES           Cloudinary
ANALYTICS        Vercel Analytics + Facebook Pixel
```

## Structure du Projet

```
tokossa/
├── app/                    # Next.js App Router
│   ├── (shop)/            # Boutique client
│   ├── (account)/         # Compte client
│   ├── (admin)/           # Dashboard admin
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Composants réutilisables
│   ├── shop/              # Composants boutique
│   ├── checkout/          # Composants checkout
│   └── layout/            # Navigation, layouts
├── lib/                   # Utilitaires et configs
├── prisma/                # Schéma base de données
└── .ai/                   # Agents et skills IA
    ├── agents/            # 5 agents spécialisés
    └── skills/            # Skills techniques
```

## Agents Disponibles

| Agent | Rôle |
|-------|------|
| `dev-agent` | Architecture, Next.js, Prisma, Performance |
| `commerce-agent` | Panier, Commandes, Stock, Promotions |
| `payment-agent` | KKiaPay, Webhooks, Transactions |
| `automation-agent` | WhatsApp, Emails, Notifications |
| `analytics-agent` | Facebook Pixel, Conversion tracking |

## Commandes Utiles

```bash
# Développement
npm run dev

# Build
npm run build

# Prisma
npm run prisma:generate   # Générer le client
npm run prisma:push       # Sync schéma
npm run prisma:studio     # Interface visuelle
```

## Flux de Commande

```
CLIENT                    SYSTÈME                        ADMIN
  │                          │                              │
  │── Ajoute au panier ──►   │                              │
  │── Checkout ────────►     │── Crée Order (PENDING) ──►   │
  │── Paiement KKiaPay ──►   │◄── Webhook KKiaPay ──        │
  │                          │── Order → CONFIRMED          │
  │◄── WhatsApp confirm ──   │── WhatsApp admin ────────►   │
  │                          │                  Admin → DELIVERING
  │◄── WhatsApp suivi ──     │                              │
  │                          │                  Admin → DELIVERED
  │◄── WhatsApp final ──     │                              │
```

## Éléments UX Conversion

Sur chaque page produit :
- ✅ Timer urgence ("Promo expire dans...")
- ✅ Stock visible ("Plus que 4 en stock")
- ✅ Barre de stock colorée
- ✅ Livraison rassurante ("Livré demain")
- ✅ Paiement adapté (MTN/Moov/Cash visible)
- ✅ Bouton WhatsApp (fallback)
- ✅ Social proof ("Kevin vient d'acheter")
- ✅ Trust badges

## Variables d'Environnement

Voir `.env.example` pour la liste complète.

## Standards de Code

### Server vs Client Components
```typescript
// ✅ Server Component par défaut (data fetching)
export default async function Page() {
  const data = await prisma.product.findMany()
  return <ProductGrid products={data} />
}

// ✅ Client Component si interactivité
'use client'
export default function AddToCartButton() {
  const { addItem } = useCartStore()
  // ...
}
```

### Prisma Queries
```typescript
// ✅ Sélectionner uniquement les champs nécessaires
const products = await prisma.product.findMany({
  select: { id: true, name: true, price: true, images: true },
  where: { isActive: true },
  take: 20,
})
```

### Monnaie
- Toujours stocker en FCFA (entier)
- Formater avec `formatPrice()` pour l'affichage

## Objectifs Business

| Période | Objectif |
|---------|----------|
| Semaine 1-2 | 1ère vente |
| Mois 1 | 2-3 ventes/jour |
| Mois 3 | 10 ventes/jour |
| Mois 6 | 500 000 FCFA/mois |

---

*TOKOSSA — Stack Next.js — Marché Bénin — Mobile First*
