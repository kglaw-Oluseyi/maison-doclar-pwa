'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type GuestRow = {
  id: string
  accessToken: string
  name: string
  email: string | null
  rsvpStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  tableNumber: string | null
  tags: string[]
  invitedAt: string | null
  invitationChannel: 'WHATSAPP' | 'EMAIL' | 'MANUAL' | null
  portalVisitCount: number
  dietaryNotes: string | null
  accessibilityNotes: string | null
  accessCard: { releasedAt: string | null; invalidatedAt: string | null; qrToken?: string | null } | null
}

function Badge({ status }: { status: GuestRow['rsvpStatus'] }) {
  const styles: Record<string, string> = {
    PENDING: 'border-md-border bg-md-surface text-md-text-muted',
    ACCEPTED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    DECLINED: 'border-red-500/20 bg-red-500/10 text-red-300',
  }
  return (
    <span className={['inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] tracking-wide', styles[status]].join(' ')}>
      {status}
    </span>
  )
}

function parseCsvTags(value: string): string[] {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export function GuestsManager({
  slug,
  eventId,
  unreleasedCount,
}: {
  slug: string
  eventId: string
  unreleasedCount: number
}) {
  const [guests, setGuests] = React.useState<GuestRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k)

  const [showAdd, setShowAdd] = React.useState(false)
  const [addForm, setAddForm] = React.useState({
    name: '',
    email: '',
    tableNumber: '',
    tags: '',
    dietaryNotes: '',
    accessibilityNotes: '',
  })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/guests`, { cache: 'no-store' })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Unable to load guests')
      }
      const data = (await res.json()) as { guests: GuestRow[] }
      setGuests(Array.isArray(data.guests) ? data.guests : [])
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Unable to load guests')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  async function patchGuest(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/guests/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      throw new Error(data?.error ?? 'Unable to update guest')
    }
  }

  async function deleteGuest(id: string) {
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/guests/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      throw new Error(data?.error ?? 'Unable to delete guest')
    }
  }

  async function regenerateQr(id: string) {
    const res = await fetch('/api/qr/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId: id, performedBy: 'operator' }),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      throw new Error(data?.error ?? 'Unable to regenerate QR')
    }
  }

  async function releasePasses() {
    const count = guests.filter((g) => g.accessCard && !g.accessCard.releasedAt).length
    if (!confirm(`This will release QR access passes for ${count} guests. They will become visible in the guest portal immediately.`)) return
    const res = await fetch('/api/qr/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      throw new Error(data?.error ?? 'Unable to release passes')
    }
    await load()
  }

  async function addGuest() {
    setError(null)
    const name = addForm.name.trim()
    if (!name) return setError('Name is required.')
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? 'Unable to add guest')
        return
      }
      setShowAdd(false)
      setAddForm({ name: '', email: '', tableNumber: '', tags: '', dietaryNotes: '', accessibilityNotes: '' })
      await load()
    } catch {
      setError('Unable to add guest')
    }
  }

  async function bulkMarkInvited(channel: 'WHATSAPP' | 'EMAIL' | 'MANUAL') {
    const now = new Date().toISOString()
    for (const id of selectedIds) {
      await patchGuest(id, { invitedAt: now, invitationChannel: channel })
    }
    setSelected({})
    await load()
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selectedIds.length} guests? This cannot be undone.`)) return
    for (const id of selectedIds) await deleteGuest(id)
    setSelected({})
    await load()
  }

  function exportSelected() {
    const ids = selectedIds.join(',')
    window.location.href = `/api/dashboard/events/${encodeURIComponent(slug)}/guests/export?ids=${encodeURIComponent(ids)}`
  }

  return (
    <div className="space-y-5">
      {(() => {
        const hasUnreleasedCards = guests.some((g) => g.accessCard && !g.accessCard.releasedAt)
        return (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <a
                href={`/dashboard/events/${slug}/guests/import`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary hover:bg-md-surface-elevated"
              >
                Import CSV
              </a>
              <Button type="button" variant="secondary" onClick={() => setShowAdd(true)}>
                Add Guest
              </Button>
              {hasUnreleasedCards ? (
                <Button type="button" variant="primary" onClick={() => void releasePasses()}>
                  Release Access Passes
                </Button>
              ) : null}
            </div>
            {selectedIds.length ? (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-md-border bg-md-surface p-3">
                <div className="text-xs text-md-text-muted self-center px-2">{selectedIds.length} selected</div>
                <Button type="button" variant="secondary" size="sm" onClick={() => void bulkMarkInvited('MANUAL')}>
                  Mark invited (Manual)
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => void bulkMarkInvited('EMAIL')}>
                  Mark invited (Email)
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => void bulkMarkInvited('WHATSAPP')}>
                  Mark invited (WhatsApp)
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={exportSelected}>
                  Export selected
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => void bulkDelete()}>
                  Delete selected
                </Button>
              </div>
            ) : null}
          </div>
        )
      })()}

      {error ? <div className="text-sm text-md-error">{error}</div> : null}
      {loading ? <div className="text-sm text-md-text-muted">Loading…</div> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-2xl border border-md-border bg-md-surface">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={guests.length > 0 && selectedIds.length === guests.length}
                    onChange={(e) => {
                      const next: Record<string, boolean> = {}
                      if (e.target.checked) for (const g of guests) next[g.id] = true
                      setSelected(next)
                    }}
                  />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">RSVP</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Invited</th>
                <th className="px-4 py-3">Portal visits</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-md-border">
              {guests.map((g) => {
                const isOpen = expandedId === g.id
                return (
                  <React.Fragment key={g.id}>
                    <tr>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={!!selected[g.id]}
                          onChange={(e) => setSelected((s) => ({ ...s, [g.id]: e.target.checked }))}
                        />
                      </td>
                      <td className="px-4 py-3 text-md-text-primary">{g.name}</td>
                      <td className="px-4 py-3 text-md-text-muted">{g.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge status={g.rsvpStatus} />
                      </td>
                      <td className="px-4 py-3 text-md-text-muted">{g.tableNumber ?? '—'}</td>
                      <td className="px-4 py-3 text-md-text-muted">{g.tags.join(', ') || '—'}</td>
                      <td className="px-4 py-3 text-md-text-muted">
                        {g.invitedAt ? new Date(g.invitedAt).toLocaleString() : 'Not yet invited'}
                      </td>
                      <td className="px-4 py-3 text-md-text-muted">{g.portalVisitCount ?? 0}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId((prev) => (prev === g.id ? null : g.id))}
                          className="inline-flex h-9 items-center justify-center rounded-xl border border-md-border bg-md-surface-elevated px-3 text-xs text-md-text-primary"
                        >
                          {isOpen ? 'Close' : 'Edit ▾'}
                        </button>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-4">
                          <GuestRowEditor
                            guest={g}
                            slug={slug}
                            onClose={() => setExpandedId(null)}
                            onSaved={() => void load()}
                            onDelete={async () => {
                              if (!confirm(`Remove ${g.name}?`)) return
                              await deleteGuest(g.id)
                              setExpandedId(null)
                              await load()
                            }}
                            onRegenerate={async () => {
                              await regenerateQr(g.id)
                              alert('QR regenerated.')
                            }}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {showAdd ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-[720px] rounded-3xl border border-md-border bg-md-surface p-6">
            <div className="flex items-center justify-between">
              <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light">Add guest</div>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-xl border border-md-border bg-md-surface-elevated px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="Name" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
              <Input label="Email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Table number" value={addForm.tableNumber} onChange={(e) => setAddForm((f) => ({ ...f, tableNumber: e.target.value }))} />
              <Input label="Tags (comma-separated)" value={addForm.tags} onChange={(e) => setAddForm((f) => ({ ...f, tags: e.target.value }))} />
              <Input label="Dietary notes" value={addForm.dietaryNotes} onChange={(e) => setAddForm((f) => ({ ...f, dietaryNotes: e.target.value }))} />
              <Input
                label="Accessibility notes"
                value={addForm.accessibilityNotes}
                onChange={(e) => setAddForm((f) => ({ ...f, accessibilityNotes: e.target.value }))}
              />
            </div>
            <div className="mt-6">
              <Button type="button" variant="primary" onClick={() => void addGuest()}>
                Add guest
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function GuestRowEditor({
  guest,
  slug,
  onSaved,
  onDelete,
  onRegenerate,
  onClose,
}: {
  guest: GuestRow
  slug: string
  onSaved: () => void
  onDelete: () => Promise<void>
  onRegenerate: () => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = React.useState({
    name: guest.name,
    email: guest.email ?? '',
    tableNumber: guest.tableNumber ?? '',
    tags: guest.tags.join(', '),
    dietaryNotes: guest.dietaryNotes ?? '',
    accessibilityNotes: guest.accessibilityNotes ?? '',
    invitationChannel: (guest.invitationChannel ?? 'MANUAL') as 'WHATSAPP' | 'EMAIL' | 'MANUAL',
  })
  const [saving, setSaving] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  async function save() {
    setErr(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/guests/${encodeURIComponent(guest.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          tableNumber: form.tableNumber || null,
          tags: form.tags,
          dietaryNotes: form.dietaryNotes || null,
          accessibilityNotes: form.accessibilityNotes || null,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Unable to save')
      }
      onSaved()
    } catch (e: any) {
      setErr(typeof e?.message === 'string' ? e.message : 'Unable to save')
    } finally {
      setSaving(false)
    }
  }

  async function markInvited() {
    setErr(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/guests/${encodeURIComponent(guest.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitedAt: new Date().toISOString(),
          invitationChannel: form.invitationChannel,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Unable to mark invited')
      }
      onSaved()
    } catch (e: any) {
      setErr(typeof e?.message === 'string' ? e.message : 'Unable to mark invited')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="font-[family-name:var(--md-font-heading)] text-xl font-light">Edit guest</div>
        <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <Input label="Table number" value={form.tableNumber} onChange={(e) => setForm((f) => ({ ...f, tableNumber: e.target.value }))} />
        <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
        <Input label="Dietary notes" value={form.dietaryNotes} onChange={(e) => setForm((f) => ({ ...f, dietaryNotes: e.target.value }))} />
        <Input
          label="Accessibility notes"
          value={form.accessibilityNotes}
          onChange={(e) => setForm((f) => ({ ...f, accessibilityNotes: e.target.value }))}
        />
        {err ? <div className="text-sm text-md-error">{err}</div> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" loading={saving} onClick={() => void save()}>
            Save
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="font-[family-name:var(--md-font-heading)] text-xl font-light">Actions</div>
        <div className="rounded-2xl border border-md-border bg-md-surface p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Invitation</div>
          <div className="mt-3 grid gap-3">
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Channel</label>
              <select
                value={form.invitationChannel}
                onChange={(e) => setForm((f) => ({ ...f, invitationChannel: e.target.value as any }))}
                className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary"
              >
                <option value="WHATSAPP">WHATSAPP</option>
                <option value="EMAIL">EMAIL</option>
                <option value="MANUAL">MANUAL</option>
              </select>
            </div>
            <Button type="button" variant="secondary" loading={saving} onClick={() => void markInvited()}>
              Mark as invited
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-md-border bg-md-surface p-4 space-y-2">
          <Button type="button" variant="secondary" onClick={() => void onRegenerate()}>
            Regenerate QR
          </Button>
          <Button type="button" variant="secondary" onClick={() => void onDelete()}>
            Remove guest
          </Button>
        </div>
      </div>
    </div>
  )
}

