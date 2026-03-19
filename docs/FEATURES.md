# TOKOSSA — Fonctionnalités du Projet

## Vue d'ensemble

TOKOSSA est une plateforme e-commerce mobile-first ciblant le marché béninois (Cotonou). Elle permet la vente de produits avec paiement Mobile Money (MTN/Moov) et livraison à domicile.

**Stack** : Next.js 14 App Router · PostgreSQL + Prisma · Tailwind CSS · KKiaPay · WhatsApp Cloud API · Vercel

---

## 1. Boutique Client

### Page d'accueil (`/`)
- Bannière promotionnelle animée avec timer de compte à rebours
- Grille de produits mis en avant (featuredProducts)
- Carrousel de témoignages clients
- Section trust badges (paiement sécurisé, livraison rapide, service client)
- Notification sociale en temps réel ("Kevin vient d'acheter ce produit")

### Catalogue Produits (`/produits`)
- Grille responsive avec images Cloudinary optimisées
- Filtres : catégorie, prix min/max
- Tri : récent, prix croissant/décroissant, popularité
- Recherche texte en temps réel (`/api/search`)
- Pagination

### Page Produit (`/produits/[slug]`)
Optimisée pour la conversion :
- Galerie d'images avec zoom
- Timer d'urgence ("Promo expire dans 2h 14min")
- Compteur de stock ("Plus que 4 en stock") avec barre colorée
- Mention livraison rassurante ("Livré demain à Cotonou")
- Modes de paiement visibles (MTN Money, Moov Money, Cash)
- Bouton WhatsApp fallback ("Commander par WhatsApp")
- Section avis clients avec étoiles et filtre par note
- Produits récemment consultés (localStorage)
- Ajout aux favoris (localStorage)
- Partage produit

### Panier (`/panier`)
- Panier persistant via Zustand (état global)
- Modification quantités, suppression d'articles
- Calcul automatique sous-total + frais de livraison
- Application de code promo
- Utilisation de points de fidélité
- Récapitulatif commande clair

### Checkout (`/checkout`)
- Formulaire de livraison : nom, téléphone, adresse, quartier
- Sélection mode de paiement :
  - Mobile Money via KKiaPay (MTN, Moov, Celtis, Wave)
  - Cash on Delivery (paiement à la livraison)
  - Paiement en 2 versements (split payment)
- Intégration widget KKiaPay natif
- Validation côté client et serveur
- Création de la commande en base de données

### Confirmation (`/confirmation/[orderNumber]`)
- Récapitulatif complet de la commande
- Numéro de suivi unique
- Notification WhatsApp automatique envoyée au client
- Notification WhatsApp automatique envoyée à l'admin
- Points de fidélité crédités

### Favoris (`/favoris`)
- Liste des produits sauvegardés (localStorage)
- Ajout direct au panier depuis les favoris

### Retours Client (`/retours`)
- Formulaire de demande de retour
- Suivi statut retour (pending → approved → refunded)

### Profil & Commandes (`/profil`, `/commandes`)
- Recherche par numéro de téléphone (pas de mot de passe requis)
- Historique des commandes avec statuts
- Solde de points de fidélité

---

## 2. Système de Paiement

### KKiaPay (Mobile Money)
- Paiement MTN Mobile Money, Moov Money, Celtis Money, Wave
- Widget officiel KKiaPay intégré côté client
- Webhook sécurisé (`/api/paiement/webhook`) :
  - Vérification HMAC du montant
  - Rate limiting (max 10 req/min par IP)
  - Mise à jour statut commande PENDING → CONFIRMED
  - Déclenchement notifications WhatsApp automatiques

### Split Payment (Paiement en 2 fois)
- Premier versement à la commande
- Deuxième versement configuré séparément
- Suivi des deux versements en base

### Cash on Delivery
- Paiement à la livraison
- Commande créée directement en statut CONFIRMED
- Notification WhatsApp admin immédiate

---

## 3. Notifications Automatiques

### WhatsApp (Meta Cloud API v21.0)
Déclenchées automatiquement à chaque étape :

| Événement | Destinataire | Template |
|---|---|---|
| Paiement confirmé | Client | `order_confirmation` |
| Commande en livraison | Client | `order_delivering` |
| Commande livrée | Client | `order_delivered` |
| Relance panier J+1 | Client | `cart_abandoned` |
| Relance panier J+3 | Client | `reactivation` |
| Nouvelle commande | Admin | Notification immédiate |

Tous les messages WhatsApp sont loggés en base (table `WhatsAppLog`).

### Email (Resend)
- Confirmation de commande avec récapitulatif HTML
- Template responsive mobile-first
- Depuis l'adresse `commandes@tokossa.bj`

---

## 4. Fidélité & Promotions

### Points de Fidélité
- Gain automatique à chaque commande (% du montant)
- Raisons de gain : `purchase`, `referral`, `review`, `welcome`
- Utilisation au checkout (déduction du total)
- Historique complet des mouvements (table `LoyaltyPoint`)

