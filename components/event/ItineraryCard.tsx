import * as React from 'react'

import { Card } from '@/components/ui/Card'

export type ItineraryBlock = {
  time: string
  title: string
  detail?: string
}

export type ItineraryCardProps = {
  items: ItineraryBlock[]
}

export function ItineraryCard({ items }: ItineraryCardProps) {
  return (
    <Card title="Itinerary">
      <ol className="space-y-5">
        {items.map((item, idx) => (
          <li
            key={`${item.time}-${idx}`}
            className="relative grid grid-cols-[80px_1fr] gap-5 last:[&>div[data-line]]:hidden"
          >
            <div className="pr-2 text-right text-sm text-md-accent [font-variant-numeric:tabular-nums]">
              {item.time}
            </div>
            <div className="space-y-1">
              <div className="text-sm text-md-text-primary">{item.title}</div>
              {item.detail ? <div className="text-sm text-md-text-muted">{item.detail}</div> : null}
            </div>
            <div data-line className="pointer-events-none absolute left-[79px] top-0 h-full w-px bg-md-border" />
          </li>
        ))}
      </ol>
    </Card>
  )
}

