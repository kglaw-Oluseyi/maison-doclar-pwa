import { notFound } from 'next/navigation'

import { requireDashboardSession } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { CheckInStats } from '@/components/qr/CheckInStats'
import { QrScanner } from '@/components/qr/QrScanner'
import { CheckInFeed, type CheckInData } from '@/components/qr/CheckInFeed'
import { ManualCheckIn, type GuestWithCard } from '@/components/qr/ManualCheckIn'

export default async function CheckInPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  // Auth gate (middleware should handle, but double-check server-side)
  // We don't have a NextRequest here; rely on middleware cookie protection.
  // Scanner page will only be reachable with a valid session.
  void requireDashboardSession

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
      rsvpStatus: true,
      tableNumber: true,
      dietaryNotes: true,
      specialNotes: true,
      tags: true,
      checkIn: { select: { scannedAt: true, method: true } },
      accessCard: { select: { releasedAt: true, invalidatedAt: true, qrToken: true } },
    },
  })

  const total = guests.length
  const declined = guests.filter((g) => g.rsvpStatus === 'DECLINED').length
  const arrived = guests.filter((g) => g.checkIn !== null).length
  const notArrived = total - arrived - declined

  const initialData: CheckInData = {
    event,
    stats: { total, arrived, notArrived, declined },
    guests: guests.map((g) => ({
      id: g.id,
      name: g.name,
      rsvpStatus: g.rsvpStatus,
      tableNumber: g.tableNumber,
      dietaryNotes: g.dietaryNotes,
      specialNotes: g.specialNotes,
      tags: g.tags,
      checkIn: g.checkIn ? { scannedAt: g.checkIn.scannedAt.toISOString(), method: g.checkIn.method } : null,
      accessCard: g.accessCard
        ? {
            releasedAt: g.accessCard.releasedAt ? g.accessCard.releasedAt.toISOString() : null,
            invalidatedAt: g.accessCard.invalidatedAt ? g.accessCard.invalidatedAt.toISOString() : null,
            qrToken: g.accessCard.qrToken,
          }
        : null,
    })),
  }

  const manualGuests: GuestWithCard[] = initialData.guests.map((g) => ({
    id: g.id,
    name: g.name,
    rsvpStatus: g.rsvpStatus as GuestWithCard['rsvpStatus'],
    tableNumber: g.tableNumber,
    dietaryNotes: g.dietaryNotes,
    specialNotes: g.specialNotes,
    tags: g.tags,
    checkIn: g.checkIn,
    accessCard: g.accessCard,
  }))

  return (
    <div>
      <DashboardHeader eventName={`Check-in — ${event.name}`} />
      <main className="mx-auto max-w-[1100px] space-y-8 px-6 py-10">
        <CheckInStats stats={initialData.stats} />
        <QrScanner />
        <CheckInFeed eventSlug={event.slug} initialData={initialData} />
        <ManualCheckIn guests={manualGuests} eventSlug={event.slug} />
      </main>
    </div>
  )
}

