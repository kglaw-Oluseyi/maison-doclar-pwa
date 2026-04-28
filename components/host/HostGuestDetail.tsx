'use client'

import * as React from 'react'

import { formatDate, formatTime } from '@/lib/format'

type Guest = {
  id: string
  name: string
  email: string | null
  rsvpStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  rsvpDetails?: unknown
  tableNumber: string | null
  tags: string[]
  dietaryNotes: string | null
  specialNotes: string | null
  checkIn: { scannedAt: string; method: 'QR_SCAN' | 'MANUAL' } | null
}

function statusTone(status: Guest['rsvpStatus']): string {
  if (status === 'ACCEPTED') return 'var(--md-success)'
  if (status === 'DECLINED') return 'var(--md-error)'
  return 'var(--md-warning)'
}

export function HostGuestDetail({
  guest,
  showRsvpDetails,
  open,
  onClose,
}: {
  guest: Guest | null
  showRsvpDetails: boolean
  open: boolean
  onClose: () => void
}) {
  const prefersReducedMotion = React.useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  if (!open) {
    return <div aria-hidden="true" style={{ display: 'none' }} />
  }

  const d = guest?.checkIn ? new Date(guest.checkIn.scannedAt) : null
  const checkInText =
    d && !Number.isNaN(d.getTime()) ? `${formatDate(d)} ${formatTime(d)}` : guest?.checkIn?.scannedAt ?? null

  const details =
    guest?.rsvpDetails && typeof guest.rsvpDetails === 'object' && !Array.isArray(guest.rsvpDetails)
      ? (guest.rsvpDetails as Record<string, any>)
      : null

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          transition: prefersReducedMotion ? undefined : 'opacity 300ms ease',
          zIndex: 50,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          background: 'var(--md-surface)',
          borderTop: '1px solid var(--md-border)',
          transform: prefersReducedMotion ? undefined : 'translateY(0)',
          animation: prefersReducedMotion ? undefined : 'mdSheetIn 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes mdSheetIn { from { transform: translateY(12px); opacity: 0.98; } to { transform: translateY(0); opacity: 1; } }
          @media (prefers-reduced-motion: reduce) { .md-sheet-anim { animation: none !important; } }
        `}</style>
        <div className="mx-auto max-w-[720px] px-5 pb-8 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-md-border-muted" />

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-[family-name:var(--md-font-heading)] text-3xl font-light">{guest?.name}</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-md-surface-elevated px-3 py-1 text-xs">
                <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: statusTone(guest?.rsvpStatus ?? 'PENDING') }} />
                <span className="text-md-text-muted">{guest?.rsvpStatus}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary hover:bg-md-surface-elevated"
              style={{ minWidth: 44 }}
            >
              Close
            </button>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="rounded-2xl border border-md-border bg-md-surface-elevated p-4">
              <div className="text-[11px] uppercase tracking-[0.15em] text-md-text-muted">Check-in</div>
              <div className="mt-2 text-md-text-primary">
                {guest?.checkIn ? `Arrived · ${checkInText ?? ''}` : 'Not arrived'}
              </div>
            </div>

            <div className="rounded-2xl border border-md-border bg-md-surface-elevated p-4">
              <div className="text-[11px] uppercase tracking-[0.15em] text-md-text-muted">Table</div>
              <div className="mt-2 text-md-text-primary">{guest?.tableNumber ?? '—'}</div>
            </div>

            {guest?.tags?.length ? (
              <div className="rounded-2xl border border-md-border bg-md-surface-elevated p-4">
                <div className="text-[11px] uppercase tracking-[0.15em] text-md-text-muted">Tags</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {guest.tags.map((t) => (
                    <span key={t} className="rounded-full border border-md-border px-3 py-1 text-xs text-md-text-muted">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {guest?.dietaryNotes ? (
              <div className="rounded-2xl border border-md-border bg-md-warning/10 p-4">
                <div className="text-[11px] uppercase tracking-[0.15em] text-md-warning">Dietary</div>
                <div className="mt-2 text-md-text-primary">{guest.dietaryNotes}</div>
              </div>
            ) : null}

            {guest?.specialNotes ? (
              <div className="rounded-2xl border border-md-border bg-md-surface-elevated p-4">
                <div className="text-[11px] uppercase tracking-[0.15em] text-md-text-muted">Notes</div>
                <div className="mt-2 text-md-text-primary">{guest.specialNotes}</div>
              </div>
            ) : null}

            {showRsvpDetails && details ? (
              <div style={{ marginTop: '20px' }}>
                <p
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--md-accent)',
                    marginBottom: '12px',
                  }}
                >
                  RSVP Details
                </p>

                {details.plusOneName ? (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--md-text-muted)', marginBottom: '2px' }}>Plus one</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--md-text-primary)' }}>{details.plusOneName}</p>
                  </div>
                ) : null}

                {details.dietaryRequirements ? (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--md-text-muted)', marginBottom: '2px' }}>Dietary</p>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--md-warning)',
                        background: 'rgba(196, 147, 63, 0.1)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                      }}
                    >
                      {details.dietaryRequirements}
                    </p>
                  </div>
                ) : null}

                {details.message ? (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--md-text-muted)', marginBottom: '2px' }}>Message</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--md-text-primary)', fontStyle: 'italic' }}>
                      &quot;{details.message}&quot;
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

