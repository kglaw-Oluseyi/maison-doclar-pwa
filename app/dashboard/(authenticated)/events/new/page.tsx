import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { EventCreationWizard } from '@/components/dashboard/EventCreationWizard'

export default function NewEventWizardPage() {
  return (
    <div>
      <DashboardHeader />
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Create new event</div>
            <div className="mt-2 font-[family-name:var(--md-font-heading)] text-4xl font-light">Event wizard</div>
          </div>
          <Card title="Setup" className="p-0">
            <div className="p-6">
              <EventCreationWizard />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

