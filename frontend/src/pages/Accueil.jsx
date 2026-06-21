import { Link } from 'react-router-dom'
import ReviewsCarousel from '../components/ReviewsCarousel'

const HIGHLIGHTS = [
  {
    name: 'Allée des Baobabs',
    region: 'Menabe',
    note: 'Coucher de soleil emblématique',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/All%C3%A9e%20des%20Baobabs%20near%20Morondava%2C%20Madagascar%20(4315249951).jpg'
  },
  {
    name: 'Parc national de l\u2019Isalo',
    region: 'Ihorombe',
    note: 'Canyons et piscines naturelles',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nationaal%20park%20Isalo%2006.JPG'
  },
  {
    name: 'Nosy Be',
    region: 'Diana',
    note: 'Plages et îlots du nord-ouest',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ambatoloaka%20village%20Nosy%20B%C3%A9%202013%20!.JPG'
  },
  {
    name: 'Andasibe-Mantadia',
    region: 'Alaotra-Mangoro',
    note: 'Forêt humide, chant des indris',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/INDRI-1.JPG'
  }
]

export default function Accueil() {
  return (
    <>
      <section className="container hero">
        <span className="eyebrow hero__kicker">Carnet de route — Madagascar</span>
        <h1>
          Onze régions,
          <br />
          un seul carnet de voyage.
        </h1>
        <p className="lead">
          Repérez les sites qui valent le détour sur la carte, gardez une trace de vos étapes
          favorites et laissez un avis noté pour les prochains voyageurs.
        </p>
        <div className="hero__actions">
          <Link to="/sites" className="btn btn-primary">Explorer les sites</Link>
          <Link to="/carte" className="btn btn-outline">Voir la carte</Link>
        </div>
      </section>

      <section className="container" style={{ marginBottom: 'var(--space-6)' }}>
        <h2>Étapes incontournables</h2>
        <div className="grid">
          {HIGHLIGHTS.map((h) => (
            <article className="site-card" key={h.name}>
              <div className="site-card__image">
                <img src={h.image} alt={h.name} loading="lazy" className="site-card__photo" />
              </div>
              <div className="site-card__body">
                <span className="site-card__region">{h.region}</span>
                <h3 className="site-card__name">{h.name}</h3>
                <p className="site-card__desc">{h.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ReviewsCarousel />
    </>
  )
}
