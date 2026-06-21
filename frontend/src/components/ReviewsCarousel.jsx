import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import StarRating from './StarRating'

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api.get('/comments/recent/list', { params: { limit: 8 } })
      .then(({ data }) => { if (!cancelled) setReviews(data) })
      .catch(() => { if (!cancelled) setReviews([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading || reviews.length === 0) return null

  return (
    <section className="container reviews-section">
      <h2>Derniers avis de voyageurs</h2>
      <div className="reviews-carousel">
        {reviews.map((r) => (
          <article className="review-card" key={r.id}>
            {r.rating && <StarRating value={r.rating} size={13} />}
            <p className="review-card__text">{r.comment}</p>
            <p className="review-card__meta">
              {r.username} — <Link to={`/sites/${r.site_id}`}>{r.site_name}</Link>
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
