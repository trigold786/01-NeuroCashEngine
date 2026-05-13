interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      padding: '24px',
      backgroundColor: '#fff0f0',
      border: '1px solid #ffcccc',
      borderRadius: '8px',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '32px' }}>⚠️</span>
      <p style={{ margin: 0, color: 'var(--semantic-red)', fontSize: '14px' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 20px',
            backgroundColor: 'var(--semantic-red)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          重试
        </button>
      )}
    </div>
  );
}
