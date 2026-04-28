'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RSVPForm } from '@/components/event/RSVPForm'

type RSVPStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M9.2 16.6 4.9 12.3a1 1 0 0 1 1.4-1.4l2.9 2.9 8.5-8.5a1 1 0 0 1 1.4 1.4l-9.9 9.9a1 1 0 0 1-1.4 0Z"
      />
    </svg>
  )
}

export type RSVPCardProps = {
  slug: string
  token: string
  rsvpOpen: boolean
  initialStatus: RSVPStatus
}

type DisplayState = 'idle-pending' | 'idle-accepted' | 'idle-declined' | 'form-active'

export function RSVPCard({ slug, token, rsvpOpen, initialStatus }: RSVPCardProps) {
  const [status, setStatus] = React.useState<RSVPStatus>(initialStatus)
  const [display, setDisplay] = React.useState<DisplayState>(() => {
    if (initialStatus === 'ACCEPTED') return 'idle-accepted'
    if (initialStatus === 'DECLINED') return 'idle-declined'
    return 'idle-pending'
  })

  React.useEffect(() => {
    if (status === 'PENDING') setDisplay('idle-pending')
    if (status === 'ACCEPTED') setDisplay('idle-accepted')
    if (status === 'DECLINED') setDisplay('idle-declined')
  }, [status])

  if (!rsvpOpen && status === 'PENDING') {
    return (
      <Card title="RSVP">
        <div className="space-y-3">
          <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light">RSVP is now closed</div>
          <div className="text-sm text-md-text-muted">If you need assistance, please contact the event organiser.</div>
        </div>
      </Card>
    )
  }

  if (display === 'form-active' || (display === 'idle-pending' && rsvpOpen)) {
    return (
      <div className="transition-opacity duration-300">
        <RSVPForm
          slug={slug}
          token={token}
          onSuccess={(next) => {
            setStatus(next)
            setDisplay(next === 'ACCEPTED' ? 'idle-accepted' : 'idle-declined')
          }}
        />
      </div>
    )
  }

  if (display === 'idle-accepted') {
    return (
      <Card title="RSVP">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-md-accent">
            <CheckIcon className="text-md-accent" />
            <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light text-md-text-primary">
              You’re attending.
            </div>
          </div>
          <div className="text-sm text-md-text-muted">We look forward to welcoming you.</div>
          <Button type="button" variant="secondary" onClick={() => setDisplay('form-active')}>
            Update RSVP
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card title="RSVP">
      <div className="space-y-4">
        <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light">You’ve declined.</div>
        <div className="text-sm text-md-text-muted">If your plans change, you can update your response.</div>
        <Button type="button" variant="secondary" onClick={() => setDisplay('form-active')}>
          Change response
        </Button>
      </div>
    </Card>
  )
}

