# TOKOSSA — E-commerce Bénin 🇧🇯

**TOKOSSA** est une plateforme e-commerce **mobile-first** optimisée pour le marché béninois, avec un focus sur les conversions et la rapidité.

> **Principalement ciblé Cotonou** • **Paiement Local (KKiaPay)** • **WhatsApp + SMS** • **Zero-Config Déploiement**

---

## 📸 Vue d'ensemble

```
CLIENT                    TOKOSSA PLATFORM                  ADMIN
  │                              │                             │
  ├─► Parcourt produits ────────►│                             │
  ├─► Ajoute au panier ─────────►│                             │
  ├─► Checkout ──────────────────►│                             │
  ├─► Paiement KKiaPay ─────────►│                             │
  │                              │◄── Confirmation WhatsApp ──►│
  │                              │                        ┌────┴────┐
  │◄── Notification WhatsApp ────│                        │ Prépare │
  │◄── Suivi commande ───────────│                        │ Livraison
  │                              │                        └────┬────┘
  │◄── Confirmation Final ───────│                             │
```

---

## 🛠️ Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | Next.js 14 (App Router) + React 18 |
| **Styling** | Tailwind CSS 3 |
| **Backend** | API Routes Next.js (Serverless) |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js v5 + OTP WhatsApp |
| **Paiement** | KKiaPay (MTN/Moov/Wave) + Cash on Delivery |
| **Messaging** | Twilio WhatsApp Business API |
| **Email** | Resend.com |
| **Images** | Cloudinary CDN |
| **Hébergement** | Vercel (Frontend) + Railway/Supabase (DB) |
| **Analytics** | Vercel Web Analytics + Facebook Pixel |

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/HACKINGJOJO/TOKOSSA.git
cd TOKOSSA

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# ⚠️ Remplissez les variables (voir section Configuration ci-dessous)

# 4. Générer le client Prisma
npm run prisma:generate

# 5. Sync base de données
npm run prisma:push

# 6. Démarrer en développement
npm run dev
```

Accédez à **http://localhost:3000**

---

## 📁 Structure du Projet

```
tokossa/
│
├── app/                          # Next.js App Router
│   ├── (shop)/                   # Public - Boutique client
│   │   ├── page.tsx              # Accueil
│   │   ├── products/[id]/        # Détail produit
│   │   ├── checkout/             # Panier & checkout
│   │   └── layout.tsx
│   │
│   ├── (account)/                # Authentification & compte
│   │   ├── login/                # Connexion OTP
│   │   ├── profile/              # Profil utilisateur
│   │   ├── orders/               # Mes commandes
│   │   └── loyalty/              # Points de fidélité
│   │
│   ├── (admin)/                  # 🔒 Admin Dashboard
│   │   ├── dashboard/            # Vue d'ensemble
│   │   ├── dashboard/products/   # Gestion produits
│   │   ├── dashboard/orders/     # Gestion commandes
│   │   ├── dashboard/promos/     # Codes promos
│   │   ├── dashboard/livreurs/   # Gestion livreurs
│   │   ├── dashboard/avis/       # Modération avis
│   │   └── dashboard/stock/      # Alertes réapprovisionnement
│   │
│   ├── api/                      # 🔌 API Routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── products/             # Gestion produits
│   │   ├── commandes/            # Création commandes
│   │   ├── paiement/             # KKiaPay webhook
│   │   ├── reviews/              # Avis clients
│   │   ├── promos/               # Validation codes
│   │   ├── loyalty/              # Points fidélité
│   │   └── admin/                # 🔒 Routes admin
│   │
│   └── layout.tsx                # Layout global
│
├── components/
│   ├── ui/                       # Composants réutilisables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   │
│   ├── shop/                     # Composants boutique
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetail.tsx
│   │   └── ...
│   │
│   ├── checkout/                 # Checkout flow
│   │   ├── CartSummary.tsx
│   │   ├── DeliveryForm.tsx
│   │   ├── PaymentMethods.tsx
│   │   └── OrderConfirmation.tsx
│   │
│   └── layout/                   # Navigation & layouts
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Navigation.tsx
│       └── ...
│
├── lib/                          # Utilitaires & configs
│   ├── db.ts                     # Prisma client
│   ├── auth.ts                   # NextAuth config
│   ├── admin-auth.ts             # Admin protection
│   ├── rate-limit.ts             # Rate limiting
│   ├── kkiapay.ts                # KKiaPay API
│   ├── whatsapp.ts               # WhatsApp API
│   ├── email.ts                  # Email service
│   ├── utils.ts                  # Utilitaires
│   └── constants.ts              # Constantes
│
├── prisma/
│   ├── schema.prisma             # Schéma BD
│   └── migrations/               # Historique migrations
│
├── public/                       # Fichiers statiques
│   └── images/
│
├── styles/                       # CSS global
│   └── globals.css
│
├── .env.example                  # Template variables
├── .env.local                    # ⚠️ Variables locales (ignoré)
├── next.config.js                # Config Next.js
├── tailwind.config.js            # Config Tailwind
├── tsconfig.json                 # Config TypeScript
└── package.json
```

---

## ✨ Features Principales

### 🛍️ Boutique Client
- ✅ Catalogue produits avec images Cloudinary
- ✅ Filtrage par catégorie, prix, rating
- ✅ Avis clients vérifiés (social proof)
- ✅ Notification urgence ("Promo expire dans...")
- ✅ Stock en temps réel + barre visuelle
- ✅ Livraison rassurante ("Livré demain")

### 🛒 Panier & Checkout
- ✅ Panier persistant (localStorage)
- ✅ Codes promos dynamiques
- ✅ Points de fidélité déductibles
- ✅ Paiement multi-méthode (MTN, Moov, Wave, Cash)
- ✅ Validation montants côté serveur
- ✅ Livraison par quartier (avec tarifs)

### 💳 Paiement KKiaPay
- ✅ Intégration complète KKiaPay
- ✅ Webhook de confirmation
- ✅ Vérification signature montants
- ✅ Gestion split payment
- ✅ Réconciliation transaction

### 👤 Compte Client
- ✅ Authentification OTP WhatsApp
- ✅ Profil utilisateur
- ✅ Historique commandes
- ✅ Suivi commande en direct
- ✅ Points de fidélité + échange
- ✅ Adresses sauvegardées

### 📊 Dashboard Admin
- ✅ Vue d'ensemble (KPIs, stats)
- ✅ Gestion produits (CRUD)
- ✅ Gestion commandes + statuts
- ✅ Codes promos (création, limite d'usage)
- ✅ Gestion livreurs + zones
- ✅ Modération avis
- ✅ Alertes réapprovisionnement stock
- ✅ Export commandes (CSV)

### 📱 Notifications
- ✅ WhatsApp confirmation commande
- ✅ WhatsApp suivi livraison
- ✅ Email confirmation (optionnel)
- ✅ SMS via Twilio (si configuré)

### 🛡️ Sécurité
- ✅ Rate limiting (3-30 req/min par IP)
- ✅ Validation montants côté serveur
- ✅ Protection routes admin
- ✅ Vérification signature KKiaPay
- ✅ Sanitization inputs (XSS)
- ✅ Security headers HTTP (CSP, X-Frame-Options, etc)
- ✅ JWT sessions

---

## ⚙️ Configuration

### Variables d'Environnement

Créez `.env.local` avec :

```env
# DATABASE
DATABASE_URL="postgresql://user:password@localhost:5432/tokossa"

