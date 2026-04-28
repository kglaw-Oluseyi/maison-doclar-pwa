import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { EventSettingsEditor } from '@/components/dashboard/EventSettingsEditor'

export default async function EventSettingsPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      status: true,
      timezone: true,
      date: true,
      endDate: true,
      location: true,
      address: true,
      coordinates: true,
      dressCode: true,
      description: true,
      rsvpOpen: true,
      whatsappNumber: true,
      whatsappTemplate: true,
    },
  })
  if (!event) notFound()

  return (
    <div>
      <DashboardHeader eventName={event.name} />
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Settings</div>
            <div className="mt-2 font-[family-name:var(--md-font-heading)] text-4xl font-light">{event.name}</div>
          </div>
          <Card title="General settings" className="p-0">
            <div className="p-6">
              <EventSettingsEditor
                slug={event.slug}
                initial={{
                  name: event.name,
                  status: event.status,
                  timezone: event.timezone,
                  dateISO: event.date.toISOString(),
                  endDateISO: event.endDate?.toISOString() ?? '',
                  location: event.location,
                  address: event.address,
                  coordinates: event.coordinates ?? '',
                  dressCode: event.dressCode ?? '',
                  description: event.description ?? '',
                  rsvpOpen: event.rsvpOpen,
                  whatsappNumber: event.whatsappNumber,
                  whatsappTemplate: event.whatsappTemplate,
                }}
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

