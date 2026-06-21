export default function Loader({ label = 'Chargement…' }) {
  return (
    <p className="eyebrow" style={{ padding: '2rem 0', textAlign: 'center' }}>
      {label}
    </p>
  )
}
