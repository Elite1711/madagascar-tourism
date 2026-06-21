import { useState } from 'react'
import { Link } from 'react-router-dom'
import StarRating from './StarRating'

const CATEGORY_LABEL = {
  nature: 'Nature',
  plage: 'Plage',
  culture: 'Culture',
  faune: 'Faune',
  aventure: 'Aventure'
}

export default function SiteCard({ site, isFavorite, onToggleFavorite, showAuth }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = site.image && !imgFailed

  return (
    <article className="site-card">
      <div className="site-card__image">
        {showImage && (
          <img
            src={site.image}
            alt={site.name}
            loading="lazy"
            className="site-card__photo"
            onError={() => setImgFailed(true)}
          />
        )}
        {site.category && (
          <span className="category-badge">{CATEGORY_LABEL[site.category] || site.category}</span>
        )}
        {showAuth && (
          <button
            className={`stamp ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite?.(site)
            }}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <svg viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7.5-4.6-10-9.3C0.3 8.4 1.8 4.5 5.4 3.6c2-.5 4 .3 5.1 2 .6-1.7 2.6-2.5 5.1-2 3.6.9 5.1 4.8 3.4 8.1C19.5 16.4 12 21 12 21z" />
            </svg>
          </button>
        )}
      </div>
      <div className="site-card__body">
        <span className="site-card__region">{site.region}</span>
        <h3 className="site-card__name">
          <Link to={`/sites/${site.id}`}>{site.name}</Link>
        </h3>
        {site.avg_rating && (
          <div style={{ margin: '0.2em 0 0.4em' }}>
            <StarRating value={site.avg_rating} count={site.ratings_count} size={13} />
          </div>
        )}
        <p className="site-card__desc">{site.description}</p>
      </div>
    </article>
  )
}
