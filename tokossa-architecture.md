# 🏗️ TOKOSSA — Architecture Complète & Corrigée

## 🎯 Principes directeurs

> **Mobile-first absolu. Conversion avant esthétique. Rapidité avant features.**
> Chaque décision technique doit servir une vente.

---

## 1. STACK TECHNIQUE (VERSION DÉFINITIVE)

### Corrections par rapport au cahier initial

| Élément | Cahier initial | ✅ Version définitive | Raison |
|---|---|---|---|
| Backend | NestJS OU API Routes | **API Routes Next.js uniquement** | NestJS = overkill pour démarrer |
| Cache Redis | Dès le début | **Phase 2 seulement** | Inutile sans trafic réel |
| Paiement | Flutterwave ou KKiaPay | **KKiaPay priorité + livraison COD** | KKiaPay = béninois, frais bas |
| Auth | NextAuth uniquement | **NextAuth + login WhatsApp OTP** | 80% users n'ont pas d'email actif |
| DB | PostgreSQL seul | **PostgreSQL + Prisma ORM** | Prisma simplifie énormément |

### Stack finale

```
FRONTEND         Next.js 14 (App Router) + Tailwind CSS
BACKEND          API Routes Next.js (serverless)
DATABASE         PostgreSQL + Prisma ORM
CACHE            Redis (Phase 2 uniquement)
AUTH             NextAuth.js + OTP WhatsApp
PAIEMENT         KKiaPay (MTN/Moov/Wave) + Cash on Delivery
HÉBERGEMENT      Vercel (frontend) + Railway ou Supabase (DB)
WHATSAPP         WhatsApp Business API (Twilio ou WATI)
EMAIL            Resend.com (simple, gratuit jusqu'à 3000/mois)
IMAGES           Cloudinary (compression auto mobile)
ANALYTICS        Vercel Analytics + Facebook Pixel
```

---

## 2. ARCHITECTURE PROJET (STRUCTURE FICHIERS)

```
tokossa/
├── app/
│   ├── (shop)/                    ← Layout boutique
│   │   ├── page.tsx               ← Homepage
│   │   ├── produits/
│   │   │   ├── page.tsx           ← Catalogue
│   │   │   └── [slug]/page.tsx    ← Fiche produit
│   │   ├── panier/page.tsx
│   │   └── checkout/page.tsx
│   ├── (account)/                 ← Layout client
│   │   ├── commandes/page.tsx
│   │   └── profil/page.tsx
│   ├── (admin)/                   ← Dashboard admin
│   │   ├── dashboard/page.tsx
│   │   ├── produits/page.tsx
│   │   └── commandes/page.tsx
│   └── api/
│       ├── produits/route.ts
│       ├── commandes/route.ts
│       ├── paiement/
│       │   ├── initier/route.ts
│       │   └── webhook/route.ts   ← KKiaPay webhook
│       ├── whatsapp/
│       │   ├── confirmer/route.ts
│       │   └── suivi/route.ts
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                        ← Composants réutilisables
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   ├── shop/
│   │   ├── ProductCard.tsx        ← Carte produit
│   │   ├── ProductGrid.tsx
│   │   ├── CartDrawer.tsx         ← Panier latéral
│   │   ├── LiveNotification.tsx   ← "Kevin vient d'acheter..."
│   │   └── StockCounter.tsx       ← "Plus que X en stock"
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── PaymentSelector.tsx    ← MTN / Moov / Cash
│   │   └── OrderSummary.tsx
│   └── layout/
│       ├── Navbar.tsx
│       ├── BottomNav.tsx          ← Nav mobile fixe
│       └── AnnounceBanner.tsx
├── lib/
│   ├── db.ts                      ← Prisma client
│   ├── kkiapay.ts                 ← Intégration KKiaPay
│   ├── whatsapp.ts                ← Messages automatiques
│   ├── email.ts                   ← Resend
│   └── utils.ts
├── prisma/
│   └── schema.prisma              ← Schéma DB complet
├── public/
│   └── images/
└── .ai/
    ├── agents/
    ├── skills/
    └── mcp/
```

---

## 3. SCHÉMA BASE DE DONNÉES (Prisma)

```prisma
model User {
  id          String    @id @default(cuid())
  phone       String    @unique        // Principal identifiant
  name        String?
  email       String?
  address     String?
  quarter     String?                  // Quartier Cotonou
  orders      Order[]
  createdAt   DateTime  @default(now())
}

model Product {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String
  price       Int                      // En FCFA
  oldPrice    Int?                     // Prix barré
  images      String[]                 // URLs Cloudinary
  stock       Int       @default(0)
  category    String
  isActive    Boolean   @default(true)
  isFeatured  Boolean   @default(false)
  orderItems  OrderItem[]
  createdAt   DateTime  @default(now())
}

model Order {
  id           String      @id @default(cuid())
  userId       String?
  user         User?       @relation(fields: [userId], references: [id])
  customerName String
  phone        String
  address      String
  quarter      String
  items        OrderItem[]
  total        Int
  status       OrderStatus @default(PENDING)
  paymentMethod PaymentMethod
  paymentRef   String?                 // Référence KKiaPay
  paidAt       DateTime?
  deliveredAt  DateTime?
  notes        String?
  createdAt    DateTime    @default(now())
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Int                        // Prix au moment de l'achat
}

enum OrderStatus {
  PENDING       // En attente
  CONFIRMED     // Confirmée par admin
  DELIVERING    // En livraison
  DELIVERED     // Livrée
  CANCELLED     // Annulée
}

enum PaymentMethod {
  MTN_MOBILE_MONEY
  MOOV_MONEY
  WAVE
  CASH_ON_DELIVERY
}
```

