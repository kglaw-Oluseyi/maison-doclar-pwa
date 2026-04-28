import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { GuestsManager } from '@/components/dashboard/GuestsManager'

export default async function GuestsPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      accessCards: { select: { id: true, releasedAt: true, invalidatedAt: true } },
    },
  })
  if (!event) notFound()

  const unreleasedCount = event.accessCards.filter((c) => c.releasedAt === null && c.invalidatedAt === null).length

  return (
    <div>
      <DashboardHeader eventName={event.name} />
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Guests</div>
              <div className="mt-2 font-[family-name:var(--md-font-heading)] text-4xl font-light">{event.name}</div>
            </div>
          </div>

          <Card title="Guest list" className="p-0">
            <div className="p-6">
              <GuestsManager eventId={event.id} slug={event.slug} unreleasedCount={unreleasedCount} />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

