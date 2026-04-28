import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'

import { RSVPStats } from '@/components/dashboard/RSVPStats'
import { GuestTable, type GuestRow } from '@/components/dashboard/GuestTable'
import { ExportButton } from '@/components/dashboard/ExportButton'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card } from '@/components/ui/Card'

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
    select: { id: true, name: true, slug: true },
  })
  if (!event) notFound()

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
            <ExportButton slug={event.slug} />
          </div>

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
        </div>
      </main>
    </div>
  )
}

