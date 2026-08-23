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
| `SESSION_SECRET` | Oui | Clé de signature des JWT de session — **32 caractères minimum**, aucune valeur de repli |
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
| `npm test` | Tests unitaires (Vitest) |
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
│   └── api/
│       ├── health/           # Liveness check
│       ├── ready/            # Readiness check (MongoDB)
│       └── stripe/webhook/   # Webhook Stripe
├── components/               # UI (Navbar, Hero, cartes, formulaires…)
├── lib/                      # MongoDB, modèles Mongoose, session JWT, stock, Stripe, DAL
├── tests/                    # Tests Vitest (lib, actions, api)
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

- Cookie de session **httpOnly** contenant un **JWT signé en HS256** (7 jours) avec `SESSION_SECRET` — signé, donc intègre et infalsifiable, mais **non chiffré** : aucune donnée confidentielle n'y est placée (uniquement l'identifiant et le rôle). D'où les noms `signSessionToken()` / `verifySessionToken()` dans `lib/session.ts`.
- `SESSION_SECRET` est **obligatoire** et doit faire au moins 32 caractères : l'application refuse de démarrer une session sans lui, plutôt que de retomber sur un secret par défaut connu de tous.
- Routes protégées par `proxy.ts` :
  - non connecté → `/auth/login`
  - non admin sur `/admin/*` → redirection vers `/`
- Les Server Actions vérifient aussi la session (`verifySession` / `verifyAdmin`)

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `Missing MONGODB_URI` | Copier `.env.example` vers `.env` et renseigner l’URI |
| `SESSION_SECRET est obligatoire.` | Renseigner `SESSION_SECRET` dans `.env` (32 caractères minimum) |
| Connexion MongoDB refusée | Vérifier que MongoDB tourne (local ou Atlas) |
| Base vide / pas de produits | `npm run db:seed` |
| Port 3000 déjà utilisé | Arrêter l’autre process ou ouvrir le port indiqué dans le terminal |
| Images produits cassées | Vérifier que le chemin existe sous `public/` (ex. `/img/...`) |

---

## Docker

Deux workflows Docker sont disponibles.

### Développement (hot reload)

```bash
docker compose up --build
# App sur http://localhost:3000, MongoDB sur localhost:27017

# Dans un autre terminal, une fois les conteneurs démarrés :
docker compose run --rm seed
```

Le code source est monté en volume : les changements sont pris en compte à la volée (`next dev`). Les variables `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, `STRIPE_*` sont lues depuis ton fichier `.env` local si présent (sinon des valeurs par défaut de dev sont utilisées) ; `MONGODB_URI` pointe automatiquement vers le conteneur `mongo`.

### Vérifier l'image de production en local

```bash
docker compose -f docker-compose.prod.yml up --build
```

Construit et lance exactement la même image (`Dockerfile`, cible `runner`, sortie `standalone`) que celle déployée sur Render, avec une base MongoDB jetable. Utile pour valider une image avant de pousser sur `main`.

### Fichiers

| Fichier | Rôle |
|---------|------|
| `Dockerfile` | Multi-stage (`deps` → `dev` / `builder` → `runner`). L'étape `runner` est l'image de production minimale utilisée par Render. |
| `docker-compose.yml` | Environnement de dev complet (app + MongoDB), avec un service `seed` à la demande. |
| `docker-compose.prod.yml` | Bac à sable pour tester l'image de production en local. |
| `.dockerignore` | Exclut `node_modules`, `.next`, `.env`, etc. du contexte de build. |

---

## Intégration continue (GitHub Actions)

`.github/workflows/ci.yml` s'exécute à chaque `push` et chaque `pull request` sur `main` :

```
push / pull request
  └─ job « lint-and-build » : npm ci → lint → tests (Vitest) → build Next.js
       └─ job « docker-build » (needs: lint-and-build) : build de l'image de production
            └─ checks GitHub verts → Render déploie
```

Le build Docker n'est lancé que si lint, tests et build ont réussi, et l'image n'est pas publiée : elle sert uniquement à prouver que l'image déployable se construit. Aucun secret réel n'est nécessaire (seules des valeurs de remplacement de build sont fournies).

---

## Déploiement continu sur Render

Le dépôt contient un `render.yaml` (Blueprint Render) qui décrit un service web Docker prêt à l'emploi.

### Mise en place (une seule fois)

1. Pousse ce projet sur GitHub (déjà fait si tu lis ce README depuis le repo).
2. Crée une base MongoDB accessible depuis Internet, par ex. un cluster gratuit [MongoDB Atlas](https://www.mongodb.com/atlas), et récupère son URI de connexion.
3. Sur [Render](https://dashboard.render.com), clique **New +** → **Blueprint**, puis sélectionne ce dépôt GitHub. Render détecte `render.yaml` automatiquement.
4. Renseigne les variables marquées comme secrètes lors de la création :
   - `MONGODB_URI` (obligatoire)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optionnelles — laisse vide pour garder le paiement démo)
   - `SESSION_SECRET` est généré automatiquement par Render, rien à faire.
5. Après le premier déploiement, vérifie l'URL publique donnée par Render (ex. `https://figurinum.onrender.com`). Si elle diffère de la valeur par défaut dans `render.yaml`, mets à jour la variable d'environnement `NEXT_PUBLIC_APP_URL` dans le dashboard Render puis relance un déploiement manuel (**Manual Deploy** → **Deploy latest commit**).

