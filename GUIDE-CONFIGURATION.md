# TOKOSSA - Guide de Configuration Complet

> Document de configuration et de mise en production pour la plateforme e-commerce TOKOSSA.
> Derniere mise a jour : 10 Mars 2026

---

## Table des Matieres

1. [Pre-requis](#1-pre-requis)
2. [Installation locale](#2-installation-locale)
3. [Variables d'environnement](#3-variables-denvironnement)
4. [Base de donnees PostgreSQL](#4-base-de-donnees-postgresql)
5. [Paiement KKiaPay](#5-paiement-kkiapay)
6. [WhatsApp Business Cloud API](#6-whatsapp-business-cloud-api)
7. [Emails avec Resend](#7-emails-avec-resend)
8. [Images avec Cloudinary](#8-images-avec-cloudinary)
9. [Authentification Admin](#9-authentification-admin)
10. [Facebook Pixel Analytics](#10-facebook-pixel-analytics)
11. [Facebook Ads — Dashboard Marketing](#11-facebook-ads--dashboard-marketing)
12. [PWA et Notifications Push](#12-pwa-et-notifications-push)
13. [Tests Automatises](#13-tests-automatises)
14. [Deploiement Vercel](#14-deploiement-vercel)
15. [Architecture des Fichiers](#15-architecture-des-fichiers)
16. [Fonctionnalites Implementees](#16-fonctionnalites-implementees)
17. [Commandes Utiles](#17-commandes-utiles)
18. [Depannage](#18-depannage)

---

## 1. Pre-requis

| Outil | Version minimale | Installation |
|-------|-----------------|--------------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Inclus avec Node.js |
| PostgreSQL | v14+ | https://postgresql.org ou Supabase/Railway |
| Git | v2+ | https://git-scm.com |

---

## 2. Installation Locale

```bash
# 1. Cloner le projet
git clone <url-du-repo> tokossa
cd tokossa

# 2. Installer les dependances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Configurer les variables (voir section 3)
# Editer le fichier .env avec vos valeurs

# 5. Generer le client Prisma
npm run prisma:generate

# 6. Synchroniser la base de donnees
npm run prisma:push

# 7. (Optionnel) Peupler la base avec des donnees de test
npm run prisma:seed

# 8. Lancer le serveur de developpement
npm run dev
```

Le site est accessible sur `http://localhost:3000`
L'admin est accessible sur `http://localhost:3000/dashboard`

---

## 3. Variables d'Environnement

Copiez `.env.example` vers `.env` et configurez chaque variable :

### Base

| Variable | Description | Exemple |
|----------|------------|---------|
| `NEXT_PUBLIC_APP_URL` | URL publique du site | `http://localhost:3000` (dev) / `https://tokossa.bj` (prod) |
| `NEXT_PUBLIC_BASE_URL` | URL de base pour le SEO (sitemap, JSON-LD) | `https://tokossa.bj` |

### Base de Donnees

| Variable | Description | Exemple |
|----------|------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:password@localhost:5432/tokossa?schema=public` |

### Authentification (NextAuth)

| Variable | Description | Comment obtenir |
|----------|------------|----------------|
| `NEXTAUTH_URL` | URL du site | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Cle secrete (min 32 caracteres) | `openssl rand -base64 32` |

### Paiement (KKiaPay)

| Variable | Description | Comment obtenir |
|----------|------------|----------------|
| `KKIAPAY_PUBLIC_KEY` | Cle publique KKiaPay | Voir section 5 |
| `KKIAPAY_PRIVATE_KEY` | Cle privee KKiaPay | Voir section 5 |

### WhatsApp Business

| Variable | Description | Comment obtenir |
|----------|------------|----------------|
| `WHATSAPP_API_TOKEN` | Token API WhatsApp Cloud | Voir section 6 |
| `WHATSAPP_PHONE_NUMBER_ID` | ID du numero WhatsApp Business | Voir section 6 |
| `NEXT_PUBLIC_WHATSAPP_BUSINESS` | Numero WhatsApp affiche aux clients | `22901XXXXXXXX` |
| `ADMIN_WHATSAPP_NUMBER` | Numero WhatsApp admin (alertes) | `22901XXXXXXXX` |

### Email (Resend)

| Variable | Description | Comment obtenir |
|----------|------------|----------------|
| `RESEND_API_KEY` | Cle API Resend | Voir section 7 |
| `EMAIL_FROM` | Adresse email expediteur | `noreply@tokossa.bj` |

### Images (Cloudinary)

| Variable | Description | Comment obtenir |
|----------|------------|----------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary | Voir section 8 |
| `CLOUDINARY_API_KEY` | Cle API Cloudinary | Voir section 8 |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary | Voir section 8 |

### Admin

| Variable | Description | Exemple |
|----------|------------|---------|
| `ADMIN_EMAIL` | Email de connexion admin | `admin@tokossa.bj` |
| `ADMIN_PASSWORD` | Mot de passe admin | Un mot de passe fort |

### Analytics & Facebook Ads

| Variable | Description | Comment obtenir |
|----------|------------|----------------|
| `NEXT_PUBLIC_FB_PIXEL_ID` | ID du Facebook Pixel | Voir section 10 |
| `FACEBOOK_ACCESS_TOKEN` | Token System User Meta (Ads) | Voir section 11 |
| `FACEBOOK_AD_ACCOUNT_ID` | ID compte publicitaire (sans `act_`) | Voir section 11 |

---

## 4. Base de Donnees PostgreSQL

### Option A : Base locale

```bash
# macOS avec Homebrew
brew install postgresql@15
brew services start postgresql@15

# Creer la base
createdb tokossa

# URL de connexion
DATABASE_URL="postgresql://$(whoami)@localhost:5432/tokossa?schema=public"
```

### Option B : Supabase (recommande pour production)

1. Creer un compte sur https://supabase.com
2. Creer un nouveau projet
3. Aller dans **Settings > Database > Connection string**
4. Copier l'URL (Transaction mode pour serverless)
5. Ajouter `?pgbouncer=true&connection_limit=1` a l'URL pour Vercel

```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

### Option C : Railway

1. Creer un compte sur https://railway.app
2. Creer un service PostgreSQL
3. Copier l'URL de connexion dans les variables

### Commandes Prisma

```bash
# Generer le client TypeScript depuis le schema
npm run prisma:generate

# Synchroniser le schema avec la base (dev)
npm run prisma:push

# Interface visuelle pour voir/editer les donnees
npm run prisma:studio

# Peupler avec des donnees de test
npm run prisma:seed
```

### Schema des Modeles

| Modele | Description |
|--------|------------|
| `User` | Clients et admins (auth par telephone) |
| `Product` | Produits avec prix en FCFA, images, stock |
| `Cart` / `CartItem` | Panier (avec session pour non-connectes) |
| `Order` / `OrderItem` | Commandes avec statuts (PENDING > CONFIRMED > DELIVERING > DELIVERED) |
| `PromoCode` | Codes promo (% ou montant fixe) |
| `Review` | Avis clients (moderation admin) |
| `LoyaltyPoint` | Historique des points de fidelite |
| `WhatsAppLog` | Log des messages WhatsApp envoyes |
| `AbandonedCart` | Paniers abandonnes pour relance |
| `SaleNotification` | Notifications de vente (social proof) |
| `ReturnRequest` | Demandes de retour produit |
| `DeliveryPerson` | Livreurs (gestion admin) |

---

## 5. Paiement KKiaPay

KKiaPay gere les paiements Mobile Money (MTN, Moov, Celtis/Wave) au Benin.

### Configuration

1. Creer un compte sur https://app.kkiapay.me
2. Aller dans **Parametres > API Keys**
3. Copier la cle publique (`pk_...`) et privee (`sk_...`)
4. En dev, utiliser les cles **sandbox** (mode test)
5. En prod, utiliser les cles **live**

```env
KKIAPAY_PUBLIC_KEY=pk_xxxxxxxxxxxxxxxx
KKIAPAY_PRIVATE_KEY=sk_xxxxxxxxxxxxxxxx
```

### Fonctionnement

```
Client choisit Mobile Money > KKiaPay SDK s'ouvre > Client valide
> KKiaPay envoie webhook POST /api/paiement/webhook
> Notre API verifie la transaction et confirme la commande
```

### Webhook KKiaPay

Configurez l'URL du webhook dans KKiaPay Dashboard :
- **Dev** : `https://votre-ngrok.io/api/paiement/webhook`
- **Prod** : `https://tokossa.bj/api/paiement/webhook`

### Paiement en 2x

Le systeme supporte le paiement en 2 fois sans frais :
- 1ere partie payee via KKiaPay (50%)
- 2eme partie payee a la livraison (Cash)
- Disponible pour les commandes >= 10 000 FCFA
- Non disponible avec Cash on Delivery

### Methodes supportees

| Methode | Code | Description |
|---------|------|------------|
| MTN Mobile Money | `MTN_MOBILE_MONEY` | Paiement via MTN |
| Moov Money | `MOOV_MONEY` | Paiement via Moov |
| Celtis Cash | `CELTIS_MONEY` | Paiement via Wave/Celtis |
| Cash a la livraison | `CASH_ON_DELIVERY` | Payer en especes au livreur |

---

## 6. WhatsApp Business Cloud API

L'API officielle Meta pour envoyer des messages WhatsApp automatises.

### Configuration Etape par Etape

1. **Creer une application Meta** :
   - Aller sur https://developers.facebook.com
   - Creer une nouvelle application (type "Business")

2. **Activer WhatsApp** :
   - Dans l'application, cliquer "Ajouter un produit" > WhatsApp
   - Suivre le guide "Getting Started"

3. **Recuperer les identifiants** :
   - **Phone Number ID** : dans WhatsApp > Getting Started
   - **Token temporaire** : dans WhatsApp > Getting Started (valide 24h)

4. **Token permanent (production)** :
   - Aller dans Business Settings > System Users
   - Creer un System User avec role Admin
   - Generer un token permanent avec les permissions `whatsapp_business_messaging`

5. **Verifier un numero de test** :
   - Dans WhatsApp > Getting Started > "To" field
   - Ajouter votre numero de test et verifier par SMS

```env
WHATSAPP_API_TOKEN=EAAxxxxxxx...   # Token permanent (System User)
WHATSAPP_PHONE_NUMBER_ID=1234567890  # ID du numero
NEXT_PUBLIC_WHATSAPP_BUSINESS=22901XXXXXXXX  # Numero public
ADMIN_WHATSAPP_NUMBER=22901XXXXXXXX  # Numero admin pour alertes
```

### Messages Envoyes Automatiquement

| Evenement | Template | Description |
|-----------|----------|------------|
| Commande confirmee | `order_confirmation` | Details de la commande au client |
| En livraison | `order_delivering` | Notification + contact livreur |
| Livree | `order_delivered` | Confirmation + lien avis |
| Panier abandonne | `cart_abandoned` | Relance apres 2h |
| Reactivation | `reactivation` | Client inactif depuis 7+ jours |
| Stock bas | (admin) | Alerte admin quand stock < 5 |

### Notes Importantes

- En mode **developpement** : les messages sont logges dans la console (pas envoyes)
- En mode **production** : les messages sont envoyes via l'API Meta
- Format telephone Benin : `229` + `01XXXXXXXX` (10 chiffres)

---

## 7. Emails avec Resend

Resend est utilise pour les emails transactionnels (confirmations, etc.).

### Configuration

1. Creer un compte sur https://resend.com
2. Aller dans **API Keys** et creer une cle
3. Configurer votre domaine dans **Domains** (ajouter les records DNS)

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@tokossa.bj
```

### Verification DNS (pour utiliser votre domaine)

Ajoutez ces records DNS chez votre registrar :
- **SPF** : `TXT` record
- **DKIM** : `CNAME` record
- **DMARC** : `TXT` record

Les valeurs exactes sont fournies par Resend apres ajout du domaine.

---

## 8. Images avec Cloudinary

Cloudinary gere l'hebergement et l'optimisation des images produit.

### Configuration

1. Creer un compte sur https://cloudinary.com
2. Aller dans **Dashboard** pour recuperer les identifiants

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxxx   # Nom du cloud
CLOUDINARY_API_KEY=123456789012345          # Cle API
CLOUDINARY_API_SECRET=abcdefghijklmnop      # Secret API
```

### Upload d'Images

L'admin peut uploader des images produit via le dashboard.
Les images sont automatiquement :
- Optimisees (format WebP/AVIF)
- Redimensionnees
- Servies via CDN

### Configuration Next.js

Les images Cloudinary sont deja autorisees dans `next.config.js` :
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
  ],
}
```

---

## 9. Authentification Admin

L'admin utilise NextAuth.js avec credentials (email/password).

### Configuration

```env
ADMIN_EMAIL=admin@tokossa.bj
ADMIN_PASSWORD=VotreMotDePasseSecurise123!
NEXTAUTH_SECRET=une-cle-secrete-de-minimum-32-caracteres
NEXTAUTH_URL=http://localhost:3000
```

### Generer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Acces

- URL de connexion : `/login`
- Dashboard : `/dashboard`
- Seul le compte admin (ADMIN_EMAIL) peut se connecter

---

## 10. Facebook Pixel Analytics

Le Facebook Pixel permet de tracker les conversions pour les campagnes publicitaires Meta.

### Configuration

1. Aller sur https://business.facebook.com
2. **Evenements > Gestionnaire d'evenements > Pixels**
3. Creer un nouveau Pixel
4. Copier l'ID du Pixel

```env
NEXT_PUBLIC_FB_PIXEL_ID=1234567890123456
```

### Evenements Trackes

| Evenement | Quand | Donnees |
|-----------|-------|---------|
| `PageView` | Chaque page | URL |
| `ViewContent` | Page produit | ID, nom, prix, categorie |
| `AddToCart` | Ajout au panier | ID, nom, prix, quantite |
| `InitiateCheckout` | Page checkout | Montant total, nb articles |
| `Purchase` | Commande confirmee | Montant, devise (XOF), ID commande |

---

## 11. Facebook Ads — Dashboard Marketing

Le dashboard Marketing permet de piloter vos campagnes Facebook/Instagram directement depuis le back office TOKOSSA, sans aller sur Meta Ads Manager.

### Ce que le dashboard affiche

- **KPIs globaux** : Dépenses, Portée, Clics, Achats, ROAS (Retour sur dépense publicitaire)
- **Funnel de conversion** : Impressions → Clics → ViewContent → AddToCart → Checkout → Achats
- **Graphique d'évolution** : Dépenses, clics, achats par jour
- **Tableau des campagnes** : Performance de chaque campagne (spend, reach, CTR, ROAS, CPA)
- **Statut du Pixel** : Événements trackés, lien vers Events Manager

### Configuration

#### Étape 1 — Créer un System User Meta

1. Aller sur https://business.facebook.com
2. **Paramètres Business** > **Utilisateurs** > **Utilisateurs système**
3. Créer un utilisateur système avec le rôle **Employé**
4. Cliquer sur **Générer nouveau token**
5. Sélectionner l'application et cocher la permission **`ads_read`**
6. Copier le token généré

#### Étape 2 — Récupérer l'Ad Account ID

1. Aller sur https://adsmanager.facebook.com
2. L'URL contient `act_XXXXXXXXX` — copier les chiffres uniquement (sans `act_`)

#### Étape 3 — Configurer les variables

```env
FACEBOOK_ACCESS_TOKEN=EAAxxxxxxx...     # Token System User (ads_read)
FACEBOOK_AD_ACCOUNT_ID=123456789012345  # ID sans le préfixe act_
```

### Périodes disponibles

| Valeur | Description |
|--------|-------------|
| `last_7d` | 7 derniers jours |
| `last_14d` | 14 derniers jours |
| `last_30d` | 30 derniers jours (défaut) |
| `last_90d` | 90 derniers jours |
| `this_month` | Mois en cours |
| `last_month` | Mois précédent |

### Notes

- Les données sont **mises en cache 5 minutes** pour éviter de dépasser les quotas Meta
- Si les variables ne sont pas configurées, le dashboard affiche un **guide de configuration**
- Le dashboard utilise l'API Meta Graph **v21.0**

---

## 12. PWA et Notifications Push

### Progressive Web App (PWA)

TOKOSSA est une PWA installable sur mobile :
- **Manifest** : `/public/manifest.json` — nom, icones, couleurs
- **Service Worker** : `/public/sw.js` — cache offline
- **Composant** : `components/PWARegister.tsx` — enregistrement automatique

Le site peut etre installe depuis Chrome/Safari :
1. Ouvrir TOKOSSA sur mobile
2. Menu navigateur > "Ajouter a l'ecran d'accueil"

### Icones PWA

Placez vos icones dans `/public/icons/` :
- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)

### Notifications Push

Le composant `PushNotificationBanner` demande la permission de notification au client.
Les notifications push necessitent un serveur VAPID (non configure par defaut).

Pour activer les notifications push en production :
1. Generer des cles VAPID
2. Configurer un service push (ex: web-push npm)
3. Stocker les subscriptions en base

---

## 13. Tests Automatises

### Lancer les Tests

```bash
# Tous les tests
npm test

# Mode watch (re-execute a chaque modification)
npm run test:watch

# Avec couverture de code
npm run test:coverage
```

### Suites de Tests

| Fichier | Nb Tests | Description |
|---------|----------|------------|
| `__tests__/lib/utils.test.ts` | 39 | Fonctions utilitaires (formatPrice, isValidBeninPhone, getDeliveryFee) |
| `__tests__/api/loyalty.test.ts` | 15 | API fidelite (credit, redeem, balance) |
| `__tests__/components/CartButton.test.tsx` | 21 | Composant panier + store Zustand |
| **Total** | **75** | |

### Technologies de Test

- **Jest** : Framework de test
- **Testing Library** : Test de composants React
- **jest-environment-jsdom** : Environnement navigateur pour les composants
- **@jest-environment node** : Environnement Node.js pour les API routes

---

## 14. Deploiement Vercel

### Preparation

1. Creer un compte sur https://vercel.com
2. Connecter votre repo GitHub

### Configuration Vercel

1. **Build Command** : `prisma generate && next build` (deja dans package.json)
2. **Output Directory** : `.next` (par defaut)
3. **Node.js Version** : 18.x

### Variables d'Environnement

Ajoutez **toutes** les variables de la section 3 dans :
- Vercel Dashboard > Settings > Environment Variables
- Selectionnez les environnements : Production, Preview, Development

### Variables Specifiques a la Production

```env
NEXT_PUBLIC_APP_URL=https://tokossa.bj
NEXT_PUBLIC_BASE_URL=https://tokossa.bj
NEXTAUTH_URL=https://tokossa.bj
NODE_ENV=production
```

### Domaine Personnalise

1. Dans Vercel > Settings > Domains
2. Ajouter `tokossa.bj`
3. Configurer les DNS chez votre registrar :
   - `A` record : `76.76.21.21`
   - `CNAME` : `cname.vercel-dns.com`

### Post-Deploiement

- [ ] Verifier que le site charge correctement
- [ ] Tester un paiement KKiaPay en mode live
- [ ] Verifier les webhooks (KKiaPay, WhatsApp)
- [ ] Tester les envois WhatsApp
- [ ] Verifier le Facebook Pixel dans Events Manager
- [ ] Verifier le sitemap : `https://tokossa.bj/sitemap.xml`
- [ ] Verifier le robots.txt : `https://tokossa.bj/robots.txt`

---

## 15. Architecture des Fichiers

```
tokossa/
├── app/
│   ├── (shop)/                 # Pages boutique client
│   │   ├── page.tsx            # Accueil
│   │   ├── produits/           # Listing + detail produit
│   │   ├── panier/             # Page panier
│   │   ├── checkout/           # Page de paiement
│   │   ├── confirmation/       # Confirmation commande
│   │   ├── favoris/            # Favoris
│   │   ├── retours/            # Demande de retour
│   │   └── a-propos/           # A propos
│   ├── (account)/              # Pages compte client
│   │   ├── profil/             # Profil utilisateur
│   │   └── commandes/          # Historique commandes
│   ├── (admin)/                # Dashboard admin
│   │   ├── login/              # Connexion admin
│   │   └── dashboard/          # Tableau de bord
│   │       ├── commandes/      # Gestion commandes (+ export CSV)
│   │       ├── produits/       # Gestion produits
│   │       ├── clients/        # Gestion clients
│   │       ├── promotions/     # Codes promo
│   │       ├── livreurs/       # Gestion livreurs
│   │       ├── avis/           # Moderation avis
│   │       ├── paniers-abandonnes/  # Relance WhatsApp paniers
│   │       ├── retours/        # Gestion retours produits
│   │       ├── marketing/      # Dashboard Facebook Ads
│   │       ├── reglages/       # Parametres boutique + frais livraison
│   │       └── outils/         # Configuration API keys (WhatsApp, KKiaPay, Cloudinary...)
│   ├── api/                    # API Routes
│   │   ├── auth/               # NextAuth
│   │   ├── commandes/          # CRUD commandes
│   │   ├── produits/           # CRUD produits
│   │   ├── paiement/           # KKiaPay (initier + webhook)
│   │   ├── whatsapp/           # Envoi WhatsApp
│   │   ├── reviews/            # Avis clients
│   │   ├── loyalty/            # Fidelite (credit + redeem)
│   │   ├── promos/             # Validation codes promo
│   │   ├── cart/               # Panier abandonne
│   │   ├── notifications/      # Notifications
│   │   └── admin/              # API admin
│   │       ├── orders/search/  # Recherche + filtres commandes
│   │       ├── orders/bulk/    # Actions groupees + suppression
│   │       ├── orders/export/  # Export CSV commandes
│   │       ├── abandoned-carts/ # Paniers abandonnes
│   │       ├── returns/        # Retours produits
│   │       ├── settings/       # Reglages boutique (DB)
│   │       └── marketing/      # Facebook Ads (Meta Graph API)
│   ├── layout.tsx              # Layout racine (PWA, meta, JSON-LD)
│   ├── sitemap.ts              # Sitemap dynamique
│   └── robots.ts               # robots.txt
├── components/
│   ├── ui/                     # Composants generiques (Button, Badge, etc.)
│   ├── shop/                   # Composants boutique
│   │   ├── ProductCard.tsx     # Carte produit
│   │   ├── ProductDetail.tsx   # Detail produit (client)
│   │   ├── ProductReviews.tsx  # Section avis
│   │   ├── StockCounter.tsx    # Compteur stock + UrgencyTimer
│   │   ├── DeliveryTimer.tsx   # Timer livraison meme jour
│   │   └── CartButton.tsx      # Bouton panier
│   ├── checkout/               # Composants checkout
│   ├── admin/                  # Composants admin
│   │   ├── AdminSidebar.tsx    # Sidebar navigation (14 liens)
│   │   ├── CommandesManager.tsx # Gestion commandes (filtres, CSV, livreurs)
│   │   └── NewOrderAlert.tsx   # Alerte nouvelle commande
│   ├── layout/                 # Navigation, header, footer
│   ├── PWARegister.tsx         # Enregistrement PWA
│   └── ui/PushNotificationBanner.tsx  # Banniere push
├── lib/
│   ├── db.ts                   # Client Prisma (singleton)
│   ├── store.ts                # Zustand store (panier)
│   ├── utils.ts                # Fonctions utilitaires
│   ├── whatsapp.ts             # API WhatsApp Business
│   ├── fbpixel.ts              # Facebook Pixel
│   └── recently-viewed.ts      # Produits recemment vus
├── prisma/
│   ├── schema.prisma           # Schema de base de donnees
│   └── seed.ts                 # Donnees de test
├── public/
│   ├── manifest.json           # Manifest PWA
│   ├── sw.js                   # Service Worker
│   └── icons/                  # Icones PWA
├── __tests__/                  # Tests automatises
│   ├── lib/utils.test.ts
│   ├── api/loyalty.test.ts
│   └── components/CartButton.test.tsx
├── __mocks__/prisma.ts         # Mock Prisma pour tests
├── jest.config.js              # Configuration Jest
├── jest.setup.ts               # Setup tests
├── next.config.js              # Configuration Next.js
├── tailwind.config.js          # Configuration Tailwind
├── package.json                # Dependances et scripts
└── .env.example                # Template variables d'env
```

---

## 16. Fonctionnalites Implementees

### Boutique Client

| Feature | Statut | Description |
|---------|--------|------------|
| Catalogue produits | OK | Listing avec filtres par categorie, tri, recherche |
| Detail produit | OK | Images swipe, zoom, avis, stock, cross-sell |
| Panier | OK | Zustand persist + localStorage, badge compteur |
| Checkout | OK | Formulaire, choix quartier, codes promo |
| Paiement KKiaPay | OK | MTN/Moov/Celtis Mobile Money |
| Cash a la livraison | OK | Paiement especes au livreur |
| Paiement en 2x | OK | 50/50, 1ere partie KKiaPay, 2eme a la livraison |
| Programme fidelite | OK | 100 FCFA = 1 point, min 500 pour utiliser |
| Confirmation | OK | Page avec details + points gagnes |
| Avis clients | OK | Formulaire + affichage (moderation admin) |
| Favoris | OK | Sauvegarde locale |
| Social proof | OK | Notifications "X vient d'acheter" |
| Urgency timer | OK | Compte a rebours promo/flash sale |
| Timer livraison | OK | "Commandez avant 14h, livre aujourd'hui" |
| Sticky add-to-cart | OK | Bouton fixe en bas sur mobile |
| Images plein ecran | OK | Galerie swipeable |
| Retours | OK | Formulaire de demande de retour |
| Produits recemment vus | OK | Historique local |

### Admin

| Feature | Statut | Description |
|---------|--------|------------|
| Dashboard | OK | Stats CA (jour/semaine/mois), top produits |
| Stats graphiques | OK | Graphique CA 7 jours, repartition statuts |
| Gestion commandes | OK | Liste, filtres par statut, detail |
| Gestion produits | OK | CRUD complet, upload images |
| Gestion clients | OK | Liste des clients, historique |
| Gestion promotions | OK | CRUD codes promo |
| Gestion livreurs | OK | CRUD livreurs, zones, toggle actif |
| Gestion avis | OK | Moderation (approuver/rejeter) |
| Alertes stock | OK | Produits stock < 5, alerte WhatsApp |
| Export commandes CSV | OK | Export filtré par statut/date, compatible Excel |
| Alerte nouvelle commande | OK | Son + notification visuelle |
| Assignation livreurs | OK | Assigner un livreur + notification WhatsApp auto |
| Paniers abandonnes | OK | Liste + relance WhatsApp individuelle |
| Retours produits | OK | Gestion des demandes de retour |
| Marketing Facebook | OK | Dashboard Meta Ads (ROAS, campagnes, funnel) |
| Reglages boutique | OK | Frais livraison/quartier, fidelite, messages WhatsApp |
| Outils & API | OK | Interface config KKiaPay, WhatsApp Cloud, Resend, Cloudinary, FB Ads |

### Technique

| Feature | Statut | Description |
|---------|--------|------------|
| SEO sitemap | OK | Sitemap dynamique (produits, categories) |
| SEO robots.txt | OK | Blocage /api, /dashboard |
| SEO JSON-LD | OK | Product, Organization, BreadcrumbList |
| SEO Open Graph | OK | Metadata dynamique par page |
| PWA | OK | Manifest, Service Worker, installable |
| Push notifications | OK | Banniere de demande de permission |
| WhatsApp auto | OK | Confirmation, livraison, panier abandonne |
| Facebook Pixel | OK | PageView, ViewContent, AddToCart, Purchase |
| Tests auto | OK | 75 tests (utils, API, composants) |
| Mobile-first | OK | Design responsive, optimise mobile |

### Automations

| Automation | Trigger | Action |
|-----------|---------|--------|
| Confirmation commande | Nouvelle commande | WhatsApp au client |
| Notification admin | Nouvelle commande | WhatsApp a l'admin |
| Relance panier | Panier abandonne (2h) | WhatsApp au client |
| Alerte stock | Stock < 5 | Visible sur dashboard |

---

## 17. Commandes Utiles

### Developpement

```bash
npm run dev              # Serveur de dev (port 3000)
npm run build            # Build production
npm run start            # Serveur production
npm run lint             # Verification ESLint
```

### Base de Donnees

```bash
npm run prisma:generate  # Regenerer le client Prisma
npm run prisma:push      # Appliquer le schema a la BDD
npm run prisma:studio    # Interface visuelle (port 5555)
npm run prisma:seed      # Donnees de test
```

### Tests

```bash
npm test                 # Lancer tous les tests
npm run test:watch       # Mode watch
npm run test:coverage    # Avec rapport de couverture
```

---

## 18. Depannage

### Erreur "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### Erreur "Unknown field 'xxx'" dans Prisma
Le client Prisma n'est pas synchronise avec le schema :
```bash
npm run prisma:generate
npm run prisma:push
# Puis redemarrer le serveur dev
```

### KKiaPay ne recoit pas les webhooks en local
Utilisez ngrok pour exposer votre localhost :
```bash
npx ngrok http 3000
# Copier l'URL https://xxx.ngrok.io dans KKiaPay Dashboard
```

### WhatsApp ne s'envoie pas en dev
C'est normal. En mode developpement, les messages sont logges dans la console au lieu d'etre envoyes. Pour tester en vrai, deployez sur Vercel.

### Erreur "NEXT_REDIRECT" dans les API Routes
Utilisez `redirect()` de next/navigation uniquement dans les Server Components, pas dans les API Routes. Utilisez `NextResponse.redirect()` dans les API Routes.

### Build echoue avec "Type error"
```bash
npx tsc --noEmit   # Voir les erreurs TypeScript
```

### Images Cloudinary ne s'affichent pas
Verifiez que le hostname est autorise dans `next.config.js` :
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
  ],
}
```

### La base de donnees ne se connecte pas
Verifiez `DATABASE_URL` dans `.env` et assurez-vous que PostgreSQL est demarre :
```bash
pg_isready   # Verifier si PostgreSQL est actif
```

### Erreur "NextAuth session not found" dans l'admin
Verifiez que `NEXTAUTH_SECRET` et `NEXTAUTH_URL` sont configures.

---

## Checklist Mise en Production

- [ ] Toutes les variables d'environnement sont configurees sur Vercel
- [ ] `NEXTAUTH_URL` pointe vers le domaine de production
- [ ] `NEXT_PUBLIC_APP_URL` et `NEXT_PUBLIC_BASE_URL` sont corrects
- [ ] Les cles KKiaPay sont en mode **live** (pas sandbox)
- [ ] Le webhook KKiaPay pointe vers `https://tokossa.bj/api/paiement/webhook`
- [ ] Le token WhatsApp est un token **permanent** (System User)
- [ ] Le domaine Resend est verifie (DNS)
- [ ] Le Facebook Pixel ID est correct
- [ ] Le SSL/HTTPS est actif (automatique avec Vercel)
- [ ] Les icones PWA sont en place (`/public/icons/`)
- [ ] Le sitemap est accessible : `https://tokossa.bj/sitemap.xml`
- [ ] `npm run build` passe sans erreur
- [ ] Les tests passent : `npm test`

---

*TOKOSSA - E-commerce Benin - Mobile First - Next.js 14*
