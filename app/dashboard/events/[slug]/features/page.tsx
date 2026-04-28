import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { FeaturesPanel } from '@/components/dashboard/FeaturesPanel'

export default async function FeaturesPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, featureFlags: true, postEventConfig: true },
  })
  if (!event) notFound()

  return (
    <div>
      <DashboardHeader eventName={event.name} />
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Features</div>
            <div className="mt-2 font-[family-name:var(--md-font-heading)] text-4xl font-light">{event.name}</div>
          </div>
          <Card title="Feature flags" className="p-0">
            <div className="p-6">
              <FeaturesPanel
                slug={event.slug}
                initialFeatureFlags={event.featureFlags}
                initialPostEventConfig={event.postEventConfig}
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

