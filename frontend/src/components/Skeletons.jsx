export function SiteCardSkeleton() {
  return (
    <div className="site-card skeleton-card" aria-hidden="true">
      <div className="site-card__image skeleton-block" />
      <div className="site-card__body">
        <div className="skeleton-line skeleton-line--xs" style={{ width: '40%' }} />
        <div className="skeleton-line skeleton-line--lg" style={{ width: '70%' }} />
        <div className="skeleton-line" style={{ width: '95%' }} />
        <div className="skeleton-line" style={{ width: '60%' }} />
      </div>
    </div>
  )
}

export function SiteGridSkeleton({ count = 6 }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <SiteCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton-line skeleton-line--xs" style={{ width: 120, marginTop: 'var(--space-3)' }} />
      <div className="skeleton-line skeleton-line--lg" style={{ width: '50%', height: '2.2rem' }} />
      <div className="skeleton-block" style={{ height: 320, borderRadius: 'var(--radius-lg)', margin: 'var(--space-3) 0' }} />
      <div className="skeleton-line" style={{ width: '90%' }} />
      <div className="skeleton-line" style={{ width: '80%' }} />
      <div className="skeleton-line" style={{ width: '60%' }} />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card" aria-hidden="true">
      <div className="skeleton-line skeleton-line--lg" style={{ width: '50%', height: '2rem' }} />
      <div className="skeleton-line skeleton-line--xs" style={{ width: '70%' }} />
    </div>
  )
}
