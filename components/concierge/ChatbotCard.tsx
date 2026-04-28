'use client'

import * as React from 'react'

interface ChatbotCardProps {
  chatbotUrl: string
  chatbotTitle: string
  guestToken: string
  eventSlug: string
}

export function ChatbotCard({ chatbotUrl, chatbotTitle, guestToken, eventSlug }: ChatbotCardProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [iframeError, setIframeError] = React.useState(false)

  const src = React.useMemo(() => {
    const u = new URL(chatbotUrl)
    u.searchParams.set('token', guestToken)
    u.searchParams.set('event', eventSlug)
    return u.toString()
  }, [chatbotUrl, guestToken, eventSlug])

  React.useEffect(() => {
    if (!expanded) return
    setLoading(true)
    setIframeError(false)
  }, [expanded])

  return (
    <div
      style={{
        background: 'var(--md-surface)',
        border: '1px solid var(--md-border)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <button
        onClick={() => setExpanded((v) => !v)}
        type="button"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--md-accent)',
              fontFamily: 'var(--md-font-body)',
              marginBottom: '4px',
            }}
          >
            {chatbotTitle}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--md-text-muted)' }}>Chat with our concierge team</p>
        </div>
        <span
          style={{
            color: 'var(--md-accent)',
            fontSize: '1.25rem',
            transform: expanded ? 'rotate(45deg)' : 'none',
            transition: 'transform 300ms ease',
            display: 'inline-block',
          }}
        >
          +
        </span>
      </button>

      <div
        style={{
          maxHeight: expanded ? '560px' : '0',
          overflow: 'hidden',
          transition: 'max-height 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {expanded ? (
          iframeError ? (
            <div
              style={{
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--md-text-muted)',
                fontSize: '0.875rem',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              Concierge is currently unavailable. Please use WhatsApp to reach us directly.
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {loading ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--md-surface)',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      border: '2px solid var(--md-border)',
                      borderTopColor: 'var(--md-accent)',
                      borderRadius: '50%',
                      animation: 'spin 800ms linear infinite',
                    }}
                  />
                </div>
              ) : null}
              <iframe
                src={src}
                style={{ width: '100%', height: '480px', border: 'none', display: 'block' }}
                allow="microphone"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setLoading(false)}
                onError={() => setIframeError(true)}
              />
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}

