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
        width: 44,
        height: 44,
        borderRadius: 12,
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
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
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
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M7 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm0 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm5 2a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9a1 1 0 1 1 0-2h2V9a1 1 0 0 1 1-1Z"
      />
    </svg>
  )
}

function HomeGridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
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
        background: 'rgba(0,0,0,0.6)',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Install on iOS"
      onClick={onDismiss}
    >
      <style>{`
        @keyframes sheetUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .md-sheet { animation: none !important; } }
      `}</style>
      <div
        className="md-sheet"
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--md-surface-elevated)',
          border: '1px solid var(--md-border-muted)',
          borderRadius: 16,
          padding: 24,
          animation: 'sheetUp 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--md-font-heading)',
                fontSize: 22,
                fontWeight: 300,
                color: 'var(--md-text-primary)',
              }}
            >
              Install {eventName}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'var(--md-text-muted)', lineHeight: 1.6 }}>
              Add this event guide to your Home Screen for quick access.
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--md-text-subtle)',
              cursor: 'pointer',
              fontSize: 22,
              lineHeight: 1,
              padding: '0 0 0 12px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <SheetIconWrap>
              <ShareIcon />
            </SheetIconWrap>
            <div style={{ fontSize: 13, color: 'var(--md-text-primary)', lineHeight: 1.5 }}>
              Tap the <span style={{ color: 'var(--md-accent)' }}>Share</span> button in your browser
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <SheetIconWrap>
              <AddIcon />
            </SheetIconWrap>
            <div style={{ fontSize: 13, color: 'var(--md-text-primary)', lineHeight: 1.5 }}>
              Scroll down and tap <span style={{ color: 'var(--md-accent)' }}>Add to Home Screen</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <SheetIconWrap>
              <HomeGridIcon />
            </SheetIconWrap>
            <div style={{ fontSize: 13, color: 'var(--md-text-primary)', lineHeight: 1.5 }}>
              Tap <span style={{ color: 'var(--md-accent)' }}>Add</span> to confirm
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
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

