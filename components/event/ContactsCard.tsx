import * as React from 'react'

import { Card } from '@/components/ui/Card'
import { WhatsAppButton } from '@/components/event/WhatsAppButton'

export type Contact = {
  role: string
  name: string
  phone: string
  email?: string
}

export type ContactsCardProps = {
  contacts: Contact[]
  whatsappNumber: string | null
  guestName: string
  eventName: string
}

export function ContactsCard({ contacts, whatsappNumber, guestName, eventName }: ContactsCardProps) {
  const concierge =
    contacts.find((c) => c.role.toLowerCase().includes('concierge')) ??
    contacts.find((c) => c.role.toLowerCase().includes('concier'))

  return (
    <Card title="Contacts">
      <div className="space-y-6">
        <div className="grid gap-4">
          {contacts.map((c, idx) => (
            <div
              key={`${c.role}-${idx}`}
              className="rounded-xl border border-md-border-muted bg-md-surface-elevated p-4"
            >
              <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">{c.role}</div>
              <div className="mt-2 text-sm text-md-text-primary">{c.name}</div>
              <div className="mt-2 flex flex-col gap-1 text-sm text-md-text-muted">
                <a
                  className="underline decoration-md-border-muted underline-offset-4 hover:text-md-text-primary"
                  href={`tel:${c.phone}`}
                >
                  {c.phone}
                </a>
                {c.email ? (
                  <a
                    className="underline decoration-md-border-muted underline-offset-4 hover:text-md-text-primary"
                    href={`mailto:${c.email}`}
                  >
                    {c.email}
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {whatsappNumber && concierge ? (
          <div className="flex items-center justify-start">
            <WhatsAppButton whatsappNumber={whatsappNumber} guestName={guestName} eventName={eventName} />
          </div>
        ) : null}
      </div>
    </Card>
  )
}

