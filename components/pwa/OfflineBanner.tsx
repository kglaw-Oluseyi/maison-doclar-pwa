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
        zIndex: 90,
        background: 'var(--md-surface)',
        borderBottom: '2px solid var(--md-accent)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--md-accent)',
          flexShrink: 0,
        }}
      />
      <p
        style={{
          fontFamily: 'var(--md-font-body)',
          fontSize: '0.8rem',
          color: 'var(--md-text-muted)',
        }}
      >
        Your saved event details are available offline
      </p>
    </div>
  )
}
