import { useEffect, useState } from 'react'
import { siteService } from '../services/siteService'
import { adminService } from '../services/adminService'
import { commentService } from '../services/commentService'
import Loader from '../components/Loader'
import { StatCardSkeleton } from '../components/Skeletons'
import { CATEGORIES } from '../components/CategoryFilter'

const TABS = ['Vue d\u2019ensemble', 'Sites', 'Utilisateurs', 'Commentaires']
const EMPTY_SITE = { name: '', region: '', description: '', image: '', image_attribution: '', category: 'nature', latitude: '', longitude: '' }

export default function DashboardAdmin() {
  const [tab, setTab] = useState(TABS[0])

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-6)' }}>
      <h1 style={{ marginTop: 'var(--space-4)' }}>Dashboard administrateur</h1>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === TABS[0] && <StatsPanel />}
      {tab === TABS[1] && <SitesPanel />}
      {tab === TABS[2] && <UsersPanel />}
      {tab === TABS[3] && <CommentsPanel />}
    </div>
  )
}

function StatsPanel() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => setError('Statistiques indisponibles pour le moment.'))
  }, [])

  if (error) return <div className="form-error">{error}</div>
  if (!stats) {
    return (
      <div className="stats-grid">
        <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
      </div>
    )
  }

  const items = [
    { label: 'Sites', value: stats.sites },
    { label: 'Utilisateurs', value: stats.users },
    { label: 'Commentaires', value: stats.comments },
    { label: 'Favoris', value: stats.favorites }
  ]

  return (
    <div className="stats-grid">
      {items.map((it) => (
        <div className="stat-card" key={it.label}>
          <span className="stat-card__value">{it.value ?? '—'}</span>
          <span className="stat-card__label">{it.label}</span>
        </div>
      ))}
    </div>
  )
}

