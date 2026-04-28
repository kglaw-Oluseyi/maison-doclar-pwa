'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { HostDashboardPreview } from '@/components/dashboard/HostDashboardPreview'

type HostUser = {
  id: string
  name: string
  email: string
  role: string
  viewConfig: unknown
  createdAtISO: string
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

const VIEW_TOGGLES: Array<{ key: string; label: string; desc: string }> = [
  { key: 'showStatsBar', label: 'Stats Bar', desc: 'Show attendance and RSVP counts' },
  { key: 'showArrivalFeed', label: 'Arrival Feed', desc: 'Show real-time check-in feed' },
  { key: 'showGuestList', label: 'Guest List', desc: 'Show full guest list' },
  { key: 'showDietaryAccessibilitySummary', label: 'Dietary & Accessibility', desc: 'Show dietary and accessibility summary' },
  { key: 'showOutstandingRequests', label: 'Outstanding Requests', desc: 'Show pending request badge' },
  { key: 'showAwaitingResponseList', label: 'Awaiting Response List', desc: "Show guests who haven't RSVPd" },
  { key: 'showExportButton', label: 'Export Button', desc: 'Allow guest list CSV download' },
  { key: 'showRsvpDetails', label: 'RSVP Details', desc: 'Show RSVP details in guest detail sheet' },
  { key: 'showVipAlerts', label: 'VIP Alerts', desc: 'Highlight VIP arrivals in feed' },
  { key: 'showPostEventSummary', label: 'Post-Event Summary', desc: 'Show final attendance summary' },
  { key: 'eventDayModeAutoSwitch', label: 'Auto Event-Day Mode', desc: 'Switch focus automatically on event day' },
]

function defaultViewConfig(): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const t of VIEW_TOGGLES) out[t.key] = true
  return out
}

function normalizeViewConfig(v: unknown): Record<string, boolean> {
  const base = defaultViewConfig()
  if (!isRecord(v)) return base
  const out = { ...base }
  for (const k of Object.keys(base)) {
    const key = k as keyof typeof out
    const raw = (v as Record<string, unknown>)[k]
    out[key] = raw === false ? false : raw === true ? true : (out[key] ?? true)
  }
  return out
}

function randomPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$'
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr)
    .map((n) => alphabet[n % alphabet.length])
    .join('')
}

export function HostUsersManager({ slug }: { slug: string }) {
  const [users, setUsers] = React.useState<HostUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [showAdd, setShowAdd] = React.useState(false)
  const [addForm, setAddForm] = React.useState({ name: '', email: '', role: 'Host', password: '' })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/hosts`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Unable to load hosts')
      const data = (await res.json()) as { users: HostUser[] }
      setUsers(Array.isArray(data.users) ? data.users : [])
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Unable to load hosts')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void load()
  }, [slug])

  async function create() {
    setError(null)
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/hosts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setError(data?.error ?? 'Unable to create host')
      return
    }
    setShowAdd(false)
    setAddForm({ name: '', email: '', role: 'Host', password: '' })
    await load()
  }

  async function patch(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/hosts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error('Unable to update host')
  }

  async function remove(id: string) {
    if (!confirm('Delete this host user?')) return
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/hosts/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) {
      setError('Unable to delete host')
      return
    }
    await load()
  }

  const active = expandedId ? users.find((u) => u.id === expandedId) : null
  const activeViewConfig = active ? normalizeViewConfig(active.viewConfig) : defaultViewConfig()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button type="button" variant="primary" onClick={() => setShowAdd(true)}>
          Add Host User
        </Button>
      </div>

      {error ? <div className="text-sm text-md-error">{error}</div> : null}
      {loading ? <div className="text-sm text-md-text-muted">Loading…</div> : null}

      {!loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-2xl border border-md-border bg-md-surface">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-md-border">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-md-text-primary">{u.name}</td>
                    <td className="px-4 py-3 text-md-text-muted">{u.email}</td>
                    <td className="px-4 py-3 text-md-text-muted">{u.role}</td>
                    <td className="px-4 py-3 text-md-text-muted">{new Date(u.createdAtISO).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setExpandedId((p) => (p === u.id ? null : u.id))}
                        >
                          {expandedId === u.id ? 'Close' : 'Edit'}
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => void remove(u.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-sm text-md-text-muted" colSpan={5}>
                      No host users yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            {active ? (
              <div className="rounded-2xl border border-md-border bg-md-surface p-5">
                <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light">{active.name}</div>
                <div className="mt-1 text-sm text-md-text-muted">{active.email}</div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Name"
                    value={active.name}
                    onChange={(e) =>
                      setUsers((prev) => prev.map((x) => (x.id === active.id ? { ...x, name: e.target.value } : x)))
                    }
                  />
                  <Input
                    label="Email"
                    value={active.email}
                    onChange={(e) =>
                      setUsers((prev) => prev.map((x) => (x.id === active.id ? { ...x, email: e.target.value } : x)))
                    }
                  />
                  <Input
                    label="Role"
                    value={active.role}
                    onChange={(e) =>
                      setUsers((prev) => prev.map((x) => (x.id === active.id ? { ...x, role: e.target.value } : x)))
                    }
                  />
                </div>

                <div className="mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      void patch(active.id, { name: active.name, email: active.email, role: active.role }).then(() => load())
                    }
                  >
                    Save profile
                  </Button>
                </div>

                <div className="mt-6 border-t border-md-border pt-6">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">View config</div>
                  <div className="mt-4 space-y-3">
                    {VIEW_TOGGLES.map((t) => {
                      const on = activeViewConfig[t.key] === true
                      return (
                        <div key={t.key} className="flex items-start justify-between gap-4 rounded-2xl border border-md-border bg-md-surface-elevated p-4">
                          <div className="min-w-0">
                            <div className="text-sm text-md-text-primary">{t.label}</div>
                            <div className="mt-1 text-xs text-md-text-muted">{t.desc}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const nextCfg = { ...activeViewConfig, [t.key]: !on }
                              setUsers((prev) =>
                                prev.map((x) => (x.id === active.id ? { ...x, viewConfig: nextCfg } : x)),
                              )
                              void patch(active.id, { viewConfig: nextCfg }).catch(() => null)
                            }}
                            className={[
                              'h-10 rounded-full border px-3 text-xs tracking-wide',
                              on ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
                            ].join(' ')}
                          >
                            {on ? 'On' : 'Off'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-md-border bg-md-surface p-5 text-sm text-md-text-muted">
                Select a host user to edit view config and preview the host dashboard.
              </div>
            )}

            <HostDashboardPreview slug={slug} eventName="Preview Event" timezone="Europe/Paris" viewConfig={activeViewConfig} />
          </div>
        </div>
      ) : null}

      {showAdd ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-[720px] rounded-3xl border border-md-border bg-md-surface p-6">
            <div className="flex items-center justify-between">
              <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light">Add host user</div>
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-md-border bg-md-surface-elevated px-3 py-2 text-sm">
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="Name" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
              <Input label="Email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Role" value={addForm.role} onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))} />
              <div className="space-y-2">
                <Input label="Password" value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} />
                <Button type="button" variant="secondary" size="sm" onClick={() => setAddForm((f) => ({ ...f, password: randomPassword() }))}>
                  Auto-generate password
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <Button type="button" variant="primary" onClick={() => void create()}>
                Create host
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

