import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { HostUsersManager } from '@/components/dashboard/HostUsersManager'

export default async function HostsPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const event = await prisma.event.findUnique({ where: { slug }, select: { slug: true, name: true } })
  if (!event) notFound()

  return (
    <div>
      <DashboardHeader eventName={event.name} />
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Hosts</div>
            <div className="mt-2 font-[family-name:var(--md-font-heading)] text-4xl font-light">{event.name}</div>
          </div>
          <Card title="Host users" className="p-0">
            <div className="p-6">
              <HostUsersManager slug={event.slug} />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

