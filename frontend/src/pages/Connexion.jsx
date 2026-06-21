import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Connexion() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const user = await login(form)
      const redirectTo = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/sites')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.')
    }
  }

  return (
    <div className="container">
      <form className="form-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Connexion</span>
        <h2 style={{ marginTop: '0.3em' }}>Reprendre le carnet</h2>

        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        <p style={{ marginTop: '1.2rem', fontSize: '0.9rem' }}>
          Pas encore de carnet ? <Link to="/inscription">Créer un compte</Link>
        </p>
      </form>
    </div>
  )
}
