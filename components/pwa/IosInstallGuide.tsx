'use client'

import * as React from 'react'

export type IosInstallGuideProps = {
  eventName: string
  onDismiss: () => void
}

function SheetIconWrap({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        border: '1px solid var(--md-border-muted)',
        background: 'var(--md-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 3a1 1 0 0 1 1 1v8.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L11 12.6V4a1 1 0 0 1 1-1Z"
      />
      <path
        fill="currentColor"
        d="M6 14a1 1 0 0 1 1 1v3h10v-3a1 1 0 1 1 2 0v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3a1 1 0 0 1 1-1Z"
      />
    </svg>
  )
}

function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M7 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm0 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm5 2a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9a1 1 0 1 1 0-2h2V9a1 1 0 0 1 1-1Z"
      />
    </svg>
  )
}

function HomeGridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M7 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm10 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM7 13a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm10 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
      />
    </svg>
  )
}

export function IosInstallGuide({ eventName, onDismiss }: IosInstallGuideProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(0,0,0,0.65)',
        padding: '12px 16px 24px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Save to home screen on iOS"
    >
      <style>{`
        @keyframes sheetUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes mdPulsingGold {
          0%, 100% { opacity: 0.55; box-shadow: 0 0 0 0 color-mix(in srgb, var(--md-accent) 45%, transparent); }
          50% { opacity: 1; box-shadow: 0 0 18px 2px color-mix(in srgb, var(--md-accent) 35%, transparent); }
        }
        @media (prefers-reduced-motion: reduce) {
          .md-sheet { animation: none !important; }
          .md-pulse-top { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
      <div
        className="md-sheet"
        style={{
          width: '100%',
          maxWidth: 560,
          minHeight: 'min(72vh, 620px)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--md-surface-elevated)',
          border: '1px solid var(--md-border-muted)',
          borderRadius: 20,
          overflow: 'hidden',
          animation: 'sheetUp 340ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="md-pulse-top"
          style={{
            height: 5,
            flexShrink: 0,
            background: 'var(--md-accent)',
            animation: 'mdPulsingGold 2.2s ease-in-out infinite',
          }}
        />

        <div style={{ padding: '28px 28px 20px', flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              fontFamily: 'var(--md-font-heading)',
              fontSize: 'clamp(1.35rem, 4.5vw, 1.75rem)',
              fontWeight: 300,
              color: 'var(--md-text-primary)',
              lineHeight: 1.25,
              letterSpacing: '0.02em',
            }}
          >
            Save {eventName} to your home screen
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: 'var(--md-font-body)',
              fontSize: '0.95rem',
              color: 'var(--md-text-muted)',
              lineHeight: 1.65,
            }}
          >
            Access your event guide and digital pass instantly, even without signal.
          </div>

          <div style={{ marginTop: 28, display: 'grid', gap: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <SheetIconWrap>
                <ShareIcon />
              </SheetIconWrap>
              <div
                style={{
                  fontFamily: 'var(--md-font-body)',
                  fontSize: '1rem',
                  color: 'var(--md-text-primary)',
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                Tap the <span style={{ color: 'var(--md-accent)' }}>Share</span> button in your browser
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <SheetIconWrap>
                <AddIcon />
              </SheetIconWrap>
              <div
                style={{
                  fontFamily: 'var(--md-font-body)',
                  fontSize: '1rem',
                  color: 'var(--md-text-primary)',
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                Scroll down and tap <span style={{ color: 'var(--md-accent)' }}>Add to Home Screen</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <SheetIconWrap>
                <HomeGridIcon />
              </SheetIconWrap>
              <div
                style={{
                  fontFamily: 'var(--md-font-body)',
                  fontSize: '1rem',
                  color: 'var(--md-text-primary)',
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                Tap <span style={{ color: 'var(--md-accent)' }}>Add</span> to confirm
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '12px 28px 24px',
            borderTop: '1px solid var(--md-border-muted)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            onClick={onDismiss}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--md-text-subtle)',
              fontFamily: 'var(--md-font-body)',
              fontSize: '0.8rem',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              cursor: 'pointer',
              padding: '8px 12px',
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
