import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { siteService } from '../services/siteService'
import StarRating from '../components/StarRating'
import Loader from '../components/Loader'

const CATEGORY_COLOR = {
  nature: '#4d8c5a',
  plage: '#2a8c82',
  culture: '#e8a33d',
  faune: '#c1502e',
  aventure: '#9c3e22'
}

function markerIcon(category) {
  const color = CATEGORY_COLOR[category] || '#c1502e'
  return L.divIcon({
    className: 'site-marker',
    html: `<span style="background:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10]
  })
}

export default function Carte() {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    siteService.getAll()
      .then(setSites)
      .catch(() => setError('Impossible de charger les sites pour la carte.'))
      .finally(() => setLoading(false))
  }, [])

  const located = sites.filter((s) => s.latitude && s.longitude)

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-6)' }}>
      <h1 style={{ marginTop: 'var(--space-4)' }}>Carte des sites</h1>
      <p>Repérez les étapes les unes par rapport aux autres avant de tracer votre itinéraire.</p>

      {error && <div className="form-error">{error}</div>}
      {loading && <Loader label="Chargement de la carte…" />}

      {!loading && !error && (
        <div className="map-wrapper">
          <MapContainer center={[-19, 46.8]} zoom={6} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {located.map((site) => (
              <Marker key={site.id} position={[site.latitude, site.longitude]} icon={markerIcon(site.category)}>
                <Popup>
                  <strong>{site.name}</strong>
                  <br />
                  <span style={{ fontSize: '0.85em' }}>{site.region}</span>
                  {site.avg_rating && (
                    <div style={{ margin: '0.3em 0' }}>
                      <StarRating value={site.avg_rating} count={site.ratings_count} size={12} />
                    </div>
                  )}
                  <br />
                  <Link to={`/sites/${site.id}`}>Voir le site →</Link>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  )
}
