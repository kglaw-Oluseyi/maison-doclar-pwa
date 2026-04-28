'use client'

import * as React from 'react'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

import { formatTime } from '@/lib/format'

export type GuestSummary = {
  id: string
  name: string
  tableNumber: string | null
  dietaryNotes: string | null
  specialNotes: string | null
  tags: string[]
  rsvpStatus: string
}

export type CheckInResultProps = {
  result: 'SUCCESS' | 'DUPLICATE' | 'INVALID'
  message: string
  guest?: GuestSummary
  checkedInAt?: string
}

function WarningIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 2c.4 0 .77.2 1 .54l9 14.5c.24.38.25.86.03 1.25-.22.39-.64.63-1.08.63H3.05c-.44 0-.86-.24-1.08-.63a1.2 1.2 0 0 1 .03-1.25l9-14.5C11.23 2.2 11.6 2 12 2Zm0 6.4a1 1 0 0 0-1 1v4.9a1 1 0 1 0 2 0V9.4a1 1 0 0 0-1-1Zm0 8.9a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"
      />
    </svg>
  )
}

export function CheckInResult({ result, message, guest, checkedInAt }: CheckInResultProps) {
  const border =
    result === 'SUCCESS' ? 'var(--md-success)' : result === 'DUPLICATE' ? 'var(--md-warning)' : 'var(--md-error)'

  return (
    <div role="alert" aria-live="assertive">
      <Card className="p-0">
        <div style={{ borderLeft: `4px solid ${border}` }} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light">
                {result === 'SUCCESS' ? 'Checked in' : result === 'DUPLICATE' ? 'Already checked in' : 'Invalid pass'}
              </div>
              <div className="mt-2 text-sm text-md-text-muted">{message}</div>
            </div>
            {checkedInAt ? (
              <div className="text-sm text-md-accent" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {formatTime(new Date(checkedInAt))}
              </div>
            ) : null}
          </div>

          {guest ? (
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-[family-name:var(--md-font-heading)] text-xl font-light text-md-text-primary">
                  {guest.name}
                </div>
                {guest.tags.includes('VIP') ? (
                  <Badge variant="pending" className="bg-md-accent/15 text-md-accent">
                    VIP
                  </Badge>
                ) : null}
              </div>

              <div className="grid gap-2 text-sm text-md-text-muted">
                {guest.tableNumber ? <div>Table {guest.tableNumber}</div> : null}
                {guest.dietaryNotes ? (
                  <div className="inline-flex items-center gap-2 text-md-warning">
                    <WarningIcon className="text-md-warning" />
                    <span>{guest.dietaryNotes}</span>
                  </div>
                ) : null}
                {guest.specialNotes ? <div className="text-md-text-muted">{guest.specialNotes}</div> : null}
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