function SitesPanel() {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null = fermé, {} = création, {...site} = édition
  const [form, setForm] = useState(EMPTY_SITE)

  function load() {
    setLoading(true)
    siteService.getAll()
      .then(setSites)
      .catch(() => setError('Impossible de charger les sites.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setForm(EMPTY_SITE)
    setEditing({})
  }

  function openEdit(site) {
    setForm({
      name: site.name,
      region: site.region,
      description: site.description,
      image: site.image || '',
      image_attribution: site.image_attribution || '',
      category: site.category || 'nature',
      latitude: site.latitude ?? '',
      longitude: site.longitude ?? ''
    })
    setEditing(site)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      latitude: form.latitude === '' ? null : Number(form.latitude),
      longitude: form.longitude === '' ? null : Number(form.longitude)
    }
    try {
      if (editing?.id) {
        await siteService.update(editing.id, payload)
      } else {
        await siteService.create(payload)
      }
      setEditing(null)
      load()
    } catch {
      setError('Échec de l\u2019enregistrement du site.')
    }
  }

  async function handleDelete(id) {
    try {
      await siteService.remove(id)
      setSites((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setError('Échec de la suppression.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <h2 style={{ margin: 0 }}>Sites ({sites.length})</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter un site</button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {editing !== null && (
        <form className="form-card" style={{ margin: '0 0 var(--space-4)', maxWidth: 520 }} onSubmit={handleSubmit}>
          <h3 style={{ marginTop: 0 }}>{editing?.id ? 'Modifier le site' : 'Nouveau site'}</h3>
          <div className="field">
            <label>Nom</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Région</label>
            <input required value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label>Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ width: '100%', padding: '0.75em 0.9em', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--cream)' }}
            >
              {CATEGORIES.filter((c) => c.value).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.8em' }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-18.9239" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="47.5328" />
            </div>
          </div>
          <div className="field">
            <label>URL de l'image de couverture (optionnel)</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <div className="field">
            <label>Crédit photo (optionnel)</label>
            <input
              placeholder="Photo : Nom / Wikimedia Commons (CC BY)"
              value={form.image_attribution}
              onChange={(e) => setForm({ ...form, image_attribution: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.6em' }}>
            <button className="btn btn-primary" type="submit">Enregistrer</button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>Annuler</button>
          </div>
        </form>
      )}

      {editing?.id && <GallerySection site={editing} onSitesChanged={load} />}

      {loading ? <Loader /> : (
        <table>
          <thead>
            <tr><th>Nom</th><th>Région</th><th></th></tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.region}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-ghost btn" onClick={() => openEdit(s)}>Modifier</button>
                  <button className="btn-ghost btn" onClick={() => handleDelete(s.id)} style={{ color: 'var(--danger)' }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function GallerySection({ site, onSitesChanged }) {
  const [images, setImages] = useState(site.images || [])
  const [newUrl, setNewUrl] = useState('')
  const [newAttribution, setNewAttribution] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setImages(site.images || [])
  }, [site.id])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newUrl.trim()) return
    try {
      const created = await siteService.addImage(site.id, { url: newUrl.trim(), attribution: newAttribution.trim() })
      setImages((prev) => [...prev, created])
      setNewUrl('')
      setNewAttribution('')
      onSitesChanged?.()
    } catch {
      setError('Échec de l\u2019ajout de la photo.')
    }
  }

  async function handleRemove(imageId) {
    try {
      await siteService.removeImage(site.id, imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      onSitesChanged?.()
    } catch {
      setError('Échec de la suppression de la photo.')
    }
  }

  return (
    <div className="form-card" style={{ margin: '0 0 var(--space-4)', maxWidth: 520 }}>
      <h3 style={{ marginTop: 0 }}>Galerie — {site.name}</h3>
      {error && <div className="form-error">{error}</div>}

      {images.length === 0 ? (
        <p style={{ fontSize: '0.9rem' }}>Aucune photo supplémentaire pour ce site.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6em', marginBottom: '1em' }}>
          {images.map((img) => (
            <div key={img.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
              <img src={img.url} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--cream-dim)', flex: 1 }}>{img.attribution || 'Sans crédit'}</span>
              <button className="btn-ghost btn" style={{ color: 'var(--danger)' }} onClick={() => handleRemove(img.id)}>Retirer</button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd}>
        <div className="field">
          <label>URL de la photo</label>
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="field">
          <label>Crédit photo (optionnel)</label>
          <input value={newAttribution} onChange={(e) => setNewAttribution(e.target.value)} placeholder="Photo : Nom / Wikimedia Commons (CC BY)" />
        </div>
        <button className="btn btn-outline" type="submit">+ Ajouter à la galerie</button>
      </form>
    </div>
  )
}

function UsersPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService.getUsers()
      .then(setUsers)
      .catch(() => setError('Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    try {
      await adminService.removeUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      setError('Échec de la suppression.')
    }
  }

  if (loading) return <Loader label="Chargement des utilisateurs…" />
  if (error) return <div className="form-error">{error}</div>

  return (
    <div>
      <h2>Utilisateurs ({users.length})</h2>
      <table>
        <thead>
          <tr><th>Nom</th><th>Email</th><th>Rôle</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td style={{ textAlign: 'right' }}>
                {u.role !== 'admin' && (
                  <button className="btn-ghost btn" onClick={() => handleDelete(u.id)} style={{ color: 'var(--danger)' }}>
                    Supprimer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CommentsPanel() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService.getAllComments()
      .then(setComments)
      .catch(() => setError('Impossible de charger les commentaires.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    try {
      await commentService.remove(id)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch {
      setError('Échec de la suppression du commentaire.')
    }
  }

  if (loading) return <Loader label="Chargement des commentaires…" />
  if (error) return <div className="form-error">{error}</div>

  return (
    <div>
      <h2>Commentaires ({comments.length})</h2>
      {comments.length === 0 && (
        <div className="empty-state"><p>Aucun commentaire à modérer.</p></div>
      )}
      <div>
        {comments.map((c) => (
          <div className="comment" key={c.id}>
            <div className="comment__meta">{c.username || `Utilisateur #${c.user_id}`} — site #{c.site_id}</div>
            <p style={{ margin: '0 0 0.4em' }}>{c.comment}</p>
            <button className="btn-ghost btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(c.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
