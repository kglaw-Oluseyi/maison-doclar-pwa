'use client'

import React from 'react'

interface TokenRestoreProps {
  slug: string
}

export function TokenRestore({ slug }: TokenRestoreProps) {
  const [noStoredToken, setNoStoredToken] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`md-token-${slug}`)
      if (stored) {
        window.location.replace(`/events/${slug}?token=${stored}`)
      } else {
        setNoStoredToken(true)
      }
    } catch {
      setNoStoredToken(true)
    }
  }, [slug])

  if (noStoredToken) {
    return (
      <div className="min-h-[100svh] bg-md-background text-md-text-primary">
        <div className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col justify-center px-6 py-12">
          <div className="text-center">
            <div className="font-[family-name:var(--md-font-heading)] text-4xl font-light text-md-accent">
              Maison Doclar
            </div>
            <div className="mx-auto mt-5 h-px w-10 bg-md-accent" />
            <div className="mt-6 font-[family-name:var(--md-font-heading)] text-2xl font-light">Access denied</div>
            <div className="mt-3 text-sm text-md-text-muted">
              This link may be invalid or expired. Please contact the event organiser for assistance.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'var(--md-background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--md-font-heading)',
          fontSize: '1.5rem',
          color: 'var(--md-accent)',
          fontWeight: 300,
          letterSpacing: '0.05em',
        }}
      >
        Maison Doclar
      </p>
      <p
        style={{
          fontFamily: 'var(--md-font-body)',
          fontSize: '0.875rem',
          color: 'var(--md-text-muted)',
        }}
      >
        Opening your event…
      </p>
    </div>
  )
}
