export default function SkeletonCard() {
  return (
    <div className="card listing-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-img" />
      <div className="card-body">
        <div className="row-between">
          <div className="skeleton skeleton-line badge" />
          <div className="skeleton skeleton-line badge" style={{ width: '40px' }} />
        </div>
        <div className="skeleton skeleton-line title" />
        <div className="skeleton skeleton-line subtitle" />
        <div className="skeleton skeleton-line price" />
      </div>
    </div>
  );
}