---

## 4. FLUX COMMANDE COMPLET

```
CLIENT                    SYSTÈME                        ADMIN / LIVREUR
  │                          │                                │
  │── Ajoute au panier ──►   │                                │
  │── Checkout form ────►    │                                │
  │   (nom, tel, adresse)    │                                │
  │                          │── Crée Order (PENDING) ──►    │
  │                          │                                │
  [Choisit MTN Money]        │                                │
  │── Paiement KKiaPay ──►   │                                │
  │◄── Redirect KKiaPay ──   │                                │
  │   (saisit code MTN)      │                                │
  │                          │◄── Webhook KKiaPay ──          │
  │                          │── Order → CONFIRMED            │
  │                          │                                │
  │◄── WhatsApp auto ──      │── WhatsApp admin ──────────►   │
  │  "Commande confirmée     │  "Nouvelle commande #123       │
  │   #123 - 8500F payé"     │   Kevin - 8500F - Cadjehoun"   │
  │                          │                                │
  │                          │                    Admin → DELIVERING
  │◄── WhatsApp suivi ──     │                                │
  │  "Ta commande est en     │                                │
  │   route ! 🛵"            │                                │
  │                          │                    Admin → DELIVERED
  │◄── WhatsApp final ──     │                                │
  │  "Merci Kevin ! Note     │                                │
  │   ton expérience 🌟"     │                                │
```

---

## 5. COMPOSANTS UX HAUTE CONVERSION

### Éléments obligatoires sur chaque page produit

```
✅ Timer urgence        → "Promo expire dans 08:47:23"
✅ Stock réel visible   → "Plus que 4 en stock ⚡"
✅ Barre de stock       → Visuelle colorée (rouge si < 20%)
✅ Avis clients         → Note + nombre + photos si possible
✅ Livraison rassurante → "Livré demain à Cotonou 🚀"
✅ Paiement adapté      → MTN / Moov / Cash visible dès le départ
✅ WhatsApp bouton      → "Commander via WhatsApp" (fallback)
✅ Upsell               → "Les clients achètent aussi…"
✅ Live social proof    → "Kevin à Cadjehoun vient d'acheter"
✅ Trust badges         → Livraison 24h | Retour 7j | Paiement sécurisé
```

### Psychologie de conversion appliquée

```
URGENCE      → Timer countdown, stock limité, badge "Flash"
PREUVE       → Avis géolocalisés Cotonou, compteur ventes
CONFIANCE    → Paiement à la livraison disponible (réduit friction)
FACILITÉ     → Checkout 3 étapes max, WhatsApp comme fallback
APPARTENANCE → "500 Béninois nous font déjà confiance"
```

---

## 6. PLAN DE DÉVELOPPEMENT (8 SEMAINES)

### Phase 1 — MVP (Semaines 1-2)
```
PRIORITÉ ABSOLUE — Objectif : 1ère vente
─────────────────────────────────────────
□ Setup Next.js + Tailwind + Prisma
□ Page produit (1 seul produit pour commencer)
□ Formulaire commande simplifié
□ Bouton "Commander via WhatsApp" (pré-rempli automatique)
□ Paiement à la livraison
□ Admin basique (voir les commandes)
→ Résultat : Tu peux vendre sans paiement en ligne
```

### Phase 2 — E-commerce complet (Semaines 3-4)
```
OBJECTIF : Automatiser le paiement
──────────────────────────────────
□ Catalogue multi-produits
□ Panier (CartDrawer)
□ Checkout complet (nom, tel, adresse, quartier)
□ Intégration KKiaPay (MTN + Moov + Wave)
□ Webhook paiement → statut commande auto
□ Dashboard admin (confirmer, livrer)
□ Page suivi commande client
```

### Phase 3 — Automation & Conversion (Semaines 5-6)
```
OBJECTIF : Augmenter conversion + fidéliser
────────────────────────────────────────────
□ WhatsApp auto (confirmation + suivi + relance)
□ Email confirmation (Resend)
□ Notification live ventes (social proof)
□ Urgency timers + stock counters
□ Upsell "produits similaires"
□ Abandon panier relance WhatsApp
```

### Phase 4 — Scale (Semaines 7-8)
```
OBJECTIF : Performance + Analytics
─────────────────────────────────────
□ Facebook Pixel + Conversions API
□ Vercel Analytics
□ Redis cache (si trafic > 500/jour)
□ SEO pages produits
□ Avis clients système
□ Programme de parrainage
```

---

## 7. AGENTS IA CLAUDE CODE