### Ensuite : déploiement automatique conditionné à la CI

C'est tout — à partir de là, **chaque `git push` sur `main` déclenche** :

1. GitHub Actions (`.github/workflows/ci.yml`) : installation, lint, tests, build Next.js, puis build de l'image Docker de production.
2. **Uniquement si ces checks passent** (`autoDeployTrigger: checksPass` dans `render.yaml`), Render reconstruit l'image à partir du `Dockerfile` et effectue un déploiement sans coupure — le trafic ne bascule qu'après un readiness check `/api/ready` réussi.

Un commit dont la CI échoue n'est donc jamais déployé.

### Notes de configuration

- Le `Dockerfile` construit avec `output: "standalone"` (voir `next.config.ts`) : image finale légère, sans `node_modules` complet.
- Les variables `NEXT_PUBLIC_*` sont figées dans le bundle JS **au moment du build** (Render les transmet automatiquement comme *build args* Docker). Toute modification nécessite un nouveau déploiement, pas juste un redémarrage.
- `HEALTHCHECK` Docker → `/api/health` (liveness) ; `healthCheckPath` Render → `/api/ready` (readiness). Voir la section « Health checks » ci-dessous.
- Les pages qui lisent la base de données (`/`, `/shop`, `/shop/[id]`, `/account`, `/cart`, `/admin/*`, `/checkout/success`) sont rendues dynamiquement (`force-dynamic` ou détection automatique via les cookies de session) : aucune connexion MongoDB n'est requise pendant `next build`, ce qui est indispensable pour que le build Docker/CI fonctionne sans base de données accessible.

---

## Health checks : liveness et readiness

Deux endpoints distincts, deux questions différentes :

| Endpoint | Question | Vérifie | Réponse |
|----------|----------|---------|---------|
| `/api/health` | *Le process est-il vivant ?* (liveness) | Uniquement que Next.js répond, sans toucher à MongoDB | `200 {"status":"ok"}` |
| `/api/ready` | *Peut-il servir du trafic ?* (readiness) | Connexion MongoDB établie + `ping` effectif | `200 {"status":"ready"}` ou `503 {"status":"not_ready"}` |

- **Docker** utilise `/api/health` : une base momentanément injoignable ne doit pas faire redémarrer en boucle un conteneur qui, lui, fonctionne parfaitement.
- **Render** utilise `/api/ready` : à l'inverse, une nouvelle version incapable de joindre MongoDB ne doit pas recevoir de trafic ni remplacer la version en ligne.

---

## Robustesse du stock et paiement

Le stock est la ressource critique de la boutique : deux clients ne doivent jamais pouvoir acheter le même dernier exemplaire.

**Décrément conditionnel et atomique** (`lib/stock.ts`) — la vérification du stock fait partie du filtre de la mise à jour, donc MongoDB évalue et décrémente en une seule opération sur le document :

```ts
Product.findOneAndUpdate(
  { _id: productId, stock: { $gte: quantity } },
  { $inc: { stock: -quantity } },
  { new: true }
);
```

Un résultat `null` signifie « stock insuffisant ». Deux commandes concurrentes ne peuvent donc pas réussir toutes les deux : la seconde ne trouve plus de document correspondant. Un `find()` suivi d'un `$inc` séparé laisserait au contraire passer les deux. La contrainte `min: 0` sur le modèle `Product` complète cette garantie côté validation Mongoose, sans la remplacer.

Une commande portant sur plusieurs produits demande plusieurs opérations (MongoDB n'est atomique que par document) : `reserveStockForItems()` applique donc une **compensation** — si une ligne échoue, les lignes déjà réservées sont recréditées, pour ne jamais laisser un état partiellement modifié.

**Quand le stock est-il réservé ?**

| Mode | Moment de la réservation |
|------|--------------------------|
| Démo (sans Stripe) | À la création de la commande, le paiement étant réputé immédiat |
| Stripe | Dans le webhook, **après** confirmation réelle du paiement |

**Paiement Stripe confirmé mais stock devenu indisponible** — le webhook rembourse le `PaymentIntent` puis passe la commande en `CANCELLED` : le client n'est jamais débité pour une commande impossible à honorer. Si Stripe refuse le remboursement, la commande est annulée quand même et le cas se traite depuis le dashboard Stripe.

**Idempotence du webhook** — Stripe peut rejouer un même événement. La première réception « revendique » la commande de façon atomique (`status: "PENDING"` + `stripeSessionId: null` → écriture de l'identifiant de session) ; une réception suivante ne trouve plus de commande à traiter et ressort sans décrémenter le stock une seconde fois.

Ces comportements sont couverts par les tests (`tests/lib/stock.test.ts`, `tests/api/stripe-webhook.test.ts`), y compris des scénarios de demandes concurrentes sur le dernier article.

---

## Licence

Projet privé — usage personnel / pédagogique.
