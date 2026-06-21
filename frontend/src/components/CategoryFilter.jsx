const CATEGORIES = [
  { value: '', label: 'Toutes', icon: '✦' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'plage', label: 'Plage', icon: '🌊' },
  { value: 'culture', label: 'Culture', icon: '🏛' },
  { value: 'faune', label: 'Faune', icon: '🦎' },
  { value: 'aventure', label: 'Aventure', icon: '⛰' }
]

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="category-filter">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          className={`category-pill ${value === cat.value ? 'active' : ''}`}
          onClick={() => onChange(cat.value)}
        >
          <span aria-hidden="true">{cat.icon}</span> {cat.label}
        </button>
      ))}
    </div>
  )
}

export { CATEGORIES }
