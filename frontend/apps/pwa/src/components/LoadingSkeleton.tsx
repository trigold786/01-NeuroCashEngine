interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-color) 50%, var(--bg-secondary) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <Skeleton width="60%" height="24px" style={{ marginBottom: '16px' }} />
      <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
      <Skeleton width="80%" height="16px" style={{ marginBottom: '8px' }} />
      <Skeleton width="40%" height="16px" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <Skeleton width="40%" height="24px" style={{ marginBottom: '20px' }} />
      <div style={{
        height: '250px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        padding: '0 10px',
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${30 + Math.random() * 70}%`,
              borderRadius: '4px 4px 0 0',
              background: 'linear-gradient(180deg, var(--brand-blue) 0%, var(--bg-secondary) 100%)',
              opacity: 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function StepSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <Skeleton width="50%" height="28px" style={{ marginBottom: '24px' }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ marginBottom: '20px' }}>
          <Skeleton width="30%" height="18px" style={{ marginBottom: '12px' }} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <Skeleton width="100px" height="40px" borderRadius="8px" />
            <Skeleton width="100px" height="40px" borderRadius="8px" />
            <Skeleton width="100px" height="40px" borderRadius="8px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
