import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Inscription() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate('/connexion'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Inscription impossible. Vérifiez vos informations.')
    }
  }

  return (
    <div className="container">
      <form className="form-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Inscription</span>
        <h2 style={{ marginTop: '0.3em' }}>Ouvrir un carnet</h2>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-error" style={{ borderColor: 'var(--success)', background: 'rgba(77,140,90,0.15)' }}>Compte créé, redirection…</div>}

        <div className="field">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input id="username" name="username" type="text" required value={form.username} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>

        <p style={{ marginTop: '1.2rem', fontSize: '0.9rem' }}>
          Déjà un carnet ? <Link to="/connexion">Se connecter</Link>
        </p>
      </form>
    </div>
  )
}
