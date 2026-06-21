import { useEffect, useState } from 'react'
import { favoriteService } from '../services/favoriteService'
import SiteCard from '../components/SiteCard'
import { SiteGridSkeleton } from '../components/Skeletons'

export default function Favoris() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    favoriteService.getMine()
      .then((data) => { if (!cancelled) setFavorites(data) })
      .catch(() => { if (!cancelled) setError('Impossible de charger vos favoris.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function handleRemove(favoriteId) {
    try {
      await favoriteService.remove(favoriteId)
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId))
    } catch {
      setError('La suppression a échoué.')
    }
  }

  return (
    <div className="container">
      <h1 style={{ marginTop: 'var(--space-4)' }}>Vos favoris</h1>
      <p>Les étapes que vous avez tamponnées dans votre carnet.</p>

      {loading && <SiteGridSkeleton count={3} />}
      {error && <div className="form-error">{error}</div>}

      {!loading && !error && favorites.length === 0 && (
        <div className="empty-state">
          <p>Pas encore de favori. Parcourez les sites et tamponnez ceux qui vous tentent.</p>
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="grid" style={{ marginBottom: 'var(--space-6)' }}>
          {favorites.map((f) => (
            <SiteCard
              key={f.id}
              site={{ id: f.site_id, name: f.name, region: f.region, description: f.description, image: f.image, category: f.category }}
              showAuth
              isFavorite
              onToggleFavorite={() => handleRemove(f.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
