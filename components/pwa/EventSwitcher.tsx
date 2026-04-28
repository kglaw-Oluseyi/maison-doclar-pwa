'use client'

import * as React from 'react'

export type EventSwitcherProps = {
  activeEvents: string[]
  currentSlug: string
}

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M7 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm10 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM7 13a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm10 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
      />
    </svg>
  )
}

export function EventSwitcher({ activeEvents, currentSlug }: EventSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return
      const target = e.target
      if (!(target instanceof Node)) return
      if (ref.current && !ref.current.contains(target)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const other = activeEvents.filter((s) => s !== currentSlug)
  if (other.length === 0) return null

  return (
    <div ref={ref} style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 80 }}>
      {open ? (
        <div
          style={{
            width: 220,
            background: 'var(--md-surface-elevated)',
            border: '1px solid var(--md-border-muted)',
            borderRadius: 16,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--md-text-muted)',
              marginBottom: 10,
            }}
          >
            Your events
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {activeEvents.map((slug) => (
              <a
                key={slug}
                href={`/events/${slug}`}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: `1px solid ${slug === currentSlug ? 'var(--md-accent)' : 'var(--md-border)'}`,
                  color: 'var(--md-text-primary)',
                  fontSize: 13,
                }}
              >
                {slug}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch event"
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          border: '1px solid var(--md-border-muted)',
          background: 'var(--md-surface-elevated)',
          color: 'var(--md-text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <GridIcon />
      </button>
    </div>
  )
}

