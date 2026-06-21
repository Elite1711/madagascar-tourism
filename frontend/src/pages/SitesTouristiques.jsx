import { useEffect, useMemo, useState } from 'react'
import { siteService } from '../services/siteService'
import { favoriteService } from '../services/favoriteService'
import { useAuth } from '../context/AuthContext'
import SiteCard from '../components/SiteCard'
import RegionFilter from '../components/RegionFilter'
import CategoryFilter from '../components/CategoryFilter'
import { SiteGridSkeleton } from '../components/Skeletons'

export default function SitesTouristiques() {
  const { isAuthenticated } = useAuth()
  const [sites, setSites] = useState([])
  const [favorites, setFavorites] = useState([]) // [{ id (favori), site_id }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [siteList, favList] = await Promise.all([
          siteService.getAll(),
          isAuthenticated ? favoriteService.getMine() : Promise.resolve([])
        ])
        if (!cancelled) {
          setSites(siteList)
          setFavorites(favList)
        }
      } catch {
        if (!cancelled) setError('Impossible de charger les sites pour le moment.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isAuthenticated])

  const filtered = useMemo(() => {
    return sites.filter((s) => {
      const matchRegion = !region || s.region === region
      const matchCategory = !category || s.category === category
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
      return matchRegion && matchCategory && matchSearch
    })
  }, [sites, region, category, search])

  function isFavorite(siteId) {
    return favorites.some((f) => f.site_id === siteId)
  }

  async function toggleFavorite(site) {
    const existing = favorites.find((f) => f.site_id === site.id)
    try {
      if (existing) {
        await favoriteService.remove(existing.id)
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id))
      } else {
        const created = await favoriteService.add(site.id)
        setFavorites((prev) => [...prev, created])
      }
    } catch {
      // silencieux : l'état reste inchangé si la requête échoue
    }
  }

  return (
    <div className="container">
      <h1 style={{ marginTop: 'var(--space-4)' }}>Sites touristiques</h1>

      <div className="field" style={{ maxWidth: 360 }}>
        <label htmlFor="search">Rechercher</label>
        <input
          id="search"
          type="text"
          placeholder="Allée des baobabs, Isalo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <CategoryFilter value={category} onChange={setCategory} />
      <RegionFilter value={region} onChange={setRegion} />

      {loading && <SiteGridSkeleton />}
      {error && <div className="form-error">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <p>Aucun site ne correspond à cette recherche.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid" style={{ marginBottom: 'var(--space-6)' }}>
          {filtered.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              showAuth={isAuthenticated}
              isFavorite={isFavorite(site.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
