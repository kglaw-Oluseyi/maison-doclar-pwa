'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type WizardStep = 1 | 2 | 3 | 4 | 5

type CardKey =
  | 'eventDetails'
  | 'venue'
  | 'itinerary'
  | 'contacts'
  | 'rsvp'
  | 'saveToCalendar'
  | 'whatsapp'
  | 'chatbot'
  | 'polling'
  | 'guestRequests'
  | 'accessPass'

type WizardState = {
  step: WizardStep
  basics: {
    name: string
    slug: string
    dateISO: string
    endDateISO: string
    timezone: string
    location: string
    address: string
    coordinates: string
  }
  design: {
    background: string
    surface: string
    textPrimary: string
    textMuted: string
    accent: string
    border: string
    headingFont: string
    bodyFont: string
  }
  content: Record<CardKey, boolean> & {
    chatbotUrl: string
    chatbotTitle: string
    pollingUrl: string
    pollingTitle: string
    rsvpMode: 'native' | 'tally'
    tallyUrl: string
    whatsappNumber: string
    whatsappTemplate: string
  }
  features: {
    walletPassEnabled: boolean
    postEventEnabled: boolean
    communicationLogEnabled: boolean
    guestGroupsEnabled: boolean
    invitationTrackingEnabled: boolean
    dietaryExportEnabled: boolean
    accessibilityExportEnabled: boolean
    feedbackFormEnabled: boolean
  }
}

const STORAGE_KEY = 'md-event-wizard-v1'

const TIMEZONES = [
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Brussels',
  'Europe/Zurich',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Copenhagen',
  'Europe/Dublin',
  'Europe/Lisbon',
  'Europe/Vienna',
  'Europe/Prague',
  'Europe/Warsaw',
  'Europe/Athens',
  'Europe/Helsinki',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'America/Mexico_City',
] as const

const HEADING_FONTS = [
  'Cormorant Garamond',
  'Playfair Display',
  'DM Serif Display',
  'Libre Baskerville',
  'Lora',
  'EB Garamond',
  'Fraunces',
  'Bodoni Moda',
] as const

const BODY_FONTS = ['Inter', 'DM Sans', 'Nunito', 'Outfit', 'Plus Jakarta Sans', 'Figtree', 'Onest', 'Syne'] as const

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '')
    .slice(0, 64)
}

function defaultState(): WizardState {
  return {
    step: 1,
    basics: {
      name: '',
      slug: '',
      dateISO: '',
      endDateISO: '',
      timezone: 'Europe/London',
      location: '',
      address: '',
      coordinates: '',
    },
    design: {
      background: '#000000',
      surface: '#0a0a0a',
      textPrimary: '#FFFFF0',
      textMuted: '#888888',
      accent: '#B79F85',
      border: '#1e1e1e',
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Inter',
    },
    content: {
      eventDetails: true,
      venue: true,
      itinerary: true,
      contacts: true,
      rsvp: true,
      saveToCalendar: true,
      whatsapp: false,
      chatbot: false,
      polling: false,
      guestRequests: true,
      accessPass: true,
      chatbotUrl: '',
      chatbotTitle: 'Concierge',
      pollingUrl: '',
      pollingTitle: 'Live Polling',
      rsvpMode: 'native',
      tallyUrl: '',
      whatsappNumber: '',
      whatsappTemplate: 'Hello {guestName}, this is Maison Doclar regarding {eventName}.',
    },
    features: {
      walletPassEnabled: false,
      postEventEnabled: false,
      communicationLogEnabled: false,
      guestGroupsEnabled: false,
      invitationTrackingEnabled: false,
      dietaryExportEnabled: false,
      accessibilityExportEnabled: false,
      feedbackFormEnabled: false,
    },
  }
}

function loadState(): WizardState {
  if (typeof window === 'undefined') return defaultState()
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultState()
  try {
    const parsed = JSON.parse(raw) as WizardState
    return parsed && typeof parsed === 'object' ? { ...defaultState(), ...parsed } : defaultState()
  } catch {
    return defaultState()
  }
}

