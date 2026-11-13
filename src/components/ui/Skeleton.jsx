export function Skeleton({ className = "", width, height, radius = "10px", style = {} }) {
  return (
    <span
      aria-hidden="true"
      className={`ifc-skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

export function SkeletonBlock({ rows = 3, className = "" }) {
  return (
    <div className={`ifc-skeleton-block ${className}`.trim()} role="status" aria-label="Loading content">
      {Array.from({ length: rows }, (_, index) => (
        <div className="ifc-skeleton-row" key={index}>
          <Skeleton width="38px" height="38px" radius="10px" />
          <div className="ifc-skeleton-copy">
            <Skeleton width={index % 2 ? "52%" : "68%"} height="11px" />
            <Skeleton width="36%" height="9px" />
          </div>
          <Skeleton width="16%" height="12px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="ifc-skeleton-cards" role="status" aria-label="Loading dashboard data">
      {Array.from({ length: count }, (_, index) => (
        <div className="ifc-skeleton-card" key={index}>
          <Skeleton width="48%" height="10px" />
          <Skeleton width="34%" height="25px" />
          <Skeleton width="72%" height="9px" />
        </div>
      ))}
    </div>
  );
}
