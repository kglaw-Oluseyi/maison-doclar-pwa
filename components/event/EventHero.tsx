import * as React from 'react'

import { Badge } from '@/components/ui/Badge'

export type EventHeroProps = {
  eventName: string
  eventDateISO: string
  locationName: string
  guestName: string
  guestTags: string[]
}

function formatLongDate(iso: string): string {
  const date = new Date(iso)
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function EventHero({ eventName, eventDateISO, locationName, guestName, guestTags }: EventHeroProps) {
  const isVip = guestTags.includes('VIP')

  return (
    <section className="text-center">
      <div className="mx-auto max-w-[640px]">
        <h1
          className="font-[family-name:var(--md-font-heading)] font-light leading-[0.95] text-md-text-primary"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}
        >
          {eventName}
        </h1>

        <div className="mx-auto mt-5 h-px w-10 bg-md-accent" />

        <div className="mt-5 text-sm text-md-text-muted">{formatLongDate(eventDateISO)}</div>
        <div className="mt-1 text-sm text-md-text-muted">{locationName}</div>

        <div className="mt-6 text-sm text-md-text-muted">Welcome, {guestName}</div>

        {isVip ? (
          <div className="mt-4 inline-flex items-center justify-center">
            <Badge variant="pending" className="bg-md-accent/15 text-md-accent">
              VIP
            </Badge>
          </div>
        ) : null}
      </div>
    </section>
  )
}

