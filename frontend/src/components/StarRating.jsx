export default function StarRating({ value = 0, count, onChange, size = 16 }) {
  const interactive = typeof onChange === 'function'
  const stars = [1, 2, 3, 4, 5]

  return (
    <span className="star-rating" role={interactive ? 'radiogroup' : undefined} aria-label="Note">
      {stars.map((n) => {
        const filled = n <= Math.round(value)
        const star = (
          <svg
            key={n}
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polygon points="12 2.5 15.1 9 22 10 17 15 18.2 21.8 12 18.5 5.8 21.8 7 15 2 10 8.9 9" />
          </svg>
        )
        return interactive ? (
          <button
            type="button"
            key={n}
            className="star-rating__btn"
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
            onClick={() => onChange(n)}
          >
            {star}
          </button>
        ) : (
          star
        )
      })}
      {!interactive && value > 0 && (
        <span className="star-rating__value">
          {value.toFixed(1)}{count !== undefined && ` (${count})`}
        </span>
      )}
    </span>
  )
}