### Codes Promo
- Réduction en pourcentage ou montant fixe
- Montant minimum de commande
- Limite d'utilisations
- Date d'expiration
- Validation en temps réel au checkout (`/api/promos/validate`)
- Statistiques d'utilisation dans l'admin

---

## 5. Dashboard Administrateur

Accessible sur `/dashboard` (protégé par NextAuth + middleware).

### Vue d'ensemble (`/dashboard`)
- Chiffre d'affaires : jour, semaine, mois
- Nombre de commandes par statut
- Top 5 produits vendus
- Répartition des ventes par quartier
- Alertes stock bas
- Dernières commandes

### Gestion Commandes (`/dashboard/commandes`)
- Tableau avec recherche, filtres (statut, date, quartier), pagination
- Changement de statut : PENDING → CONFIRMED → PREPARING → DELIVERING → DELIVERED → CANCELLED
- Assignation livreur à une commande
- Actions groupées : changer statut, supprimer, exporter sélection
- Export CSV des commandes (avec filtres date/statut)
- Alerte visuelle pour nouvelles commandes (polling toutes les 30s)

### Gestion Produits (`/dashboard/produits`)
- Création, modification, suppression de produits
- Upload d'images Cloudinary (drag & drop)
- Génération de description IA (via `/api/admin/generate-description`)
- Gestion du stock
- Activation/désactivation produit
- Flash sale avec timer

### Gestion Clients (`/dashboard/clients`)
- Liste de tous les clients avec filtres
- Historique commandes par client
- Solde points de fidélité

### Gestion Livreurs (`/dashboard/livreurs`)
- Création, modification, suppression de livreurs
- Assignation par zone (Cotonou, Abomey-Calavi, Ouidah, etc.)
- Statistiques livraisons par livreur

### Codes Promo (`/dashboard/promotions`)
- Création et gestion des codes promo
- Statistiques d'utilisation en temps réel
- Activation/désactivation

### Avis Clients (`/dashboard/avis`)
- Modération des avis : approuver ou rejeter
- Filtre par note, produit, statut
- Marquage automatique "achat vérifié"

### Paniers Abandonnés (`/dashboard/paniers-abandonnes`)
- Liste des paniers non convertis
- Relance manuelle ou automatique (cron horaire) via WhatsApp
- Statuts : pending → reminded_1 → reminded_2 → recovered → expired

### Retours (`/dashboard/retours`)
- Gestion des demandes de retour clients
- Statuts : pending → approved → rejected → refunded

### Marketing (`/dashboard/marketing`)
- Dashboard Facebook/Meta Ads (via Meta Marketing API)
- Statistiques campagnes : impressions, clics, conversions, dépenses
- Lien direct vers Meta Ads Manager

### Outils (`/dashboard/outils`)
- Configuration des clés API (WhatsApp, KKiaPay, Resend, Cloudinary, Facebook)
- Stockage sécurisé en base (table `SiteSettings`)
- Test de connexion des services

### Paramètres (`/dashboard/reglages`)
- Nom de la boutique, description, logo
- Informations de contact
- Zones de livraison et frais
- Configuration générale

---

## 6. Infrastructure & Performance

### Base de Données (13 modèles Prisma)
`User` · `Product` · `Cart` · `CartItem` · `Order` · `OrderItem` · `WhatsAppLog` · `PromoCode` · `LoyaltyPoint` · `Review` · `SaleNotification` · `ReturnRequest` · `AbandonedCart` · `DeliveryPerson` · `SiteSettings`

### Sécurité
- Protection routes admin par middleware Next.js
- Rate limiting en mémoire (configurable par route)
- Validation des variables d'environnement au démarrage
- Vérification montants webhook KKiaPay (anti-fraude)
- JWT NextAuth (30 jours) avec rotation automatique
- Headers de sécurité (CORS, X-Frame-Options, etc.) via `vercel.json`

### PWA (Progressive Web App)
- Service Worker pour fonctionnement hors-ligne partiel
- Bannière d'installation sur mobile
- Push notifications (infrastructure en place)

### SEO & Analytics
- Métadonnées Open Graph par produit
- Facebook Pixel (tracking conversions, ajout panier, achat)
- Vercel Analytics (performances Core Web Vitals)

### CI/CD
- GitHub Actions : lint → tests → build à chaque push
- Déploiement automatique sur Vercel (main branch)
- Cron job Vercel (relance paniers, toutes les heures)

---

## 7. Ce Qui Est Partiel / À Compléter

| Fonctionnalité | État | Note |
|---|---|---|
| OTP WhatsApp client | 40% | Stub en place, vrai flow OTP à implémenter |
| Descriptions IA | 50% | Route API prête, nécessite clé Anthropic/OpenAI |
| Tests automatisés | 30% | 6 fichiers tests, couverture partielle |
| Monitoring Sentry | Config | DSN configuré, intégration `try/catch` à ajouter |
| Import CSV produits | 0% | Export commandes OK, import produits non implémenté |
| GPS livreur | 0% | Non prévu dans le scope initial |
| Programme référral | 10% | Modèle DB prêt, pas d'UI |
