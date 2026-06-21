import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Profil() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="container">
      <h1 style={{ marginTop: 'var(--space-4)' }}>Profil</h1>

      <div className="form-card" style={{ margin: '0 0 var(--space-5)', textAlign: 'left' }}>
        <span className="eyebrow">{user.role === 'admin' ? 'Administrateur' : 'Voyageur'}</span>
        <h2 style={{ margin: '0.3em 0 1em' }}>{user.username}</h2>

        <div className="field">
          <label>Email</label>
          <input type="email" value={user.email} disabled />
        </div>

        <button className="btn btn-danger" onClick={handleLogout} style={{ marginTop: '0.5em' }}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
