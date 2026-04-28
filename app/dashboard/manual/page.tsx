import fs from 'node:fs/promises'
import path from 'node:path'

import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { OperatorManual } from '@/components/dashboard/OperatorManual'

const DOCS = [
  { id: '01-overview', title: 'Overview' },
  { id: '02-event-lifecycle', title: 'Event lifecycle' },
  { id: '03-content-cards', title: 'Content cards' },
  { id: '04-guest-management', title: 'Guest management' },
  { id: '05-check-in', title: 'Check-in operations' },
  { id: '06-concierge', title: 'Concierge & requests' },
  { id: '07-host-command-center', title: 'Host command center' },
  { id: '08-api-integration', title: 'API integration' },
  { id: '09-pwa-deployment', title: 'PWA deployment' },
  { id: '10-media-library', title: 'Media library' },
  { id: '11-security', title: 'Security & privacy' },
  { id: '12-troubleshooting', title: 'Troubleshooting' },
] as const

export default async function ManualPage() {
  const base = path.join(process.cwd(), 'docs', 'operator-manual')
  const entries = await Promise.all(
    DOCS.map(async (d) => {
      const file = path.join(base, `${d.id}.md`)
      const source = await fs.readFile(file, 'utf8')
      return { ...d, source }
    }),
  )

  return (
    <div>
      <DashboardHeader eventName="Operator Manual" />
      <main className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Docs</div>
            <div className="mt-2 font-[family-name:var(--md-font-heading)] text-4xl font-light">Operator Manual</div>
          </div>
          <Card title="Manual" className="p-0">
            <div className="p-6">
              <OperatorManual docs={entries as any} />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

