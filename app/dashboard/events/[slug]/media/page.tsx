import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { MediaLibrary } from '@/components/dashboard/MediaLibrary'

export default async function MediaPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const event = await prisma.event.findUnique({ where: { slug }, select: { slug: true, name: true } })
  if (!event) notFound()

  return (
    <div>
      <DashboardHeader eventName={event.name} />
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Media Library</div>
            <div className="mt-2 font-[family-name:var(--md-font-heading)] text-4xl font-light">{event.name}</div>
          </div>
          <div className="rounded-2xl border border-md-border bg-md-surface p-4 text-sm text-md-warning">
            Media uploads are stored on the local filesystem. Configure cloud storage before deploying to production.
          </div>
          <Card title="Media" className="p-0">
            <div className="p-6">
              <MediaLibrary slug={event.slug} />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

