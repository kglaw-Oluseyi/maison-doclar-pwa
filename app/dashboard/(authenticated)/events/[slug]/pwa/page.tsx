import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { PwaDeploymentPanel } from '@/components/dashboard/PwaDeploymentPanel'

export default async function PwaPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      pwaConfig: { select: { installHeadline: true, installBody: true } },
    },
  })
  if (!event) notFound()

  return (
    <div>
      <DashboardHeader eventName={event.name} />
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">PWA</div>
            <div className="mt-2 font-[family-name:var(--md-font-heading)] text-4xl font-light">{event.name}</div>
          </div>
          <Card title="Deployment" className="p-0">
            <div className="p-6">
              <PwaDeploymentPanel
                slug={event.slug}
                eventId={event.id}
                status={event.status as any}
                installHeadline={event.pwaConfig?.installHeadline ?? 'Save to your home screen'}
                installBody={event.pwaConfig?.installBody ?? 'Access your event guide instantly, even offline.'}
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

