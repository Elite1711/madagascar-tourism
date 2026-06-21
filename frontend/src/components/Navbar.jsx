import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          Diary <span>MADAGASCAR</span>
        </NavLink>

        <nav className="navbar__links">
          <NavLink to="/sites">Sites</NavLink>
          <NavLink to="/carte">Carte</NavLink>
          {isAuthenticated && <NavLink to="/favoris">Favoris</NavLink>}
          {isAdmin && <NavLink to="/admin">Dashboard</NavLink>}

          {isAuthenticated ? (
            <>
              <NavLink to="/profil">{user?.username}</NavLink>
              <button onClick={handleLogout}>Déconnexion</button>
            </>
          ) : (
            <>
              <NavLink to="/connexion">Connexion</NavLink>
              <NavLink to="/inscription" className="btn btn-primary" style={{ padding: '0.5em 1em' }}>
                Inscription
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
