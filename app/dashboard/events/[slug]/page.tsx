import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'

import { RSVPStats } from '@/components/dashboard/RSVPStats'
import { GuestTable, type GuestRow } from '@/components/dashboard/GuestTable'
import { ExportButton } from '@/components/dashboard/ExportButton'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { CheckInStats } from '@/components/qr/CheckInStats'
import { Button } from '@/components/ui/Button'
import { RequestsTable } from '@/components/dashboard/RequestsTable'
import { RemindersManager } from '@/components/dashboard/RemindersManager'
import { HostAccessCard } from '@/components/dashboard/HostAccessCard'
import { CommunicationLogTable } from '@/components/dashboard/CommunicationLogTable'
import { EventStatusControl } from '@/components/dashboard/EventStatusControl'

type RSVPStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

function countByStatus(statuses: RSVPStatus[]): { accepted: number; declined: number; pending: number } {
  let accepted = 0
  let declined = 0
  let pending = 0
  for (const s of statuses) {
    if (s === 'ACCEPTED') accepted += 1
    else if (s === 'DECLINED') declined += 1
    else pending += 1
  }
  return { accepted, declined, pending }
}

export default async function DashboardEventPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, featureFlags: true, status: true },
  })
  if (!event) notFound()

  const flags =
    event.featureFlags && typeof event.featureFlags === 'object' && !Array.isArray(event.featureFlags)
      ? (event.featureFlags as Record<string, unknown>)
      : {}

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      rsvpStatus: true,
      tags: true,
      tableNumber: true,
      createdAt: true,
    },
  })

  const rows: GuestRow[] = guests.map((g) => ({
    id: g.id,
    name: g.name,
    email: g.email,
    rsvpStatus: g.rsvpStatus,
    tags: g.tags,
    tableNumber: g.tableNumber,
    createdAtISO: g.createdAt.toISOString(),
  }))

  const totals = countByStatus(guests.map((g) => g.rsvpStatus))

  const arrived = await prisma.checkInLog.count({ where: { eventId: event.id } })
  const declined = guests.filter((g) => g.rsvpStatus === 'DECLINED').length
  const notArrived = Math.max(guests.length - arrived - declined, 0)
  const checkInStats = { total: guests.length, arrived, notArrived, declined }

  return (
    <div>
      <DashboardHeader eventName={event.name} />
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Event</div>
              <div className="mt-2 font-[family-name:var(--md-font-heading)] text-4xl font-light">{event.name}</div>
            </div>
            <div className="flex items-center gap-3">
              <a href={`/checkin/${event.slug}`}>
                <Button type="button" variant="primary">
                  Open Check-in Scanner
                </Button>
              </a>
              <ExportButton slug={event.slug} />
            {flags.dietaryExportEnabled === true ? (
              <a
                href={`/api/dashboard/events/${event.slug}/exports/dietary`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary hover:bg-md-surface-elevated"
              >
                Dietary CSV
              </a>
            ) : null}
            {flags.accessibilityExportEnabled === true ? (
              <a
                href={`/api/dashboard/events/${event.slug}/exports/accessibility`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary hover:bg-md-surface-elevated"
              >
                Accessibility CSV
              </a>
            ) : null}
            </div>
          </div>

          <CheckInStats stats={checkInStats} />

          <EventStatusControl slug={event.slug} initialStatus={event.status as any} />

          <RSVPStats
            total={guests.length}
            accepted={totals.accepted}
            declined={totals.declined}
            pending={totals.pending}
          />

          <Card title="Guests" className="p-0">
            <div className="p-6">
              <GuestTable guests={rows} />
            </div>
          </Card>

          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Guest Requests</div>
            <div className="mt-4">
              <RequestsTable eventSlug={event.slug} />
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Reminders</div>
            <div className="mt-4">
              <RemindersManager eventSlug={event.slug} />
            </div>
          </div>

          <HostAccessCard slug={event.slug} />

          {flags.communicationLogEnabled === true ? (
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Guest Communication</div>
              <div className="mt-4">
                <CommunicationLogTable eventSlug={event.slug} />
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}

