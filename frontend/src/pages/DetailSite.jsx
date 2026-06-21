import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { siteService } from '../services/siteService'
import { commentService } from '../services/commentService'
import { favoriteService } from '../services/favoriteService'
import { useAuth } from '../context/AuthContext'
import { DetailSkeleton } from '../components/Skeletons'
import StarRating from '../components/StarRating'

export default function DetailSite() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()

  const [site, setSite] = useState(null)
  const [comments, setComments] = useState([])
  const [favorite, setFavorite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editRating, setEditRating] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [siteData, commentList, favList] = await Promise.all([
          siteService.getById(id),
          commentService.getBySite(id),
          isAuthenticated ? favoriteService.getMine() : Promise.resolve([])
        ])
        if (cancelled) return
        setSite(siteData)
        setComments(commentList)
        setFavorite(favList.find((f) => f.site_id === Number(id)) || null)
      } catch {
        if (!cancelled) setError('Site introuvable.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, isAuthenticated])

  async function toggleFavorite() {
    try {
      if (favorite) {
        await favoriteService.remove(favorite.id)
        setFavorite(null)
      } else {
        const created = await favoriteService.add(Number(id))
        setFavorite(created)
      }
    } catch {
      setError("La mise à jour des favoris a échoué.")
    }
  }

  async function handleAddComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const created = await commentService.create({
        site_id: Number(id),
        comment: newComment,
        rating: newRating || undefined
      })
      setComments((prev) => [...prev, created])
      setNewComment('')
      setNewRating(0)
      const refreshed = await siteService.getById(id)
      setSite(refreshed)
    } catch {
      setError("L'envoi du commentaire a échoué.")
    }
  }

  async function handleSaveEdit(commentId) {
    try {
      const updated = await commentService.update(commentId, { comment: editText, rating: editRating || undefined })
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)))
      setEditingId(null)
      const refreshed = await siteService.getById(id)
      setSite(refreshed)
    } catch {
      setError("La modification a échoué.")
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await commentService.remove(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      const refreshed = await siteService.getById(id)
      setSite(refreshed)
    } catch {
      setError("La suppression a échoué.")
    }
  }

  if (loading) return <div className="container"><DetailSkeleton /></div>
  if (error && !site) return <div className="container"><div className="form-error">{error}</div></div>
  if (!site) return null

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-6)' }}>
      <Link to="/sites" className="btn-ghost btn" style={{ paddingLeft: 0, marginTop: 'var(--space-3)' }}>← Retour aux sites</Link>

      <span className="site-card__region">{site.region}</span>
      <h1 style={{ marginTop: '0.2em', marginBottom: '0.3em' }}>{site.name}</h1>
      {site.avg_rating && <StarRating value={site.avg_rating} count={site.ratings_count} />}

      {site.image && (
        <div className="detail-cover">
          <img src={site.image} alt={site.name} />
          {site.image_attribution && <span className="photo-credit">{site.image_attribution}</span>}
        </div>
      )}

      {isAuthenticated && (
        <button className={`btn ${favorite ? 'btn-primary' : 'btn-outline'}`} onClick={toggleFavorite} style={{ marginBottom: 'var(--space-3)' }}>
          {favorite ? '★ Dans vos favoris' : '☆ Ajouter aux favoris'}
        </button>
      )}

      <p style={{ maxWidth: '65ch', fontSize: '1.05rem' }}>{site.description}</p>

      {site.images?.length > 0 && (
        <section style={{ marginTop: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Galerie</h2>
          <div className="gallery-strip">
            {site.images.map((img) => (
              <figure className="gallery-strip__item" key={img.id} style={{ margin: 0 }}>
                <img src={img.url} alt={`${site.name} — photo supplémentaire`} loading="lazy" />
                {img.attribution && <span className="photo-credit">{img.attribution}</span>}
              </figure>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: 'var(--space-5)' }}>
        <h2>Avis des voyageurs</h2>

        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="field" style={{ maxWidth: 520 }}>
            <label>Votre note</label>
            <StarRating value={newRating} onChange={setNewRating} size={22} />
            <label htmlFor="comment" style={{ marginTop: '0.8em' }}>Laisser un avis</label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Partagez votre expérience…"
            />
            <button className="btn btn-primary" type="submit" style={{ marginTop: '0.7em' }}>Publier</button>
          </form>
        ) : (
          <p><Link to="/connexion">Connectez-vous</Link> pour laisser un avis.</p>
        )}

        {error && <div className="form-error">{error}</div>}

        {comments.length === 0 && (
          <div className="empty-state" style={{ marginTop: 'var(--space-3)' }}>
            <p>Aucun avis pour le moment. Soyez le premier à partager votre expérience.</p>
          </div>
        )}

        <div style={{ marginTop: 'var(--space-3)' }}>
          {comments.map((c) => {
            const isOwner = user && c.user_id === user.id
            const isEditing = editingId === c.id
            return (
              <div className="comment" key={c.id}>
                <div className="comment__meta">{c.username || `Utilisateur #${c.user_id}`}</div>
                {c.rating && <StarRating value={c.rating} size={13} />}
                {isEditing ? (
                  <div className="field" style={{ maxWidth: 480 }}>
                    <StarRating value={editRating} onChange={setEditRating} size={18} />
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} style={{ marginTop: '0.5em' }} />
                    <div style={{ display: 'flex', gap: '0.5em', marginTop: '0.5em' }}>
                      <button className="btn btn-primary" onClick={() => handleSaveEdit(c.id)}>Enregistrer</button>
                      <button className="btn btn-ghost" onClick={() => setEditingId(null)}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={{ margin: '0.3em 0 0' }}>{c.comment}</p>
                    {isOwner && (
                      <div style={{ display: 'flex', gap: '0.5em', marginTop: '0.4em' }}>
                        <button className="btn-ghost btn" onClick={() => { setEditingId(c.id); setEditText(c.comment); setEditRating(c.rating || 0) }}>Modifier</button>
                        <button className="btn-ghost btn" onClick={() => handleDeleteComment(c.id)}>Supprimer</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
