'use client'

interface InstallPromptCardProps {
  headline: string
  body: string
  onInstall: () => void
  onDismiss: () => void
}

export function InstallPromptCard({ headline, body, onInstall, onDismiss }: InstallPromptCardProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '0 16px 32px',
        animation: 'slideUp 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .install-card { animation: none !important; }
        }
      `}</style>
      <div
        className="install-card"
        style={{
          background: 'var(--md-surface-elevated)',
          border: '1px solid var(--md-border-muted)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <p
            style={{
              fontFamily: 'var(--md-font-heading)',
              fontSize: '1.25rem',
              color: 'var(--md-text-primary)',
              fontWeight: 300,
            }}
          >
            {headline}
          </p>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              color: 'var(--md-text-subtle)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1,
              padding: '0 0 0 12px',
            }}
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--md-text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
          {body}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onInstall}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid var(--md-accent)',
              background: 'transparent',
              color: 'var(--md-text-primary)',
              fontFamily: 'var(--md-font-body)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Add to Home Screen
          </button>
          <button
            onClick={onDismiss}
            style={{
              padding: '12px 16px',
              border: '1px solid var(--md-border)',
              background: 'transparent',
              color: 'var(--md-text-muted)',
              fontFamily: 'var(--md-font-body)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}

