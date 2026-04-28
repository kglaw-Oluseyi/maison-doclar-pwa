import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export type VenueCardProps = {
  location: string
  address: string
  coordinates: string | null
}

function googleMapsDirectionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

export function VenueCard({ location, address, coordinates }: VenueCardProps) {
  const destination = coordinates && coordinates.trim().length > 0 ? coordinates : address
  const href = googleMapsDirectionsUrl(destination)

  return (
    <Card title="Venue">
      <div className="space-y-4">
        <div>
          <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light">{location}</div>
          <div className="mt-2 text-sm text-md-text-muted">{address}</div>
        </div>
        <div>
          <Button type="button" variant="secondary" onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}>
            Get directions
          </Button>
        </div>
      </div>
    </Card>
  )
}