# NEXTAUTH
NEXTAUTH_SECRET="votre-secret-aleatoire-complexe"
NEXTAUTH_URL="http://localhost:3000"

# ADMIN
ADMIN_EMAIL="admin@tokossa.com"
ADMIN_PASSWORD="votre-mot-de-passe-admin-complexe"

# KKIAPAY
KKIAPAY_API_KEY="votre-cle-api-kkiapay"
KKIAPAY_SECRET="votre-secret-kkiapay"
KKIAPAY_WEBHOOK_SECRET="votre-secret-webhook"

# TWILIO WHATSAPP
TWILIO_ACCOUNT_SID="votre-account-sid"
TWILIO_AUTH_TOKEN="votre-auth-token"
TWILIO_WHATSAPP_NUMBER="+237XXX"
TWILIO_WHATSAPP_TEMPLATE_ID="votre-template-id"

# RESEND (EMAIL)
RESEND_API_KEY="votre-cle-resend"
RESEND_FROM_EMAIL="noreply@tokossa.com"

# CLOUDINARY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="votre-cloud-name"
CLOUDINARY_API_KEY="votre-api-key"
CLOUDINARY_API_SECRET="votre-api-secret"

# FACEBOOK PIXEL
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="votre-pixel-id"

# VERCEL ANALYTICS (optionnel)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="votre-analytics-id"
```

### Commandes Utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Prisma Studio (interface visuelle)
npm run prisma:studio

# Sync schéma BD
npm run prisma:push

# Migrations
npm run prisma:migrate dev --name "nom-migration"

# TypeScript check
npx tsc --noEmit

# Linting
npm run lint
```

---

## 🚀 Déploiement

### Vercel (Frontend)

```bash
# 1. Connecter votre repo
vercel link

# 2. Configurer les variables d'environnement
vercel env pull  # Tire les vars du dashboard

# 3. Déployer
vercel deploy --prod
```

### Database (Railway ou Supabase)

