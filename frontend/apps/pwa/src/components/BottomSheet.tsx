import { useEffect, useRef } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: string;
}

export default function BottomSheet({ isOpen, onClose, children, height = '70%' }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
      />
      <div
        ref={sheetRef}
        style={{
          position: 'relative',
          width: '100%',
          height: height,
          maxHeight: '80%',
          backgroundColor: 'white',
          borderRadius: '16px 16px 0 0',
          padding: '16px 20px 24px',
          overflowY: 'auto',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <div style={{
          width: '40px',
          height: '4px',
          borderRadius: '2px',
          backgroundColor: '#ddd',
          margin: '0 auto 20px',
          cursor: 'grab',
        }} />
        {children}
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
