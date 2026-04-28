'use client'

import * as React from 'react'

import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type CardType =
  | 'EVENT_DETAILS'
  | 'VENUE'
  | 'ITINERARY'
  | 'CONTACTS'
  | 'RSVP'
  | 'SAVE_TO_CALENDAR'
  | 'WHATSAPP'
  | 'CHATBOT'
  | 'POLLING'
  | 'GUEST_REQUESTS'
  | 'ACCESS_PASS'

type Row = {
  id: CardType
  label: string
  description: string
  enabled: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function SortableRow({
  row,
  onToggle,
  children,
}: {
  row: Row
  onToggle: () => void
  children?: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl border border-md-border bg-md-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-md-border bg-md-surface-elevated text-md-text-muted"
              aria-label="Drag to reorder"
              title="Drag"
            >
              ⋮⋮
            </button>
            <div>
              <div className="text-sm text-md-text-primary">{row.label}</div>
              <div className="mt-1 text-xs text-md-text-muted">{row.description}</div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={[
            'h-10 rounded-full border px-3 text-xs tracking-wide',
            row.enabled ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
          ].join(' ')}
        >
          {row.enabled ? 'On' : 'Off'}
        </button>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}

export function ContentCardsManager({
  slug,
  initialContentConfig,
}: {
  slug: string
  initialContentConfig: unknown
}) {
  const cfg = isRecord(initialContentConfig) ? initialContentConfig : {}
  const initialOrder = Array.isArray(cfg.cardsOrder)
    ? (cfg.cardsOrder.filter((x) => typeof x === 'string') as string[])
    : []

  const all: Array<Omit<Row, 'enabled'>> = [
    { id: 'EVENT_DETAILS', label: 'Event Details', description: 'Show event description and dress code' },
    { id: 'VENUE', label: 'Venue & Directions', description: 'Show venue name, address, and Google Maps link' },
    { id: 'ITINERARY', label: 'Itinerary', description: 'Show the event schedule' },
    { id: 'CONTACTS', label: 'Contacts', description: 'Show coordinator and concierge contacts' },
    { id: 'RSVP', label: 'RSVP', description: 'Enable guest RSVP (native or external)' },
    { id: 'SAVE_TO_CALENDAR', label: 'Save to Calendar', description: 'Show .ics download button' },
    { id: 'WHATSAPP', label: 'WhatsApp Concierge', description: 'Show direct WhatsApp button' },
    { id: 'CHATBOT', label: 'Chatbot', description: 'Embed your chatbot' },
    { id: 'POLLING', label: 'Live Polling', description: 'Embed your polling app' },
    { id: 'GUEST_REQUESTS', label: 'Guest Requests', description: 'Enable guest request form' },
    { id: 'ACCESS_PASS', label: 'Access Pass', description: 'Show QR access pass card' },
  ]

  function defaultEnabled(id: CardType): boolean {
    const enabled = cfg.enabledCards
    if (Array.isArray(enabled)) return enabled.includes(id)
    // fallback: infer from existing booleans in contentConfig (older slices)
    if (id === 'CHATBOT') return typeof cfg.chatbotUrl === 'string' && cfg.chatbotUrl.length > 0
    if (id === 'POLLING') return typeof cfg.pollingUrl === 'string' && cfg.pollingUrl.length > 0
    if (id === 'GUEST_REQUESTS') return cfg.requestFormEnabled === true
    return true
  }

  const computedOrder = (initialOrder.length ? initialOrder : all.map((a) => a.id)).filter((x) =>
    all.some((a) => a.id === x),
  ) as CardType[]

  const [order, setOrder] = React.useState<CardType[]>(computedOrder)
  const [enabled, setEnabled] = React.useState<Record<CardType, boolean>>(() => {
    const out = {} as Record<CardType, boolean>
    for (const a of all) out[a.id] = defaultEnabled(a.id)
    return out
  })

  const [chatbotUrl, setChatbotUrl] = React.useState(typeof cfg.chatbotUrl === 'string' ? cfg.chatbotUrl : '')
  const [chatbotTitle, setChatbotTitle] = React.useState(typeof cfg.chatbotTitle === 'string' ? cfg.chatbotTitle : 'Concierge')
  const [pollingUrl, setPollingUrl] = React.useState(typeof cfg.pollingUrl === 'string' ? cfg.pollingUrl : '')
  const [pollingTitle, setPollingTitle] = React.useState(typeof cfg.pollingTitle === 'string' ? cfg.pollingTitle : 'Live Polling')
  const [rsvpMode, setRsvpMode] = React.useState<'native' | 'tally'>(cfg.rsvpMode === 'tally' ? 'tally' : 'native')
  const [tallyUrl, setTallyUrl] = React.useState(typeof cfg.tallyUrl === 'string' ? cfg.tallyUrl : '')
  const [whatsappNumber, setWhatsappNumber] = React.useState(typeof cfg.whatsappNumber === 'string' ? cfg.whatsappNumber : '')
  const [whatsappTemplate, setWhatsappTemplate] = React.useState(
    typeof cfg.whatsappTemplate === 'string' ? cfg.whatsappTemplate : 'Hello {guestName}, this is Maison Doclar regarding {eventName}.',
  )

  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  const rows: Row[] = order.map((id) => {
    const meta = all.find((a) => a.id === id)!
    return { ...meta, enabled: enabled[id] }
  })

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = order.indexOf(active.id as CardType)
    const newIndex = order.indexOf(over.id as CardType)
    if (oldIndex === -1 || newIndex === -1) return
    setOrder((items) => arrayMove(items, oldIndex, newIndex))
  }

  async function save() {
    setError(null)
    setDone(false)
    setSaving(true)
    try {
      const enabledCards = order.filter((id) => enabled[id])
      const nextConfig: Record<string, unknown> = {
        enabledCards,
        cardsOrder: order,
        requestFormEnabled: enabled.GUEST_REQUESTS,
        chatbotUrl: enabled.CHATBOT ? chatbotUrl : '',
        chatbotTitle,
        pollingUrl: enabled.POLLING ? pollingUrl : '',
        pollingTitle,
        rsvpMode,
        tallyUrl: rsvpMode === 'tally' ? tallyUrl : '',
        whatsappNumber,
        whatsappTemplate,
      }
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentConfig: nextConfig, whatsappNumber }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? 'Unable to save content config.')
        return
      }
      setDone(true)
      window.setTimeout(() => setDone(false), 1500)
    } catch {
      setError('Unable to save content config.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {rows.map((r) => (
              <SortableRow
                key={r.id}
                row={r}
                onToggle={() => setEnabled((e) => ({ ...e, [r.id]: !e[r.id] }))}
              >
                {r.id === 'CHATBOT' && r.enabled ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input label="Chatbot URL" value={chatbotUrl} onChange={(e) => setChatbotUrl(e.target.value)} />
                    <Input label="Card title" value={chatbotTitle} onChange={(e) => setChatbotTitle(e.target.value)} />
                  </div>
                ) : null}
                {r.id === 'POLLING' && r.enabled ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input label="Polling URL" value={pollingUrl} onChange={(e) => setPollingUrl(e.target.value)} />
                    <Input label="Card title" value={pollingTitle} onChange={(e) => setPollingTitle(e.target.value)} />
                  </div>
                ) : null}
                {r.id === 'RSVP' && r.enabled ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {(['native', 'tally'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setRsvpMode(m)}
                          className={[
                            'h-10 rounded-full border px-3 text-xs tracking-wide',
                            rsvpMode === m ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
                          ].join(' ')}
                        >
                          {m === 'native' ? 'Native form' : 'External Tally link'}
                        </button>
                      ))}
                    </div>
                    {rsvpMode === 'tally' ? <Input label="Tally URL" value={tallyUrl} onChange={(e) => setTallyUrl(e.target.value)} /> : null}
                  </div>
                ) : null}
                {r.id === 'WHATSAPP' && r.enabled ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input label="WhatsApp number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
                    <Input
                      label="Message template"
                      value={whatsappTemplate}
                      onChange={(e) => setWhatsappTemplate(e.target.value)}
                    />
                  </div>
                ) : null}
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {error ? <div className="text-sm text-md-error">{error}</div> : null}
      {done ? <div className="text-sm text-md-success">Saved.</div> : null}
      <Button type="button" variant="primary" loading={saving} onClick={() => void save()}>
        Save content cards
      </Button>
    </div>
  )
}

