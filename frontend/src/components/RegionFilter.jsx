const REGIONS = [
  'Toutes',
  'Analamanga',
  'Vakinankaratra',
  'Haute Matsiatra',
  'Atsimo-Andrefana',
  'Boeny',
  'Diana',
  'Alaotra-Mangoro',
  'Menabe',
  'Ihorombe',
  'Melaky',
  'Analanjirofo'
]

export default function RegionFilter({ value, onChange }) {
  return (
    <div className="route-filter">
      <span className="eyebrow" style={{ display: 'block', marginBottom: '0.75rem' }}>
        Itinéraire — filtrer par région
      </span>
      <div className="route-filter__line" />
      <div className="route-filter__track">
        {REGIONS.map((region) => (
          <button
            key={region}
            className={`route-stop ${value === region || (value === '' && region === 'Toutes') ? 'active' : ''}`}
            onClick={() => onChange(region === 'Toutes' ? '' : region)}
          >
            <span className="route-stop__dot" />
            {region}
          </button>
        ))}
      </div>
    </div>
  )
}
