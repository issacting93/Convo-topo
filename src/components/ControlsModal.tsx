import React from 'react';

const THEME = {
  foreground: '#f5f5f5',
  foregroundMuted: '#888888',
  primary: '#030213',
  accent: '#7b68ee',
  border: '#444444',
  card: '#1a1a1a',
  background: '#030213',
  foregroundRgba: (alpha: number) => `rgba(245, 245, 245, ${alpha})`,
  accentRgba: (alpha: number) => `rgba(123, 104, 238, ${alpha})`,
  borderRgba: (alpha: number) => `rgba(68, 68, 68, ${alpha})`,
  cardRgba: (alpha: number) => `rgba(26, 26, 26, ${alpha})`,
};

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ControlsModal({ isOpen, onClose, children }: ControlsModalProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998,
          backdropFilter: 'blur(2px)',
        }}
      />
      
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? 'calc(100% - 40px)' : '90%',
          maxWidth: '600px',
          maxHeight: 'calc(100vh - 40px)',
          background: THEME.cardRgba(0.95),
          border: `1px solid ${THEME.borderRgba(0.3)}`,
          borderRadius: '8px',
          padding: isMobile ? '16px' : '24px',
          zIndex: 9999,
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: `1px solid ${THEME.borderRgba(0.2)}`,
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              color: THEME.foreground,
              margin: 0,
            }}
          >
            ◉ CONTROLS
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${THEME.borderRgba(0.3)}`,
              borderRadius: '4px',
              color: THEME.foreground,
              fontSize: '20px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </>
  );
}

interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: THEME.cardRgba(0.9),
        border: `1px solid ${THEME.borderRgba(0.3)}`,
        color: THEME.foreground,
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
        opacity: 0.8,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.8';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      }}
      title="Open Settings"
    >
      ⚙️
    </button>
  );
}

