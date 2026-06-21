# Plateforme Touristique de Madagascar

Projet académique L3 (Informatique, Systèmes & Réseaux) — application web
full-stack pour découvrir les sites touristiques de Madagascar : recherche
par région et catégorie, carte interactive, favoris, avis notés, et
dashboard d'administration.

## Stack

- **Frontend** : React + Vite, React Router, Axios, Leaflet — voir `frontend/README.md`
- **Backend** : Express + PostgreSQL (`pg`), JWT, bcrypt — voir `backend/README.md`

## Démarrage rapide

Il te faut une base PostgreSQL (locale ou un plan gratuit Supabase/Neon/Railway
— détails dans `backend/README.md`).

```bash
# Terminal 1 — backend
cd backend
npm install
copy .env.example .env   # colle ton DATABASE_URL
npm run seed
npm run dev

# Terminal 2 — frontend
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend sur `http://localhost:5173`, API sur `http://localhost:5000/api`.

Compte admin de démo : `admin@madagascar-tourism.mg` / `Admin1234!`
(créé par `npm run seed`).

## État du projet

- [x] Authentification JWT (inscription / connexion)
- [x] Base de données PostgreSQL (migré depuis SQLite, prêt pour l'hébergement)
- [x] CRUD sites touristiques (15 sites, 11 régions, 5 catégories)
- [x] Photos réelles par site (Wikimedia Commons, CC, avec attribution) + galerie
- [x] Carte interactive (Leaflet + OpenStreetMap) avec marqueurs par catégorie
- [x] Favoris (ajout/retrait, contrainte anti-doublon)
- [x] Commentaires notés 1-5 étoiles (ajout/modification/suppression par le propriétaire)
- [x] Note moyenne par site, calculée à la volée
- [x] Carrousel des derniers avis sur la page d'accueil
- [x] Skeleton loaders sur les écrans de chargement
- [x] Dashboard admin (stats, gestion sites/utilisateurs/commentaires, galerie photo)
- [ ] Upload de fichier (actuellement les photos sont ajoutées par URL)
- [ ] Photos dédiées pour les 8 sites ajoutés en dernier (cover seulement pour les 7 premiers)
- [ ] Pagination sur la liste des sites / commentaires
- [ ] Tests automatisés en CI (le backend a été validé par des scripts d'intégration
      rejoués manuellement à chaque évolution, voir `backend/README.md`)
