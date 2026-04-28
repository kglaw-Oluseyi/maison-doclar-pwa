export function OutstandingRequestsBadge({ pendingRequests }: { pendingRequests: number }) {
  if (pendingRequests <= 0) return null

  return (
    <div
      style={{
        background: 'rgba(196, 147, 63, 0.1)',
        border: '1px solid rgba(196, 147, 63, 0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minHeight: 44,
      }}
    >
      <span style={{ color: 'var(--md-warning)', fontSize: '16px' }} aria-hidden="true">
        ⚠
      </span>
      <p style={{ fontSize: '0.875rem', color: 'var(--md-warning)', margin: 0 }}>
        {pendingRequests} guest {pendingRequests === 1 ? 'request' : 'requests'} awaiting attention. The event team has been
        notified.
      </p>
    </div>
  )
}