function saveState(state: WizardState) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={[
        'rounded-full border px-3 py-1.5 text-xs tracking-wide',
        active ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
      ].join(' ')}
    >
      {label}
    </div>
  )
}

export function EventCreationWizard() {
  const [state, setState] = React.useState<WizardState>(() => loadState())
  const [error, setError] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)

  React.useEffect(() => {
    saveState(state)
  }, [state])

  function next() {
    setError(null)
    setState((s) => ({ ...s, step: Math.min(5, s.step + 1) as WizardStep }))
  }
  function back() {
    setError(null)
    setState((s) => ({ ...s, step: Math.max(1, s.step - 1) as WizardStep }))
  }

  function validateStep(step: WizardStep): string | null {
    if (step === 1) {
      if (!state.basics.name.trim()) return 'Event name is required.'
      const slug = state.basics.slug.trim() || slugify(state.basics.name)
      if (!slug) return 'Slug is required.'
      if (!state.basics.dateISO) return 'Event date/time is required.'
      if (!state.basics.timezone) return 'Timezone is required.'
      if (!state.basics.location.trim()) return 'Location name is required.'
      if (!state.basics.address.trim()) return 'Full address is required.'
    }
    if (step === 2) {
      const hex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v)
      if (![state.design.background, state.design.surface, state.design.textPrimary, state.design.textMuted, state.design.accent, state.design.border].every(hex)) {
        return 'Design colours must be valid hex codes.'
      }
    }
    return null
  }

  async function createEvent() {
    setError(null)
    const stepErr = validateStep(1) || validateStep(2)
    if (stepErr) return setError(stepErr)
    setCreating(true)
    try {
      const slug = state.basics.slug.trim() || slugify(state.basics.name)
      const designConfig = {
        tokens: {
          '--md-background': state.design.background,
          '--md-surface': state.design.surface,
          '--md-surface-elevated': '#111111',
          '--md-text-primary': state.design.textPrimary,
          '--md-text-muted': state.design.textMuted,
          '--md-text-subtle': '#444444',
          '--md-accent': state.design.accent,
          '--md-border': state.design.border,
          '--md-border-muted': '#2a2a2a',
          '--md-error': '#E05252',
          '--md-success': '#52A080',
          '--md-warning': '#C4933F',
          '--md-font-heading': `'${state.design.headingFont}', Georgia, serif`,
          '--md-font-body': `'${state.design.bodyFont}', system-ui, sans-serif`,
        },
      }

      const contentConfig: Record<string, unknown> = {
        requestFormEnabled: state.content.guestRequests,
        requestFormTypes: ['DIETARY', 'TRANSPORT', 'ACCESSIBILITY', 'PLUS_ONE', 'GENERAL'],
        chatbotUrl: state.content.chatbot ? state.content.chatbotUrl : undefined,
        chatbotTitle: state.content.chatbotTitle,
        pollingUrl: state.content.polling ? state.content.pollingUrl : undefined,
        pollingTitle: state.content.pollingTitle,
        rsvpMode: state.content.rsvpMode,
        tallyUrl: state.content.rsvpMode === 'tally' ? state.content.tallyUrl : undefined,
      }

      const featureFlags = { ...state.features }
      const postEventConfig = state.features.postEventEnabled
        ? {
            thankYouMessage: 'Thank you for joining us.',
            thankYouSubtext: '',
            galleryEnabled: false,
            feedbackEnabled: state.features.feedbackFormEnabled,
            feedbackQuestions: state.features.feedbackFormEnabled
              ? [{ id: 'q1', question: 'How was your overall experience?', type: 'rating' }]
              : [],
            followUpLinks: [],
            activatesAt: new Date().toISOString(),
          }
        : {}

      const res = await fetch('/api/dashboard/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.basics.name,
          slug,
          dateISO: new Date(state.basics.dateISO).toISOString(),
          endDateISO: state.basics.endDateISO ? new Date(state.basics.endDateISO).toISOString() : null,
          timezone: state.basics.timezone,
          location: state.basics.location,
          address: state.basics.address,
          coordinates: state.basics.coordinates,
          designConfig,
          contentConfig,
          featureFlags,
          postEventConfig,
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? 'Unable to create event.')
        return
      }
      const data = (await res.json()) as { slug: string }
      window.sessionStorage.removeItem(STORAGE_KEY)
      window.location.href = `/dashboard/events/${data.slug}`
    } catch {
      setError('Unable to create event.')
    } finally {
      setCreating(false)
    }
  }

  const steps: Array<{ step: WizardStep; label: string }> = [
    { step: 1, label: 'Basics' },
    { step: 2, label: 'Design' },
    { step: 3, label: 'Content' },
    { step: 4, label: 'Features' },
    { step: 5, label: 'Confirm' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <StepPill key={s.step} active={state.step === s.step} label={s.label} />
        ))}
      </div>

      {state.step === 1 ? (
        <div className="grid gap-4">
          <Input
            label="Event name"
            value={state.basics.name}
            onChange={(e) => {
              const name = e.target.value
              setState((s) => ({
                ...s,
                basics: { ...s.basics, name, slug: s.basics.slug ? s.basics.slug : slugify(name) },
              }))
            }}
            placeholder="Maison Doclar Gala 2026"
          />

          <Input
            label="Event slug"
            value={state.basics.slug}
            onChange={(e) => setState((s) => ({ ...s, basics: { ...s.basics, slug: slugify(e.target.value) } }))}
            placeholder="maison-doclar-gala-2026"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Event date & time</label>
              <input
                type="datetime-local"
                value={state.basics.dateISO}
                onChange={(e) => setState((s) => ({ ...s, basics: { ...s.basics, dateISO: e.target.value } }))}
                className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-md-text-primary outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent"
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">End date & time (optional)</label>
              <input
                type="datetime-local"
                value={state.basics.endDateISO}
                onChange={(e) => setState((s) => ({ ...s, basics: { ...s.basics, endDateISO: e.target.value } }))}
                className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-md-text-primary outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Timezone</label>
            <select
              value={state.basics.timezone}
              onChange={(e) => setState((s) => ({ ...s, basics: { ...s.basics, timezone: e.target.value } }))}
              className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Location name"
            value={state.basics.location}
            onChange={(e) => setState((s) => ({ ...s, basics: { ...s.basics, location: e.target.value } }))}
            placeholder="Hôtel de Ville — Grand Salon"
          />

          <Input
            label="Full address"
            value={state.basics.address}
            onChange={(e) => setState((s) => ({ ...s, basics: { ...s.basics, address: e.target.value } }))}
            placeholder="Place de l’Hôtel de Ville, 75004 Paris, France"
          />

          <Input
            label="Google Maps coordinates (optional)"
            value={state.basics.coordinates}
            onChange={(e) => setState((s) => ({ ...s, basics: { ...s.basics, coordinates: e.target.value } }))}
            placeholder="48.856614,2.3522219"
          />
        </div>
      ) : null}

      {state.step === 2 ? (
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setState((s) => ({
                  ...s,
                  design: {
                    ...s.design,
                    background: '#000000',
                    surface: '#0a0a0a',
                    textPrimary: '#FFFFF0',
                    textMuted: '#888888',
                    accent: '#B79F85',
                    border: '#1e1e1e',
                    headingFont: 'Cormorant Garamond',
                    bodyFont: 'Inter',
                  },
                }))
              }
            >
              Use Maison Doclar defaults
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ['Background', 'background'],
                ['Surface', 'surface'],
                ['Text Primary', 'textPrimary'],
                ['Text Muted', 'textMuted'],
                ['Accent', 'accent'],
                ['Border', 'border'],
              ] as const
            ).map(([label, key]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-[160px] text-sm text-md-text-muted">{label}</div>
                <input
                  type="color"
                  value={(state.design as any)[key]}
                  onChange={(e) => setState((s) => ({ ...s, design: { ...s.design, [key]: e.target.value } as any }))}
                  className="h-11 w-11 rounded-lg border border-md-border bg-md-surface"
                />
                <input
                  value={(state.design as any)[key]}
                  onChange={(e) => setState((s) => ({ ...s, design: { ...s.design, [key]: e.target.value } as any }))}
                  className="h-11 flex-1 rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary"
                />
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Heading font</label>
              <select
                value={state.design.headingFont}
                onChange={(e) => setState((s) => ({ ...s, design: { ...s.design, headingFont: e.target.value } }))}
                className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary"
              >
                {HEADING_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Body font</label>
              <select
                value={state.design.bodyFont}
                onChange={(e) => setState((s) => ({ ...s, design: { ...s.design, bodyFont: e.target.value } }))}
                className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary"
              >
                {BODY_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-md-border p-5" style={{ background: state.design.surface, color: state.design.textPrimary }}>
            <div style={{ color: state.design.accent, letterSpacing: '0.25em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Preview
            </div>
            <div style={{ fontFamily: `'${state.design.headingFont}', Georgia, serif`, fontSize: '1.75rem', fontWeight: 300, marginTop: 12 }}>
              {state.basics.name || 'Event name'}
            </div>
            <div style={{ fontFamily: `'${state.design.bodyFont}', system-ui, sans-serif`, color: state.design.textMuted, marginTop: 8, fontSize: '0.9rem' }}>
              A sample card preview with your colours and fonts.
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <div style={{ border: `1px solid ${state.design.border}`, borderRadius: 12, padding: '10px 14px', background: state.design.background, color: state.design.textPrimary, fontSize: '0.85rem' }}>
                Sample button
              </div>
              <div style={{ border: `1px solid ${state.design.accent}`, borderRadius: 999, padding: '8px 12px', color: state.design.accent, fontSize: '0.75rem' }}>
                Badge
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {state.step === 3 ? (
        <div className="space-y-4">
          {(
            [
              ['Event Details', 'eventDetails', 'Show event description and dress code'],
              ['Venue & Directions', 'venue', 'Show venue name, address, and Google Maps link'],
              ['Itinerary', 'itinerary', 'Show the event schedule'],
              ['Contacts', 'contacts', 'Show coordinator and concierge contacts'],
              ['RSVP', 'rsvp', 'Enable guest RSVP (native form or Tally link)'],
              ['Save to Calendar', 'saveToCalendar', 'Show .ics download button'],
              ['WhatsApp Concierge', 'whatsapp', 'Show direct message button'],
              ['Chatbot', 'chatbot', 'Embed your chatbot (configure URL)'],
              ['Live Polling', 'polling', 'Embed your polling app (configure URL)'],
              ['Guest Requests', 'guestRequests', 'Enable guest request form'],
              ['Access Pass', 'accessPass', 'Show QR access pass card'],
            ] as const
          ).map(([label, key, desc]) => (
            <div key={key} className="flex items-start justify-between gap-4 rounded-2xl border border-md-border bg-md-surface p-4">
              <div className="min-w-0">
                <div className="text-sm text-md-text-primary">{label}</div>
                <div className="mt-1 text-xs text-md-text-muted">{desc}</div>
              </div>
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, content: { ...s.content, [key]: !s.content[key] } as any }))}
                className={[
                  'h-10 rounded-full border px-3 text-xs tracking-wide',
                  state.content[key] ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
                ].join(' ')}
              >
                {state.content[key] ? 'On' : 'Off'}
              </button>
            </div>
          ))}

          {state.content.chatbot ? (
            <div className="grid gap-4 rounded-2xl border border-md-border bg-md-surface p-4">
              <Input label="Chatbot URL" value={state.content.chatbotUrl} onChange={(e) => setState((s) => ({ ...s, content: { ...s.content, chatbotUrl: e.target.value } }))} />
              <Input label="Chatbot title" value={state.content.chatbotTitle} onChange={(e) => setState((s) => ({ ...s, content: { ...s.content, chatbotTitle: e.target.value } }))} />
            </div>
          ) : null}

          {state.content.polling ? (
            <div className="grid gap-4 rounded-2xl border border-md-border bg-md-surface p-4">
              <Input label="Polling URL" value={state.content.pollingUrl} onChange={(e) => setState((s) => ({ ...s, content: { ...s.content, pollingUrl: e.target.value } }))} />
              <Input label="Polling title" value={state.content.pollingTitle} onChange={(e) => setState((s) => ({ ...s, content: { ...s.content, pollingTitle: e.target.value } }))} />
            </div>
          ) : null}

          {state.content.rsvp ? (
            <div className="grid gap-4 rounded-2xl border border-md-border bg-md-surface p-4">
              <div className="flex gap-2">
                {(['native', 'tally'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setState((s) => ({ ...s, content: { ...s.content, rsvpMode: m } }))}
                    className={[
                      'h-10 rounded-full border px-3 text-xs tracking-wide',
                      state.content.rsvpMode === m ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
                    ].join(' ')}
                  >
                    {m === 'native' ? 'Native form' : 'External Tally link'}
                  </button>
                ))}
              </div>
              {state.content.rsvpMode === 'tally' ? (
                <Input label="Tally URL" value={state.content.tallyUrl} onChange={(e) => setState((s) => ({ ...s, content: { ...s.content, tallyUrl: e.target.value } }))} />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {state.step === 4 ? (
        <div className="space-y-3">
          {(
            [
              ['Wallet Passes', 'walletPassEnabled', 'Add to Apple/Google Wallet buttons on access pass'],
              ['Post-Event Experience', 'postEventEnabled', 'Show thank you, gallery, and feedback after event'],
              ['Communication Log', 'communicationLogEnabled', 'Track every guest touchpoint'],
              ['Guest Groups', 'guestGroupsEnabled', 'Enable plus-one groups with limits'],
              ['Invitation Tracking', 'invitationTrackingEnabled', 'Track when guests open their portal'],
              ['Dietary Export', 'dietaryExportEnabled', 'Enable dietary report export for catering'],
              ['Accessibility Export', 'accessibilityExportEnabled', 'Enable accessibility report for venue'],
              ['Feedback Form', 'feedbackFormEnabled', 'Enable post-event feedback collection'],
            ] as const
          ).map(([label, key, desc]) => (
            <div key={key} className="flex items-start justify-between gap-4 rounded-2xl border border-md-border bg-md-surface p-4">
              <div className="min-w-0">
                <div className="text-sm text-md-text-primary">{label}</div>
                <div className="mt-1 text-xs text-md-text-muted">{desc}</div>
              </div>
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, features: { ...s.features, [key]: !s.features[key] } as any }))}
                className={[
                  'h-10 rounded-full border px-3 text-xs tracking-wide',
                  state.features[key] ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
                ].join(' ')}
              >
                {state.features[key] ? 'On' : 'Off'}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {state.step === 5 ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-md-border bg-md-surface p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Summary</div>
            <div className="mt-3 text-sm text-md-text-muted">
              <div>
                <span className="text-md-text-primary">Name:</span> {state.basics.name || '—'}
              </div>
              <div className="mt-1">
                <span className="text-md-text-primary">Slug:</span> {state.basics.slug || slugify(state.basics.name) || '—'}
              </div>
              <div className="mt-1">
                <span className="text-md-text-primary">Timezone:</span> {state.basics.timezone}
              </div>
            </div>
          </div>

          <Button type="button" variant="primary" loading={creating} onClick={() => void createEvent()}>
            Create Event
          </Button>
        </div>
      ) : null}

      {error ? <div className="text-sm text-md-error">{error}</div> : null}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" disabled={state.step === 1} onClick={back}>
          Back
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={state.step === 5}
          onClick={() => {
            const err = validateStep(state.step)
            if (err) return setError(err)
            next()
          }}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

