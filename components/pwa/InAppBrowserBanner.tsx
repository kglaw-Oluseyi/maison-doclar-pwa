'use client'

import * as React from 'react'

export function InAppBrowserBanner() {
  const [copied, setCopied] = React.useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'var(--md-surface-elevated)',
        borderBottom: '1px solid var(--md-accent)',
        padding: '16px 20px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--md-font-heading)',
          fontSize: '1.1rem',
          color: 'var(--md-text-primary)',
          marginBottom: '6px',
        }}
      >
        Open in your browser for the best experience
      </p>
      <p
        style={{
          fontFamily: 'var(--md-font-body)',
          fontSize: '0.8rem',
          color: 'var(--md-text-muted)',
          marginBottom: '12px',
        }}
      >
        Tap the menu icon (⋯ or ⋮) and select &quot;Open in Safari&quot; or &quot;Open in Chrome&quot; to access your full
        event experience.
      </p>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch {}
        }}
        style={{
          padding: '10px 20px',
          border: '1px solid var(--md-accent)',
          background: 'transparent',
          color: 'var(--md-accent)',
          fontFamily: 'var(--md-font-body)',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        {copied ? 'Link Copied ✓' : 'Copy Link'}
      </button>
    </div>
  )
}
