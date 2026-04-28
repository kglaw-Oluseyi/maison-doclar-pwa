'use client'

export function OfflineBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        borderLeft: '4px solid var(--md-accent)',
        background: 'var(--md-surface-elevated)',
        borderBottom: '1px solid var(--md-border)',
        padding: '10px 16px',
        fontSize: '12px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--md-text-primary)',
      }}
    >
      Offline — showing your saved event details.
    </div>
  )
}

