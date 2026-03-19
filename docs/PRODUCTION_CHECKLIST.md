# TOKOSSA — Checklist Pré-Production

À compléter avant le premier déploiement en production.

---

## SÉCURITÉ

### Variables d'Environnement
- [ ] `NEXTAUTH_SECRET` — généré avec `openssl rand -base64 32` (jamais une valeur simple)
- [ ] `ADMIN_PASSWORD` — minimum 16 caractères, majuscule + chiffre + symbole, unique
- [ ] `ADMIN_EMAIL` — adresse réelle (pas `admin@tokossa.bj` si domaine non configuré)
- [ ] Aucune clé API dans le code source (tout dans les vars d'env Vercel)
- [ ] `.env` et `.env.local` présents dans `.gitignore` ✅ (déjà fait)
- [ ] Vérifier avec `git log --all --full-history -- .env` qu'aucun `.env` n'a été commité

### Authentification Admin
- [ ] Tester la connexion admin avec les vraies credentials en production
- [ ] Vérifier que `/dashboard` redirige vers `/login` si non authentifié
- [ ] Vérifier que le middleware bloque toutes les routes `/dashboard/*` et `/api/admin/*`
- [ ] Tester l'expiration de session (30 jours)

### API & Rate Limiting
- [ ] Vérifier le rate limiting sur `/api/paiement/webhook` (10 req/min)
- [ ] Vérifier le rate limiting sur `/api/promos/validate` (30 req/min)
- [ ] Vérifier que les routes admin (`/api/admin/*`) retournent 401 sans session valide
- [ ] Tester un payload malformé sur le webhook KKiaPay (doit retourner 400)

### Headers HTTP
- [ ] Vérifier les headers de sécurité via [securityheaders.com](https://securityheaders.com)
- [ ] `X-Frame-Options: DENY` actif (anti-clickjacking)
- [ ] `X-Content-Type-Options: nosniff` actif
- [ ] HTTPS forcé (Vercel le fait automatiquement)

---

## BASE DE DONNÉES

- [ ] Base PostgreSQL de production créée (Railway ou Supabase)
- [ ] `DATABASE_URL` pointe sur la DB de production (pas localhost)
- [ ] `npm run prisma:push` exécuté sur la DB de production
- [ ] Backup automatique activé (Railway/Supabase le proposent)
- [ ] Connection pooling activé si trafic > 50 req/min (PgBouncer ou Prisma Accelerate)
- [ ] Tester la connexion DB depuis Vercel avec `/api/health`

---

## PAIEMENT KKIAPAY

- [ ] Clés **live** configurées (`pk_live_...` et `sk_live_...`)
- [ ] Clés sandbox **supprimées** des vars d'env production
- [ ] Webhook configuré sur le dashboard KKiaPay → `https://tokossa.bj/api/paiement/webhook`
- [ ] Tester un vrai paiement MTN Money (petite somme) et vérifier :
  - [ ] La commande passe de PENDING à CONFIRMED
  - [ ] Le client reçoit un WhatsApp de confirmation
  - [ ] L'admin reçoit une notification WhatsApp
- [ ] Tester un paiement échoué (vérifier que la commande reste PENDING)
- [ ] Vérifier les logs webhook dans le dashboard KKiaPay

---

## WHATSAPP BUSINESS

- [ ] **System User Token** permanent configuré (pas le token 24h du Getting Started)
- [ ] Numéro WhatsApp Business vérifié par Meta
- [ ] Templates approuvés par Meta (délai 24-48h) :
  - [ ] `order_confirmation`
  - [ ] `order_delivering`
  - [ ] `order_delivered`
  - [ ] `cart_abandoned`
  - [ ] `reactivation`
  - [ ] `upsell`
- [ ] Tester l'envoi d'un message WhatsApp de test
- [ ] Vérifier que `ADMIN_WHATSAPP_NUMBER` est correct (notifications admin)
- [ ] Vérifier que `NEXT_PUBLIC_WHATSAPP_BUSINESS` est le bon numéro public affiché

---

## EMAIL (RESEND)

- [ ] Domaine `tokossa.bj` vérifié sur Resend (DNS records ajoutés)
- [ ] Email `commandes@tokossa.bj` (ou similaire) vérifié
- [ ] `EMAIL_FROM` configuré avec l'adresse vérifiée
- [ ] Tester l'envoi d'un email de confirmation de commande
- [ ] Vérifier que les emails ne tombent pas en spam (SPF, DKIM configurés via Resend)

---

## CLOUDINARY (IMAGES)

- [ ] Upload preset `tokossa_products` créé en mode **non signé**
- [ ] Quota Cloudinary vérifié (plan gratuit = 25GB bandwidth/mois)
- [ ] Images des produits existants uploadées sur Cloudinary (pas de placeholder)
- [ ] Tester l'upload d'une image depuis l'admin

---

## ANALYTICS & TRACKING

- [ ] `NEXT_PUBLIC_FB_PIXEL_ID` configuré avec le vrai Pixel ID
- [ ] Vérifier le Pixel avec l'extension Chrome "Meta Pixel Helper"
- [ ] Tester l'événement `Purchase` après une commande test
- [ ] Vercel Analytics activé dans le dashboard Vercel

---

## CONTENU & DONNÉES

- [ ] Au moins 5-10 produits réels créés avec de vraies photos
- [ ] Descriptions produits complètes (pas de Lorem Ipsum)
- [ ] Prix en FCFA corrects
- [ ] Stock initial configuré
- [ ] Zones de livraison configurées dans Réglages admin
- [ ] Frais de livraison configurés
- [ ] Informations de contact à jour (téléphone, adresse)

---

## PERFORMANCE

- [ ] Build Next.js réussi sans erreurs ni warnings TypeScript : `npm run build`
- [ ] Score Lighthouse Mobile > 80 (PageSpeed Insights)
- [ ] Images toutes servies depuis Cloudinary (pas d'images locales >100KB)
- [ ] Première page produit charge en < 3s sur réseau 3G simulé
- [ ] Tester sur un vrai téléphone Android avec connexion mobile

---

## DOMAINE & DNS

- [ ] Domaine `tokossa.bj` acheté et configuré
- [ ] DNS pointent vers Vercel
- [ ] HTTPS actif (certificat SSL auto Vercel)
- [ ] Redirection `www.tokossa.bj` → `tokossa.bj` (ou inverse) configurée
- [ ] `NEXT_PUBLIC_APP_URL` et `NEXTAUTH_URL` mis à jour avec le vrai domaine

---

## MONITORING

- [ ] Alertes Vercel activées (errors, downtime)
- [ ] `/api/health` accessible publiquement et retourne `{"status":"ok"}`
- [ ] Vérifier les logs Vercel après le premier déploiement
- [ ] (Recommandé) Configurer Sentry DSN pour le tracking d'erreurs
  - Ajouter `NEXT_PUBLIC_SENTRY_DSN` dans les vars Vercel
  - Intégrer dans `app/global-error.tsx` (déjà en place)

---

## TESTS FONCTIONNELS FINAUX

Effectuer ces tests de bout en bout avant le lancement :

- [ ] **Parcours client complet** : Accueil → Produit → Panier → Checkout → Paiement → Confirmation + WhatsApp reçu
- [ ] **Cash on Delivery** : Commande sans paiement immédiat, notification admin reçue
- [ ] **Code promo** : Appliquer un code valide, vérifier la réduction, vérifier le compteur d'usage
- [ ] **Recherche** : Chercher un produit par nom, vérifier les résultats
- [ ] **Admin login** : Se connecter avec les vraies credentials, accéder au dashboard
- [ ] **Changement statut commande** : Passer une commande de CONFIRMED à DELIVERING, vérifier le WhatsApp client
- [ ] **Export CSV** : Exporter les commandes du mois, vérifier le fichier
- [ ] **Upload image** : Créer un produit avec photo depuis l'admin
- [ ] **Mobile** : Tester tout le parcours sur iPhone et Android

---

## LANCEMENT

- [ ] Annoncer la maintenance si un site existe déjà
- [ ] Migrer les données si nécessaire
- [ ] Monitorer les logs Vercel pendant les premières heures
- [ ] Avoir le numéro WhatsApp admin actif pour les premières commandes
- [ ] Préparer la réponse aux premières commandes manuelles si nécessaire

---

## SCORE DE PRÉPARATION

| Catégorie | Statut | Priorité |
|---|---|---|
| Sécurité | A vérifier | CRITIQUE |
| Base de données prod | A configurer | CRITIQUE |
| KKiaPay live keys | A configurer | CRITIQUE |
| WhatsApp templates approuvés | A soumettre | CRITIQUE |
| Domaine & DNS | A configurer | CRITIQUE |
| Contenu produits | A compléter | ÉLEVÉ |
| Email Resend | A configurer | ÉLEVÉ |
| Cloudinary | A configurer | ÉLEVÉ |
| Analytics | A configurer | MOYEN |
| Monitoring Sentry | Optionnel | FAIBLE |
