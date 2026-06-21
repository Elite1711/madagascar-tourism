# Diary Madagascar — Backend

API REST en Express + PostgreSQL pour la plateforme touristique de Madagascar.

## Installation

Il te faut une base PostgreSQL accessible (locale ou hébergée gratuitement,
voir [Hébergement](#hébergement) plus bas), puis :

```bash
cd backend
npm install
cp .env.example .env    # colle ton DATABASE_URL, adapte JWT_SECRET
npm run seed             # crée les tables + 15 sites d'exemple + un compte admin
npm run dev              # démarre avec nodemon sur http://localhost:5000
```

Identifiants admin créés par le seed :
- Email : `admin@madagascar-tourism.mg`
- Mot de passe : `Admin1234!`

### Option A — PostgreSQL en local

```bash
# Linux (Debian/Ubuntu)
sudo apt install postgresql
sudo -u postgres createdb madagascar_tourism
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/madagascar_tourism

# macOS (Homebrew)
brew install postgresql@16 && brew services start postgresql@16
createdb madagascar_tourism
```

### Option B — PostgreSQL hébergé gratuitement (recommandé pour la soutenance)

Pas besoin d'installer Postgres en local : crée une base sur
[Supabase](https://supabase.com), [Neon](https://neon.tech) ou
[Railway](https://railway.app) (tous ont un plan gratuit), puis colle l'URL
de connexion qu'ils te donnent dans `DATABASE_URL`. C'est aussi la base que
tu utiliseras une fois le backend déployé (voir [Hébergement](#hébergement)).

## Structure

```
backend/
├── database/
│   ├── db.js      # pool de connexions PostgreSQL (pg) + helpers (run/get/all)
│   ├── init.js    # création des tables (idempotent, CREATE TABLE IF NOT EXISTS)
│   └── seed.js     # données de démo (sites + compte admin)
├── middleware/
│   └── auth.js     # verifyToken (JWT) + requireAdmin
├── routes/
│   ├── auth.js      # /api/auth/register, /api/auth/login
│   ├── sites.js      # CRUD /api/sites
│   ├── comments.js   # /api/comments
│   ├── favorites.js  # /api/favorites
│   └── admin.js       # /api/admin/stats, /users, /comments
└── server.js
```

## Schéma de base de données

`comments` porte un `created_at` pour le tri et la modération.
`favorites` a une contrainte `UNIQUE(user_id, site_id)` pour éviter les
doublons. Les suppressions sont en cascade (`ON DELETE CASCADE`) : supprimer
un site supprime ses commentaires et favoris associés.

Les requêtes du projet utilisent des placeholders `?` (comme à l'origine,
pensé pour SQLite) ; `db.js` les convertit automatiquement en `$1, $2, …`
pour PostgreSQL. PostgreSQL renvoie `COUNT()` en `bigint` et `AVG()` en
`numeric`, deux types que le driver `pg` sérialise en chaînes de caractères
par défaut — `db.js` les reconvertit en nombres JS pour éviter des bugs de
comparaison silencieux (`'0' !== 0`).

## Endpoints

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Inscription |
| POST | `/api/auth/login` | — | Connexion → `{ token, user }` |
| GET | `/api/sites` | — | Liste (filtrable par `?region=`, `?category=` et `?search=`), avec `image`, `image_attribution`, `images[]`, `category`, `latitude`/`longitude`, `avg_rating`, `ratings_count` |
| GET | `/api/sites/:id` | — | Détail, idem ci-dessus |
| POST | `/api/sites` | admin | Création (`name`, `region`, `description`, `category`, `latitude`, `longitude`, `image`, `image_attribution`, `images[]` optionnels) |
| PUT | `/api/sites/:id` | admin | Modification |
| DELETE | `/api/sites/:id` | admin | Suppression |
| POST | `/api/sites/:id/images` | admin | Ajoute une photo à la galerie (`{ url, attribution }`) |
| DELETE | `/api/sites/:id/images/:imageId` | admin | Retire une photo de la galerie |
| GET | `/api/comments/:siteId` | — | Commentaires d'un site (avec `rating` 1-5 optionnel) |
| GET | `/api/comments/recent/list` | — | Derniers avis tous sites confondus (`?limit=`), pour le carrousel d'accueil |
| POST | `/api/comments` | user | Ajout (`{ site_id, comment, rating? }`) |
| PUT | `/api/comments/:id` | propriétaire ou admin | Modification |
| DELETE | `/api/comments/:id` | propriétaire ou admin | Suppression |
| GET | `/api/favorites` | user | Favoris de l'utilisateur, joints aux sites |
| POST | `/api/favorites` | user | Ajout (`{ site_id }`) |
| DELETE | `/api/favorites/:id` | propriétaire | Suppression |
| GET | `/api/admin/stats` | admin | `{ sites, users, comments, favorites }` |
| GET | `/api/admin/users` | admin | Liste des utilisateurs |
| DELETE | `/api/admin/users/:id` | admin | Suppression (sauf comptes admin) |
| GET | `/api/admin/comments` | admin | Tous les commentaires, pour modération |

Toutes les routes protégées attendent un header `Authorization: Bearer <token>`.

## Catégories, notes et carte

Chaque site a une `category` (`nature`, `plage`, `culture`, `faune`,
`aventure`) et des coordonnées GPS (`latitude`/`longitude`) utilisées par la
carte interactive du frontend. Les avis peuvent inclure une note de 1 à 5
(`comments.rating`, optionnelle) ; `GET /api/sites` calcule à la volée la
note moyenne et le nombre d'avis notés par site.

Le schéma évolue de façon additive : si tu avais déjà une base sur l'ancien
schéma, il suffit de relancer le serveur (`npm run dev`) pour que les
nouvelles colonnes soient ajoutées automatiquement, sans perte de données
(testé séparément en migrant une vraie base Postgres). Pour repartir de
zéro avec les 15 sites par défaut, vide les tables (`DROP TABLE comments,
favorites, site_images, sites, users CASCADE;` dans `psql`) puis relance
`npm run seed`.

## Hébergement

Le backend est une appli Express classique (pas de fichier local à
persister comme avec SQLite), donc compatible avec la plupart des PaaS
gratuits : [Render](https://render.com), [Railway](https://railway.app),
[Fly.io](https://fly.io). Étapes générales :

1. Crée une base PostgreSQL gérée (Supabase, Neon, ou directement chez ton
   hébergeur si proposé) et récupère son `DATABASE_URL`.
2. Déploie ce dossier `backend/` sur ton PaaS, avec ces variables
   d'environnement : `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`
   (active automatiquement le SSL vers la base), `PORT` (généralement fourni
   par l'hébergeur lui-même).
3. Au premier démarrage, `initDb()` crée les tables automatiquement. Lance
   `npm run seed` une fois (en local avec le même `DATABASE_URL`, ou via un
   job ponctuel chez l'hébergeur) pour peupler les 15 sites et le compte admin.
4. Mets à jour `VITE_API_URL` du frontend avec l'URL publique du backend
   déployé, puis redéploie le frontend (Netlify, Vercel…).

## Photos

Les 15 sites du seed ont chacun une catégorie et des coordonnées GPS. Les 7
premiers ont en plus une vraie photo de couverture (et, pour deux d'entre
eux, une petite galerie) sourcée sur Wikimedia Commons sous licence Creative
Commons, avec attribution du photographe stockée en base (`image_attribution`,
`site_images.attribution`) et affichée sous chaque photo dans l'interface.
Les 8 sites ajoutés plus tard n'ont pas encore de photo dédiée (la carte
retombe sur le dégradé de remplacement) — à compléter via le formulaire admin
si besoin. Les URLs utilisent le point d'entrée stable `Special:FilePath` de
Commons, qui redirige vers le fichier original — c'est la méthode standard
pour intégrer un média Commons par URL directe. Si une image ne charge pas
(lien cassé, fichier renommé), le frontend bascule automatiquement sur le
dégradé de remplacement.

## Tests effectués

L'ensemble du flux a été validé avec un script d'intégration automatisé,
rejoué contre une vraie instance PostgreSQL (pas une simulation) : CORS,
inscription, connexion, création/lecture/modification/suppression de site,
ajout/édition/suppression de commentaire (avec note 1-5), ajout/suppression
de favori, accès admin (stats, utilisateurs, modération), rejet en 403 d'un
utilisateur non-admin, gestion de la galerie photo, filtre par catégorie,
calcul de la note moyenne, endpoint des avis récents, suppression en cascade,
et migration additive du schéma sur une base Postgres déjà existante
(colonnes ajoutées sans perte de données).
