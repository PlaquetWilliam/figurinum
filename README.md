# Figurinum

Boutique en ligne de figurines d’art et art toys — éditions limitées.

Stack : **Next.js 16**, **React 19**, **MongoDB** (Mongoose), **JWT**, **Stripe** (optionnel), **Tailwind CSS 4**.

---

## Fonctionnalités

- Authentification (inscription / connexion / déconnexion)
- Redirection automatique vers la page de connexion si non authentifié
- Boutique, fiches produits, panier
- Paiement Stripe ou mode démo (sans clés Stripe)
- Espace utilisateur (profil + historique des commandes)
- Panel admin (produits, commandes, statistiques)

---

## Prérequis

- [Node.js](https://nodejs.org/) 20 ou supérieur
- npm (fourni avec Node.js)
- [MongoDB](https://www.mongodb.com/) en local, ou un cluster [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## Installation

```bash
# 1. Cloner / ouvrir le projet
cd figurinum

# 2. Installer les dépendances
npm install

# 3. Configurer l’environnement
copy .env.example .env
# (sous macOS/Linux : cp .env.example .env)

# 4. Démarrer MongoDB (si local) puis remplir la base avec des données de démo
npm run db:seed

# 5. Lancer le serveur de développement
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Sans session, tu es redirigé vers `/auth/login`.

---

## Variables d’environnement

Fichier `.env` (voir `.env.example`) :

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `MONGODB_URI` | Oui | URI MongoDB, ex. `mongodb://127.0.0.1:27017/figurinum` |
| `SESSION_SECRET` | Oui | Secret JWT des cookies de session |
| `NEXT_PUBLIC_APP_URL` | Oui | URL de l’app (`http://localhost:3000` en local) |
| `STRIPE_SECRET_KEY` | Non | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Non | Secret du webhook Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Non | Clé publique Stripe |

Sans les variables Stripe, le **paiement démo** est actif : la commande est marquée payée, le stock est décrémenté et le panier est vidé.

---

## Comptes de démo

Créés par `npm run db:seed` :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@figurinum.com` | `Admin123!` |
| **Utilisateur** | `user@figurinum.com` | `User1234!` |

Tu peux aussi créer un compte via **Créer un compte** (`/auth/register`). Les nouveaux comptes ont le rôle `USER`.

---

## Utilisation de l’application

### 1. Connexion / inscription

1. Va sur `/auth/login` ou `/auth/register`.
2. Connecte-toi avec un compte démo ou crée le tien.
3. Après connexion, tu arrives sur l’accueil (ou sur la page demandée via `callbackUrl`).

Seules `/auth/login` et `/auth/register` sont publiques. Tout le reste exige une session.

### 2. Parcourir la boutique

| Page | URL | Description |
|------|-----|-------------|
| Accueil | `/` | Hero + collection vedette |
| Boutique | `/shop` | Tous les produits |
| Fiche produit | `/shop/[id]` | Détail, stock, ajout au panier |

Sur une carte produit ou une fiche, clique sur **Ajouter** / **Ajouter au panier**.

### 3. Panier et paiement

1. Ouvre le panier via **PANIER** dans la navbar (`/cart`).
2. Ajuste les quantités ou retire des articles.
3. Clique sur **Payer** :
   - **Avec Stripe** : redirection vers Checkout Stripe, puis retour sur `/checkout/success`.
   - **Sans Stripe (démo)** : paiement simulé immédiat, puis page de confirmation.

### 4. Espace utilisateur

Sur `/account` :

- Profil (nom, email)
- Historique des commandes avec statut (En attente, Payée, Expédiée, Livrée, Annulée)
- Lien vers l’admin si tu es admin

### 5. Panel admin

Accessible uniquement avec le rôle `ADMIN` (`/admin`).

| Page | URL | Actions |
|------|-----|---------|
| Dashboard | `/admin` | Stats (produits, commandes, utilisateurs, revenus) |
| Produits | `/admin/products` | Ajouter / supprimer des produits |
| Commandes | `/admin/orders` | Voir les commandes et changer le statut |

Pour ajouter un produit, renseigne nom, catégorie, prix, stock, chemin d’image (ex. `/img/placeholder-luna.svg`) et description. Coche **Produit vedette** pour l’afficher sur l’accueil.

### 6. Déconnexion

Bouton logout (icône) à droite de la navbar → retour vers `/auth/login`.

---

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Lancer le build de production |
| `npm run lint` | ESLint |
| `npm run db:seed` | Données de démo (users + produits) |

---

## Structure du projet

```
figurinum/
├── app/
│   ├── page.tsx              # Accueil
│   ├── auth/                 # Login / register
│   ├── shop/                 # Catalogue + détail produit
│   ├── cart/                 # Panier
│   ├── checkout/success/     # Confirmation de commande
│   ├── account/              # Espace utilisateur
│   ├── admin/                # Panel admin
│   ├── actions/              # Server Actions (auth, cart, orders)
│   └── api/stripe/webhook/   # Webhook Stripe
├── components/               # UI (Navbar, Hero, cartes, formulaires…)
├── lib/                      # MongoDB, modèles Mongoose, session JWT, Stripe, DAL
├── scripts/                  # Seed MongoDB
├── public/img/               # Images produits
└── proxy.ts                  # Protection des routes (auth + admin)
```

---

## Paiement Stripe (optionnel)

1. Crée un compte sur [Stripe](https://stripe.com) et récupère tes clés de test.
2. Ajoute-les dans `.env` :

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

3. Pour le webhook en local (CLI Stripe) :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Relance `npm run dev`. Au checkout, tu seras redirigé vers Stripe Checkout.

---

## Rôles et sécurité

- Cookie de session **httpOnly** JWT (7 jours), signé avec `SESSION_SECRET`
- Routes protégées par `proxy.ts` :
  - non connecté → `/auth/login`
  - non admin sur `/admin/*` → redirection vers `/`
- Les Server Actions vérifient aussi la session (`verifySession` / `verifyAdmin`)

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `Missing MONGODB_URI` | Copier `.env.example` vers `.env` et renseigner l’URI |
| Connexion MongoDB refusée | Vérifier que MongoDB tourne (local ou Atlas) |
| Base vide / pas de produits | `npm run db:seed` |
| Port 3000 déjà utilisé | Arrêter l’autre process ou ouvrir le port indiqué dans le terminal |
| Images produits cassées | Vérifier que le chemin existe sous `public/` (ex. `/img/...`) |

---

## Licence

Projet privé — usage personnel / pédagogique.
