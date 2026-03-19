# TOKOSSA — Guide de Configuration

## 1. Variables d'Environnement

Copier `.env.example` en `.env.local` et remplir chaque variable.

---

### Base Application

| Variable | Obligatoire | Exemple | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://tokossa.bj` | URL publique du site |
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host:5432/tokossa` | Connexion PostgreSQL |
| `NEXTAUTH_URL` | ✅ | `https://tokossa.bj` | URL pour NextAuth (= APP_URL) |
| `NEXTAUTH_SECRET` | ✅ | 32+ caractères aléatoires | Clé de signature JWT |

Générer NEXTAUTH_SECRET :
```bash
openssl rand -base64 32
```

---

### Authentification Admin

| Variable | Obligatoire | Description |
|---|---|---|
| `ADMIN_EMAIL` | ✅ | Email de connexion admin (ex: admin@tokossa.bj) |
| `ADMIN_PASSWORD` | ✅ | Mot de passe admin — minimum 12 caractères, majuscule + chiffre + symbole |

> Ces variables ne doivent **jamais** être présentes dans le code source. Elles sont validées au démarrage et l'application refusera de démarrer en production si elles sont manquantes.

---

### KKiaPay (Paiement Mobile Money)

Obtenir sur [https://kkiapay.me](https://kkiapay.me) → Dashboard → API Keys

| Variable | Obligatoire | Description |
|---|---|---|
| `KKIAPAY_PUBLIC_KEY` | ✅ | Clé publique (`pk_live_...` en prod, `pk_sandbox_...` en test) |
| `KKIAPAY_PRIVATE_KEY` | ✅ | Clé privée — ne jamais exposer côté client |

> En développement, utiliser les clés sandbox KKiaPay. En production, passer aux clés live.

---

### WhatsApp Business Cloud API (Meta)

1. Créer un compte sur [business.facebook.com](https://business.facebook.com)
2. Aller sur [developers.facebook.com](https://developers.facebook.com) → Créer une app → WhatsApp
3. Récupérer le token système et le Phone Number ID

| Variable | Obligatoire | Description |
|---|---|---|
| `WHATSAPP_API_TOKEN` | ✅ | System User Token (permanent) |
| `WHATSAPP_PHONE_NUMBER_ID` | ✅ | ID du numéro WhatsApp Business |
| `NEXT_PUBLIC_WHATSAPP_BUSINESS` | ✅ | Numéro affiché aux clients (format: 22990000000) |
| `ADMIN_WHATSAPP_NUMBER` | ✅ | Numéro WhatsApp de l'admin pour les alertes |

> Utiliser un **System User Token** permanent, pas le token temporaire de 24h du Getting Started.

---

### Resend (Email)

1. Créer un compte sur [resend.com](https://resend.com)
2. Vérifier le domaine `tokossa.bj` (ajouter les DNS records)
3. Créer une clé API

| Variable | Obligatoire | Description |
|---|---|---|
| `RESEND_API_KEY` | ✅ | Clé API Resend (`re_...`) |
| `EMAIL_FROM` | ✅ | Email expéditeur vérifié (ex: commandes@tokossa.bj) |

---

### Cloudinary (Images)

1. Créer un compte sur [cloudinary.com](https://cloudinary.com)
2. Dashboard → Settings → Access Keys

| Variable | Obligatoire | Description |
|---|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Nom du cloud (ex: `tokossa`) |
| `CLOUDINARY_API_KEY` | ✅ | Clé API |
| `CLOUDINARY_API_SECRET` | ✅ | Secret API — ne jamais exposer côté client |

> Créer un **upload preset** non signé dans Cloudinary Settings → Upload Presets, nommé `tokossa_products`.

---

### Analytics & Marketing

| Variable | Obligatoire | Description |
|---|---|---|
| `NEXT_PUBLIC_FB_PIXEL_ID` | Recommandé | ID du Pixel Facebook/Meta |
| `FACEBOOK_ACCESS_TOKEN` | Optionnel | System User Token Meta Ads (pour le dashboard marketing) |
| `FACEBOOK_AD_ACCOUNT_ID` | Optionnel | ID compte publicitaire Meta (format: `act_XXXXXXXXX`) |

---

## 2. Base de Données

### Setup initial

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:push

# (Optionnel) Peupler avec des données de test
npm run prisma:seed
```

### Production (Railway ou Supabase)

1. Créer une base PostgreSQL sur [railway.app](https://railway.app) ou [supabase.com](https://supabase.com)
2. Copier l'URL de connexion dans `DATABASE_URL`
3. Lancer `npm run prisma:push` en pointant sur la DB de production

---

## 3. Vercel (Déploiement)

### Variables d'environnement Vercel

Aller dans Vercel Dashboard → Project → Settings → Environment Variables et ajouter **toutes** les variables du `.env.example`.

> Ne jamais utiliser la page `/dashboard/outils` pour configurer les clés API critiques en production. Utiliser les variables d'environnement Vercel directement.

### Domaine personnalisé

1. Vercel Dashboard → Project → Domains → Add `tokossa.bj`
2. Mettre à jour les DNS chez le registrar :
   - `A` → IP Vercel
   - `CNAME www` → `cname.vercel-dns.com`
3. Mettre à jour `NEXT_PUBLIC_APP_URL` et `NEXTAUTH_URL` avec le vrai domaine

### Cron Jobs (relance paniers abandonnés)

Le fichier `vercel.json` configure un cron toutes les heures :
```json
{
  "crons": [{
    "path": "/api/cron/relance-panier",
    "schedule": "0 * * * *"
  }]
}
```
Cela fonctionne automatiquement sur Vercel Pro. Sur le plan gratuit, utiliser un service externe (cron-job.org).

---

## 4. WhatsApp — Templates à Approuver

Avant de pouvoir envoyer des messages WhatsApp, les templates doivent être approuvés par Meta (délai : 24-48h).

Templates utilisés dans le projet :

| Nom du template | Déclencheur |
|---|---|
| `order_confirmation` | Commande confirmée (paiement reçu) |
| `order_delivering` | Commande en livraison |
| `order_delivered` | Commande livrée |
| `cart_abandoned` | Relance panier abandonné (1ère) |
| `reactivation` | Relance panier abandonné (2ème) |
| `upsell` | Suggestion produit complémentaire |

Soumettre les templates dans Meta Business → WhatsApp Manager → Message Templates.

---

## 5. KKiaPay — Webhook

Configurer le webhook KKiaPay pour pointer vers :
```
https://tokossa.bj/api/paiement/webhook
```

Dans le dashboard KKiaPay → Settings → Webhooks → ajouter cette URL.

---

## 6. Sécurité Post-Configuration

- [ ] Changer `ADMIN_PASSWORD` — utiliser un mot de passe fort et unique
- [ ] Changer `NEXTAUTH_SECRET` — générer avec `openssl rand -base64 32`
- [ ] Vérifier que `.env` et `.env.local` sont dans `.gitignore`
- [ ] Ne jamais committer de fichier `.env` avec de vraies clés
- [ ] Activer la 2FA sur le compte Vercel, Meta Business, KKiaPay