**Option 1: Railway**
```bash
# 1. Créer un projet Railway
# 2. Ajouter PostgreSQL
# 3. Copier DATABASE_URL dans .env
# 4. npm run prisma:push
```

**Option 2: Supabase**
```bash
# 1. Créer un projet Supabase
# 2. Copier CONNECTION_STRING dans DATABASE_URL
# 3. npm run prisma:push
```

---

## 🧪 Tests

```bash
# Exécuter les tests
npm test

# Tests avec coverage
npm test -- --coverage

# Mode watch
npm test -- --watch
```

---

## 🔒 Sécurité

### Validation & Vérification
- ✅ **Montants côté serveur** — Recalcul complet des prix
- ✅ **Signatures KKiaPay** — Vérification webhook
- ✅ **Rate limiting** — 3-30 requêtes/min par IP
- ✅ **Admin protection** — Sessions JWT + vérification middleware
- ✅ **Input sanitization** — trim() + max length
- ✅ **Security headers** — CSP, X-Frame-Options, HSTS

### Best Practices
- Jamais stocker les credentials en dur
- Utiliser `.env` pour les secrets
- Activer HTTPS en production
- Ajouter 2FA pour l'admin
- Sauvegarder la DB régulièrement
- Monitorer les logs d'erreur

---

## 📖 API Documentation

### Endpoints Principaux

#### 🛍️ Produits
```http
GET  /api/products              # Lister les produits
GET  /api/products/:id          # Détail produit
POST /api/admin/products        # 🔒 Créer produit
PUT  /api/admin/products/:id    # 🔒 Modifier produit
DELETE /api/admin/products/:id  # 🔒 Supprimer produit
```

#### 📦 Commandes
```http
POST /api/commandes            # Créer commande
GET  /api/commandes            # Mes commandes (user)
GET  /api/admin/orders         # 🔒 Toutes commandes
PUT  /api/admin/orders/:id     # 🔒 Mettre à jour statut
```

#### 💳 Paiement
```http
POST /api/paiement/initier     # Initier paiement KKiaPay
POST /api/paiement/webhook     # 🔒 Webhook KKiaPay
```

#### ⭐ Avis
```http
GET  /api/reviews?productId=x  # Avis d'un produit
POST /api/reviews              # Soumettre un avis
```

#### 🎟️ Promos
```http
POST /api/promos/validate      # Valider code promo
```

#### 💚 Fidélité
```http
GET  /api/loyalty              # Voir mon solde
POST /api/loyalty/redeem       # Utiliser points
```

---

## 🤝 Contribution

### Workflow Git

```bash
# 1. Créer une branche feature
git checkout -b feature/ma-feature

# 2. Faire les changements
git add app/api/ma-route.ts

# 3. Commit
git commit -m "feat: description courte"

# 4. Push
git push origin feature/ma-feature

# 5. Créer une Pull Request sur GitHub
```

### Conventions de Commit

```
feat:    Nouvelle fonctionnalité
fix:     Correction de bug
docs:    Documentation
style:   Formatage, pas de logique
refactor: Refactorisation
test:    Tests
chore:   Build, deps, config
perf:    Performance
```

### Standards de Code

```typescript
// ✅ Server Component par défaut (data fetching)
export default async function Page() {
  const products = await prisma.product.findMany()
  return <ProductList products={products} />
}

// ✅ Client Component si interactivité
'use client'
export default function AddToCart() {
  const { addItem } = useCart()
  return <button onClick={() => addItem(id)}>Ajouter</button>
}

// ✅ Sélectionner uniquement les champs nécessaires
const orders = await prisma.order.findMany({
  select: { id: true, total: true, status: true },
  where: { status: 'PENDING' },
  take: 20,
})
```

---

## 📊 Objectifs Business

| Période | Objectif | Statut |
|---------|----------|--------|
| **Semaine 1-2** | 1ère vente | ✅ |
| **Mois 1** | 2-3 ventes/jour | 🚀 |
| **Mois 3** | 10 ventes/jour | 🎯 |
| **Mois 6** | 500k FCFA/mois | 📈 |

---

## 🐛 Support & Bugs

Trouvé un bug ? Créez une issue sur GitHub :
- **Titre** : Description courte
- **Description** : Contexte détaillé
- **Reproduction** : Étapes pour reproduire
- **Attendu** : Le comportement souhaité

---

## 📜 License

MIT — Libre d'utilisation

---

## 👨‍💻 Auteur

**TOKOSSA** — Plateforme e-commerce pour le marché béninois

**Crée avec ❤️ pour Cotonou**

---

## 📞 Contact

- **Email** : [votre-email]
- **GitHub** : https://github.com/HACKINGJOJO/TOKOSSA
- **WhatsApp** : [votre-numéro]

---

**Version** : 1.0.0
**Dernière mise à jour** : Mars 2026

