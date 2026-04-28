'use client'

import * as React from 'react'

import { HostHeader } from '@/components/host/HostHeader'
import { EventSummaryCard } from '@/components/host/EventSummaryCard'
import { HostStatsBar } from '@/components/host/HostStatsBar'
import { HostArrivalFeed } from '@/components/host/HostArrivalFeed'
import { AwaitingResponseList } from '@/components/host/AwaitingResponseList'
import { DietaryAccessibilitySummary } from '@/components/host/DietaryAccessibilitySummary'
import { OutstandingRequestsBadge } from '@/components/host/OutstandingRequestsBadge'
import { PostEventSummary } from '@/components/host/PostEventSummary'
import { HostProvider } from '@/components/host/HostContext'

export function HostDashboardPreview({
  slug,
  eventName,
  timezone,
  viewConfig,
}: {
  slug: string
  eventName: string
  timezone: string
  viewConfig: Record<string, boolean>
}) {
  const guestsMock = React.useMemo(
    () => [
      { id: 'g1', name: 'Sofia Beaumont', email: 'sofia@example.com', rsvpStatus: 'ACCEPTED', rsvpDetails: {}, tableNumber: 'A1', tags: ['VIP'], dietaryNotes: null, specialNotes: 'Wheelchair access', createdAt: new Date().toISOString(), checkIn: null, guestRequests: [{ status: 'PENDING', type: 'DIETARY' }] },
      { id: 'g2', name: 'Noah Lambert', email: 'noah@example.com', rsvpStatus: 'PENDING', rsvpDetails: {}, tableNumber: 'B3', tags: [], dietaryNotes: 'No shellfish', specialNotes: null, createdAt: new Date().toISOString(), checkIn: null, guestRequests: [] },
    ],
    [],
  )

  const arrivalsMock = React.useMemo(
    () => [
      { guestName: 'Sofia Beaumont', scannedAt: new Date().toISOString(), method: 'QR_SCAN' as const, tableNumber: 'A1', tags: ['VIP'] },
      { guestName: 'Noah Lambert', scannedAt: new Date().toISOString(), method: 'MANUAL' as const, tableNumber: 'B3', tags: [] },
    ],
    [],
  )

  const statsProps = {
    totalInvited: 120,
    totalResponded: 85,
    totalNotResponded: 35,
    totalAccepted: 70,
    arrived: 42,
    notArrived: 28,
    totalDeclined: 15,
  }

  const pendingGuests = [{ id: 'p1', name: 'Noah Lambert', createdAt: new Date().toISOString() }]

  return (
    <div className="rounded-3xl border border-md-border bg-md-background p-4">
      <HostProvider value={{ slug, eventName, hostName: 'Preview Host' }}>
        <div className="space-y-4">
          <HostHeader />
          <EventSummaryCard eventName={eventName} eventDate={new Date()} timezone={timezone} venue="Preview Venue" daysUntilEvent={5} eventMode="pre-event" />
          {viewConfig.showStatsBar ? <HostStatsBar {...statsProps} /> : null}
          {viewConfig.showOutstandingRequests ? <OutstandingRequestsBadge pendingRequests={3} /> : null}
          {viewConfig.showDietaryAccessibilitySummary ? <DietaryAccessibilitySummary guests={guestsMock as any} /> : null}
          {viewConfig.showArrivalFeed ? (
            <HostArrivalFeed slug={slug} initialArrivals={arrivalsMock} showVipAlerts={!!viewConfig.showVipAlerts} disableAutoRefresh />
          ) : null}
          {viewConfig.showAwaitingResponseList ? <AwaitingResponseList guests={pendingGuests} /> : null}
          {viewConfig.showPostEventSummary ? <PostEventSummary stats={{ arrived: 42, totalAccepted: 70 }} noShows={[]} slug={slug} /> : null}
          <div className="rounded-2xl border border-md-border bg-md-surface p-4 text-xs text-md-text-muted">
            Preview uses mock data and does not fetch live host APIs.
          </div>
        </div>
      </HostProvider>
    </div>
  )
}

