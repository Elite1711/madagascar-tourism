import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Accueil from './pages/Accueil'
import Connexion from './pages/Connexion'
import Inscription from './pages/Inscription'
import SitesTouristiques from './pages/SitesTouristiques'
import Carte from './pages/Carte'
import DetailSite from './pages/DetailSite'
import Favoris from './pages/Favoris'
import Profil from './pages/Profil'
import DashboardAdmin from './pages/DashboardAdmin'

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/sites" element={<SitesTouristiques />} />
          <Route path="/carte" element={<Carte />} />
          <Route path="/sites/:id" element={<DetailSite />} />

          <Route path="/favoris" element={
            <ProtectedRoute><Favoris /></ProtectedRoute>
          } />
          <Route path="/profil" element={
            <ProtectedRoute><Profil /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute><DashboardAdmin /></AdminRoute>
          } />

          <Route path="*" element={<Accueil />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
