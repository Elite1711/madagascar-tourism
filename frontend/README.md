# Diary Madagascar — Frontend

Application React (Vite) pour la plateforme touristique de Madagascar.

## Installation

```bash
cd frontend
npm install
cp .env.example .env   # adapter VITE_API_URL si besoin
npm run dev
```

L'application tourne par défaut sur `http://localhost:5173` et attend une API
sur `http://localhost:5000/api` (configurable via `.env`). Démarre le backend
avant le frontend (voir `../backend/README.md`).

## Structure

```
src/
├── components/   # Navbar, Footer, SiteCard, RegionFilter, CategoryFilter,
│                 # StarRating, Skeletons, ReviewsCarousel,
│                 # ProtectedRoute, AdminRoute, Loader
├── context/      # AuthContext (JWT, user, login/register/logout)
├── pages/        # Accueil, Connexion, Inscription, SitesTouristiques, Carte,
│                 # DetailSite, Favoris, Profil, DashboardAdmin
├── services/     # api.js (axios + intercepteurs) + un service par ressource
├── App.jsx       # Routes
└── main.jsx      # Point d'entrée
```

## Identité visuelle

Palette « crépuscule des baobabs » : fond brun-nuit chaud, accent terre de
latérite (#C1502E) pour les actions principales, ambre pour les accents
décoratifs, lagon turquoise pour les liens. Typo : Newsreader (titres),
Work Sans (texte), IBM Plex Mono (labels/data). L'élément signature est le
filtre par région présenté comme un itinéraire (ligne pointillée façon route
RN7) et le bouton favori en forme de tampon de passeport sur chaque carte de
site.

## Fonctionnalités notables

- **Carte interactive** (`/carte`) : Leaflet + tuiles OpenStreetMap, un
  marqueur coloré par catégorie, popup avec note moyenne et lien vers le site.
- **Filtres** : par région (itinéraire RN7) et par catégorie (pastilles),
  combinables avec la recherche par nom, le tout en mémoire côté client.
- **Notation** : `StarRating` sert à la fois d'affichage (note moyenne en
  lecture seule) et de sélecteur interactif (1-5) dans le formulaire d'avis.
- **Skeleton loaders** (`Skeletons.jsx`) : remplacent les écrans de
  chargement par un aperçu animé (grille de sites, détail, stats admin)
  plutôt qu'un simple texte « Chargement… ».
- **Carrousel d'avis** sur l'accueil : derniers commentaires tous sites
  confondus, via `GET /api/comments/recent/list`.
- **Galerie photo** : chaque site a une image de couverture + une galerie
  optionnelle, gérables depuis le Dashboard Admin (onglet Sites → édition).

## Dépendances clés

`react-router-dom` (routing), `axios` (HTTP), `leaflet` + `react-leaflet`
(carte). Voir `backend/README.md` pour le détail des endpoints consommés.
