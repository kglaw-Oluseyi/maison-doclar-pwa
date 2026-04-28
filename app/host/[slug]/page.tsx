import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { prisma } from '@/lib/prisma'
import { verifyHostSessionToken } from '@/lib/host-auth'

import { HostProvider } from '@/components/host/HostContext'
import { HostHeader } from '@/components/host/HostHeader'
import { HostStatsBar } from '@/components/host/HostStatsBar'
import { HostArrivalFeed } from '@/components/host/HostArrivalFeed'
import { HostGuestList } from '@/components/host/HostGuestList'
import { EventSummaryCard } from '@/components/host/EventSummaryCard'
import { OutstandingRequestsBadge } from '@/components/host/OutstandingRequestsBadge'
import { DietaryAccessibilitySummary } from '@/components/host/DietaryAccessibilitySummary'
import { AwaitingResponseList } from '@/components/host/AwaitingResponseList'
import { PostEventSummary } from '@/components/host/PostEventSummary'

export default async function HostDashboardPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const session = (await cookies()).get('md-host-session')?.value
  if (!session) redirect(`/host/${slug}/login`)

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      date: true,
      endDate: true,
      location: true,
      hostUsers: { select: { name: true, role: true, viewConfig: true }, take: 1, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!event) redirect(`/host/${slug}/login`)

  const ok = await verifyHostSessionToken(session, event.id)
  if (!ok) redirect(`/host/${slug}/login`)

  const DEFAULT_VIEW_CONFIG = {
    showStatsBar: true,
    showArrivalFeed: true,
    showGuestList: true,
    showDietaryAccessibilitySummary: true,
    showOutstandingRequests: true,
    showAwaitingResponseList: true,
    showExportButton: true,
    showRsvpDetails: true,
    showVipAlerts: true,
    showPostEventSummary: true,
    eventDayModeAutoSwitch: true,
  } as const

  const viewConfigRaw =
    event.hostUsers[0]?.viewConfig && typeof event.hostUsers[0].viewConfig === 'object' && !Array.isArray(event.hostUsers[0].viewConfig)
      ? (event.hostUsers[0].viewConfig as Record<string, unknown>)
      : {}
  const viewConfig = { ...DEFAULT_VIEW_CONFIG, ...viewConfigRaw } as typeof DEFAULT_VIEW_CONFIG

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      rsvpStatus: true,
      rsvpDetails: true,
      tableNumber: true,
      tags: true,
      dietaryNotes: true,
      specialNotes: true,
      createdAt: true,
      checkIn: { select: { scannedAt: true, method: true } },
      guestRequests: { select: { status: true, type: true } },
    },
  })

  const totalInvited = guests.length
  const totalAccepted = guests.filter((g) => g.rsvpStatus === 'ACCEPTED').length
  const totalDeclined = guests.filter((g) => g.rsvpStatus === 'DECLINED').length
  const totalPending = guests.filter((g) => g.rsvpStatus === 'PENDING').length
  const totalResponded = totalAccepted + totalDeclined
  const totalNotResponded = totalPending
  const arrived = guests.filter((g) => g.checkIn !== null).length
  const notArrived = guests.filter((g) => g.rsvpStatus === 'ACCEPTED' && g.checkIn === null).length

  const totalRequests = await prisma.guestRequest.count({ where: { eventId: event.id } })
  const pendingRequests = await prisma.guestRequest.count({ where: { eventId: event.id, status: 'PENDING' } })

  const now = new Date()
  const end = event.endDate ?? event.date
  const preEventWindowStart = new Date(event.date.getTime() - 24 * 60 * 60 * 1000)
  const postEventWindowEnd = new Date(end.getTime() + 6 * 60 * 60 * 1000)
  const eventMode: 'pre-event' | 'event-day' | 'post-event' =
    now < preEventWindowStart ? 'pre-event' : now <= postEventWindowEnd ? 'event-day' : 'post-event'
  const daysUntilEvent = Math.ceil((event.date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

  const pendingGuests = guests
    .filter((g) => g.rsvpStatus === 'PENDING')
    .map((g) => ({ id: g.id, name: g.name, createdAt: g.createdAt.toISOString() }))

  const noShows = guests
    .filter((g) => g.rsvpStatus === 'ACCEPTED' && g.checkIn === null)
    .map((g) => ({ id: g.id, name: g.name, tableNumber: g.tableNumber }))

  const arrivals = await prisma.checkInLog.findMany({
    where: { eventId: event.id },
    orderBy: { scannedAt: 'desc' },
    take: 20,
    select: {
      scannedAt: true,
      method: true,
      guest: { select: { name: true, tableNumber: true, tags: true } },
    },
  })

  return (
    <HostProvider value={{ slug, eventName: event.name, hostName: event.hostUsers[0]?.name ?? 'Host' }}>
      <main className="space-y-6">
        <HostHeader />

        <EventSummaryCard
          eventName={event.name}
          eventDate={event.date}
          venue={event.location}
          daysUntilEvent={daysUntilEvent}
          eventMode={eventMode}
        />

        {viewConfig.showStatsBar ? (
          <HostStatsBar
            totalInvited={totalInvited}
            totalResponded={totalResponded}
            totalNotResponded={totalNotResponded}
            totalAccepted={totalAccepted}
            arrived={arrived}
            notArrived={notArrived}
            totalDeclined={totalDeclined}
          />
        ) : null}

        {viewConfig.showOutstandingRequests && pendingRequests > 0 ? (
          <OutstandingRequestsBadge pendingRequests={pendingRequests} />
        ) : null}

        {viewConfig.showDietaryAccessibilitySummary ? <DietaryAccessibilitySummary guests={guests} /> : null}

        {viewConfig.showArrivalFeed ? (
          <HostArrivalFeed
            slug={slug}
            initialArrivals={arrivals.map((a) => ({
              guestName: a.guest.name,
              scannedAt: a.scannedAt.toISOString(),
              method: a.method,
              tableNumber: a.guest.tableNumber,
              tags: a.guest.tags,
            }))}
            showVipAlerts={viewConfig.showVipAlerts}
          />
        ) : null}

        {viewConfig.showAwaitingResponseList ? <AwaitingResponseList guests={pendingGuests} /> : null}

        {viewConfig.showGuestList ? (
          <HostGuestList
            guests={guests.map((g) => ({
              ...g,
              createdAt: g.createdAt.toISOString(),
              checkIn: g.checkIn ? { scannedAt: g.checkIn.scannedAt.toISOString(), method: g.checkIn.method } : null,
            }))}
            slug={slug}
            showRsvpDetails={viewConfig.showRsvpDetails}
            showExportButton={viewConfig.showExportButton}
          />
        ) : null}

        {viewConfig.showPostEventSummary && eventMode === 'post-event' ? (
          <PostEventSummary stats={{ arrived, totalAccepted }} noShows={noShows} slug={slug} />
        ) : null}
      </main>
    </HostProvider>
  )
}