### Dev Agent
```yaml
role: Architecture & Performance
focus:
  - Next.js App Router
  - Prisma ORM queries
  - API Routes optimisées
  - Core Web Vitals mobile
skills:
  - next-app-router
  - prisma-orm
  - tailwind-mobile-first
```

### Commerce Agent
```yaml
role: Logique e-commerce
focus:
  - Gestion panier (Zustand)
  - Système de commandes
  - Gestion stock temps réel
  - Logique promotions
skills:
  - cart-management
  - order-workflow
  - stock-management
```

### Payment Agent
```yaml
role: Paiements & Transactions
focus:
  - Intégration KKiaPay SDK
  - Webhook sécurisé
  - Vérification transactions
  - Cash on Delivery workflow
skills:
  - kkiapay-integration
  - webhook-handler
  - payment-verification
```

### Automation Agent
```yaml
role: WhatsApp & Notifications
focus:
  - Messages WhatsApp automatiques
  - Templates messages (6 types)
  - Email Resend
  - Push notifications (futur)
skills:
  - whatsapp-automation
  - message-templates
  - email-automation
```

### Analytics Agent
```yaml
role: Données & Conversion
focus:
  - Facebook Pixel events
  - Funnel d'achat
  - Produits best-sellers
  - Taux d'abandon panier
skills:
  - fb-pixel-events
  - conversion-tracking
  - funnel-analysis
```

---

## 8. MCP CONNECTEURS

```yaml
filesystem:
  usage: Gestion fichiers projet, assets
  
postgres:
  usage: Requêtes DB directes, migrations
  
github:
  usage: Versionning, branches features
  
browser:
  usage: Test UX mobile, debug checkout
  
kkiapay:
  usage: Monitoring transactions, webhooks
```

---

## 9. TEMPLATES WHATSAPP (6 MESSAGES CLÉS)

```
1. CONFIRMATION COMMANDE
   "Bonjour [Prénom] ! 🎉
   Ta commande TOKOSSA #[ID] est confirmée.
   📦 [Produits]
   💰 Total : [Prix]F
   🏠 Livraison : [Adresse], [Quartier]
   ⏱️ Délai : 24h maximum
   Merci de ta confiance ! 🙏"

2. EN ROUTE
   "Bonjour [Prénom] ! 🛵
   Ta commande est en route !
   Notre livreur arrive dans ~[durée].
   📍 Assure-toi d'être disponible.
   Contact livreur : [tel]"

3. LIVRÉE
   "Commande livrée ! ✅
   J'espère que tu es satisfait(e) [Prénom].
   Une note rapide nous aiderait beaucoup : [lien]
   À bientôt sur TOKOSSA ! 🛍️"

4. ABANDON PANIER (après 2h)
   "Hey [Prénom] 👋
   Tu as laissé [Produit] dans ton panier !
   Il reste seulement [stock] en stock. ⚡
   Commander : [lien]
   Des questions ? Réponds ici 😊"

5. RELANCE INACTIF (après 7 jours)
   "[Prénom], c'est TOKOSSA ! 🔥
   Nouveau produit qui va te plaire :
   [Produit] — [Prix]F
   Livraison demain à Cotonou 🚀
   Voir : [lien]"

6. POST-ACHAT UPSELL (après livraison + 2 jours)
   "Bonjour [Prénom] !
   Les clients qui ont acheté [Produit]
   adorent aussi [Produit2] ⭐
   -10% pour toi ce week-end : [code]
   [lien]"
```

---

## 10. CHECKLIST LANCEMENT

```
TECHNIQUE
□ Domaine tokossa.bj ou tokossa.com
□ SSL activé (HTTPS obligatoire pour KKiaPay)
□ Prisma migrations executées
□ Variables d'env configurées (Vercel)
□ KKiaPay compte pro activé
□ WhatsApp Business API approuvée
□ Cloudinary compte créé

UX / CONTENU
□ Photos produits haute qualité (min 5/produit)
□ Descriptions produits complètes
□ Prix en FCFA clairement affichés
□ Quartiers de livraison listés
□ Page "Qui sommes-nous ?" / confiance
□ Conditions retour visibles

MARKETING
□ Facebook Business Manager configuré
□ Pixel Facebook installé + testé
□ Instagram Business connecté
□ WhatsApp Business numéro professionnel
□ 5-10 avis clients avant lancement (amis/famille)
□ Budget pub initial : 5 000 - 10 000 FCFA/jour

LEGAL
□ CGV (Conditions Générales de Vente)
□ Politique de confidentialité
□ Mentions légales
```

---

## 11. OBJECTIFS & KPIs

| Période | Objectif | KPIs à surveiller |
|---|---|---|
| Semaine 1-2 | 1ère vente | Taux conversion, rebond mobile |
| Mois 1 | 2-3 ventes/jour | Coût acquisition, panier moyen |
| Mois 3 | 10 ventes/jour | ROAS pub, taux fidélisation |
| Mois 6 | 500 000 FCFA/mois | LTV client, NPS |

---

*Document généré pour TOKOSSA — Architecture v1.0*
*Stack Next.js — Marché Bénin — Mobile First*
