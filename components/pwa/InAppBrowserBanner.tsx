'use client'

import * as React from 'react'

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M8 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V7Zm2 0v11h9V7h-9ZM3 6a2 2 0 0 1 2-2h1a1 1 0 1 1 0 2H5v11h1a1 1 0 1 1 0 2H5a2 2 0 0 1-2-2V6Z"
      />
    </svg>
  )
}

export function InAppBrowserBanner() {
  const [copied, setCopied] = React.useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 70,
        background: 'var(--md-surface-elevated)',
        borderBottom: '1px solid var(--md-border)',
        padding: '12px 16px',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--md-text-primary)', lineHeight: 1.4 }}>
          For the best experience, open this page in Safari.
        </div>
        <button
          type="button"
          onClick={copyLink}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid var(--md-border)',
            background: 'transparent',
            color: copied ? 'var(--md-accent)' : 'var(--md-text-muted)',
            borderRadius: 10,
            padding: '10px 12px',
            cursor: 'pointer',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <CopyIcon />
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}

