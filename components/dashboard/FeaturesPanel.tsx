'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Question = { id: string; question: string; type: 'text' | 'rating' }
type Link = { label: string; url: string }

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function defaultFlags(): Record<string, boolean> {
  return {
    walletPassEnabled: false,
    postEventEnabled: false,
    communicationLogEnabled: false,
    guestGroupsEnabled: false,
    invitationTrackingEnabled: false,
    dietaryExportEnabled: false,
    accessibilityExportEnabled: false,
    feedbackFormEnabled: false,
  }
}

export function FeaturesPanel({
  slug,
  initialFeatureFlags,
  initialPostEventConfig,
}: {
  slug: string
  initialFeatureFlags: unknown
  initialPostEventConfig: unknown
}) {
  const [flags, setFlags] = React.useState<Record<string, boolean>>(() => ({
    ...defaultFlags(),
    ...(isRecord(initialFeatureFlags) ? (initialFeatureFlags as any) : {}),
  }))

  const initialCfg = isRecord(initialPostEventConfig) ? (initialPostEventConfig as any) : {}
  const [thankYouMessage, setThankYouMessage] = React.useState<string>(typeof initialCfg.thankYouMessage === 'string' ? initialCfg.thankYouMessage : '')
  const [thankYouSubtext, setThankYouSubtext] = React.useState<string>(typeof initialCfg.thankYouSubtext === 'string' ? initialCfg.thankYouSubtext : '')
  const [galleryEnabled, setGalleryEnabled] = React.useState<boolean>(initialCfg.galleryEnabled === true)
  const [feedbackEnabled, setFeedbackEnabled] = React.useState<boolean>(initialCfg.feedbackEnabled === true)
  const [activatesAt, setActivatesAt] = React.useState<string>(typeof initialCfg.activatesAt === 'string' ? initialCfg.activatesAt : '')
  const [questions, setQuestions] = React.useState<Question[]>(
    Array.isArray(initialCfg.feedbackQuestions) ? initialCfg.feedbackQuestions : [],
  )
  const [links, setLinks] = React.useState<Link[]>(Array.isArray(initialCfg.followUpLinks) ? initialCfg.followUpLinks : [])

  const [groups, setGroups] = React.useState<Array<{ id: string; name: string; maxSize: number; overflowMessage: string; memberCount: number }>>([])
  const [groupsLoading, setGroupsLoading] = React.useState(false)
  const [groupsErr, setGroupsErr] = React.useState<string | null>(null)

  const [saving, setSaving] = React.useState(false)
  const [saveErr, setSaveErr] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  async function loadGroups() {
    setGroupsErr(null)
    setGroupsLoading(true)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/groups`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Unable to load groups')
      const data = (await res.json()) as { groups: any[] }
      setGroups(Array.isArray(data.groups) ? (data.groups as any) : [])
    } catch (e: any) {
      setGroupsErr(typeof e?.message === 'string' ? e.message : 'Unable to load groups')
    } finally {
      setGroupsLoading(false)
    }
  }

  React.useEffect(() => {
    if (flags.guestGroupsEnabled) void loadGroups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flags.guestGroupsEnabled])

  async function save() {
    setSaveErr(null)
    setDone(false)
    setSaving(true)
    try {
      const postEventConfig: Record<string, unknown> = {
        thankYouMessage,
        thankYouSubtext,
        galleryEnabled,
        feedbackEnabled,
        feedbackQuestions: feedbackEnabled ? questions : [],
        followUpLinks: links,
        activatesAt,
      }

      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/features`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureFlags: flags, postEventConfig }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Unable to save')
      }
      setDone(true)
      window.setTimeout(() => setDone(false), 1500)
    } catch (e: any) {
      setSaveErr(typeof e?.message === 'string' ? e.message : 'Unable to save')
    } finally {
      setSaving(false)
    }
  }

  function ToggleCard({
    title,
    desc,
    flagKey,
    children,
  }: {
    title: string
    desc: string
    flagKey: string
    children?: React.ReactNode
  }) {
    const on = flags[flagKey] === true
    return (
      <div className="rounded-2xl border border-md-border bg-md-surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm text-md-text-primary">{title}</div>
            <div className="mt-1 text-xs text-md-text-muted">{desc}</div>
          </div>
          <button
            type="button"
            onClick={() => setFlags((f) => ({ ...f, [flagKey]: !f[flagKey] }))}
            className={[
              'h-10 rounded-full border px-3 text-xs tracking-wide',
              on ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
            ].join(' ')}
          >
            {on ? 'On' : 'Off'}
          </button>
        </div>
        {on && children ? <div className="mt-5 border-t border-md-border pt-5">{children}</div> : null}
      </div>
    )
  }

  async function createGroup(args: { name: string; maxSize: number; overflowMessage: string }) {
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
    if (!res.ok) throw new Error('Unable to create group')
    await loadGroups()
  }

  async function patchGroup(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/groups/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error('Unable to update group')
    await loadGroups()
  }

  async function deleteGroup(id: string) {
    if (!confirm('Delete this group?')) return
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/groups/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Unable to delete group')
    await loadGroups()
  }

  const [newGroup, setNewGroup] = React.useState({ name: '', maxSize: 2, overflowMessage: 'Need to add more guests? Send us a message through the app.' })

  return (
    <div className="space-y-5">
      <ToggleCard title="Wallet Passes" desc="Add to Apple/Google Wallet buttons on access pass" flagKey="walletPassEnabled" />
      <ToggleCard title="Communication Log" desc="Track every guest touchpoint" flagKey="communicationLogEnabled" />
      <ToggleCard title="Invitation Tracking" desc="Track when guests open their portal" flagKey="invitationTrackingEnabled" />
      <ToggleCard title="Dietary Export" desc="Enable dietary report export for catering" flagKey="dietaryExportEnabled" />
      <ToggleCard title="Accessibility Export" desc="Enable accessibility report export for venue" flagKey="accessibilityExportEnabled" />
      <ToggleCard title="Feedback Form" desc="Enable post-event feedback collection" flagKey="feedbackFormEnabled" />

      <ToggleCard
        title="Post-Event Experience"
        desc="Show thank you, gallery, and feedback after event"
        flagKey="postEventEnabled"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Thank you message</label>
            <textarea
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-md-border bg-md-surface px-4 py-3 text-sm text-md-text-primary"
            />
          </div>
          <Input label="Thank you subtext" value={thankYouSubtext} onChange={(e) => setThankYouSubtext(e.target.value)} />

          <div className="flex items-center justify-between rounded-2xl border border-md-border bg-md-surface-elevated p-4">
            <div className="text-sm text-md-text-primary">Gallery enabled</div>
            <button
              type="button"
              onClick={() => setGalleryEnabled((v) => !v)}
              className={[
                'h-10 rounded-full border px-3 text-xs tracking-wide',
                galleryEnabled ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
              ].join(' ')}
            >
              {galleryEnabled ? 'On' : 'Off'}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-md-border bg-md-surface-elevated p-4">
            <div className="text-sm text-md-text-primary">Feedback form enabled</div>
            <button
              type="button"
              onClick={() => setFeedbackEnabled((v) => !v)}
              className={[
                'h-10 rounded-full border px-3 text-xs tracking-wide',
                feedbackEnabled ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
              ].join(' ')}
            >
              {feedbackEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {feedbackEnabled ? (
            <div className="space-y-3 rounded-2xl border border-md-border bg-md-surface-elevated p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Questions</div>
              {questions.map((q, idx) => (
                <div key={q.id} className="rounded-2xl border border-md-border bg-md-surface p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <Input
                        label="Question"
                        value={q.question}
                        onChange={(e) =>
                          setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, question: e.target.value } : x)))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Type</label>
                      <select
                        value={q.type}
                        onChange={(e) =>
                          setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, type: e.target.value as any } : x)))
                        }
                        className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary"
                      >
                        <option value="rating">rating</option>
                        <option value="text">text</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={idx === 0}
                      onClick={() =>
                        setQuestions((prev) => {
                          const next = [...prev]
                          const t = next[idx]
                          const prevItem = next[idx - 1]
                          if (!t || !prevItem) return prev
                          next[idx] = prevItem
                          next[idx - 1] = t
                          return next
                        })
                      }
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={idx === questions.length - 1}
                      onClick={() =>
                        setQuestions((prev) => {
                          const next = [...prev]
                          const t = next[idx]
                          const nextItem = next[idx + 1]
                          if (!t || !nextItem) return prev
                          next[idx] = nextItem
                          next[idx + 1] = t
                          return next
                        })
                      }
                    >
                      Down
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setQuestions((prev) => [...prev, { id: `q-${Date.now()}`, question: '', type: 'rating' }])
                }
              >
                Add question
              </Button>
            </div>
          ) : null}

          <div className="space-y-3 rounded-2xl border border-md-border bg-md-surface-elevated p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Follow-up links</div>
            {links.map((l, idx) => (
              <div key={idx} className="grid gap-3 md:grid-cols-2">
                <Input
                  label="Label"
                  value={l.label}
                  onChange={(e) => setLinks((prev) => prev.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))}
                />
                <Input
                  label="URL"
                  value={l.url}
                  onChange={(e) => setLinks((prev) => prev.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))}
                />
                <div className="md:col-span-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setLinks((prev) => prev.filter((_, i) => i !== idx))}>
                    Remove link
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => setLinks((prev) => [...prev, { label: '', url: '' }])}>
              Add link
            </Button>
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Activation datetime</label>
            <input
              type="datetime-local"
              value={activatesAt ? new Date(activatesAt).toISOString().slice(0, 16) : ''}
              onChange={(e) => setActivatesAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-md-text-primary"
            />
          </div>
        </div>
      </ToggleCard>

      <ToggleCard title="Guest Groups" desc="Enable plus-one groups with limits" flagKey="guestGroupsEnabled">
        <div className="space-y-4">
          {groupsErr ? <div className="text-sm text-md-error">{groupsErr}</div> : null}
          {groupsLoading ? <div className="text-sm text-md-text-muted">Loading…</div> : null}
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.id} className="rounded-2xl border border-md-border bg-md-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm text-md-text-primary">{g.name}</div>
                    <div className="mt-1 text-xs text-md-text-muted">
                      Max size: {g.maxSize} · Members: {g.memberCount}
                    </div>
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={() => void deleteGroup(g.id)}>
                    Delete
                  </Button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Input label="Name" value={g.name} onChange={(e) => setGroups((prev) => prev.map((x) => (x.id === g.id ? { ...x, name: e.target.value } : x)))} />
                  <Input
                    label="Max size"
                    value={String(g.maxSize)}
                    onChange={(e) =>
                      setGroups((prev) => prev.map((x) => (x.id === g.id ? { ...x, maxSize: Number(e.target.value) || 1 } : x)))
                    }
                  />
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Overflow message</label>
                    <textarea
                      value={g.overflowMessage}
                      onChange={(e) => setGroups((prev) => prev.map((x) => (x.id === g.id ? { ...x, overflowMessage: e.target.value } : x)))}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-md-border bg-md-surface px-4 py-3 text-sm text-md-text-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void patchGroup(g.id, { name: g.name, maxSize: g.maxSize, overflowMessage: g.overflowMessage })}
                    >
                      Save group
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {groups.length === 0 ? <div className="text-sm text-md-text-muted">No groups yet.</div> : null}
          </div>

          <div className="rounded-2xl border border-md-border bg-md-surface-elevated p-4 space-y-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Add group</div>
            <Input label="Name" value={newGroup.name} onChange={(e) => setNewGroup((g) => ({ ...g, name: e.target.value }))} />
            <Input
              label="Max size (1–50)"
              value={String(newGroup.maxSize)}
              onChange={(e) => setNewGroup((g) => ({ ...g, maxSize: Number(e.target.value) || 1 }))}
            />
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Overflow message</label>
              <textarea
                value={newGroup.overflowMessage}
                onChange={(e) => setNewGroup((g) => ({ ...g, overflowMessage: e.target.value }))}
                rows={3}
                className="w-full resize-none rounded-xl border border-md-border bg-md-surface px-4 py-3 text-sm text-md-text-primary"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                void createGroup({ name: newGroup.name, maxSize: newGroup.maxSize, overflowMessage: newGroup.overflowMessage }).then(() =>
                  setNewGroup((g) => ({ ...g, name: '' })),
                )
              }
            >
              Create group
            </Button>
          </div>
        </div>
      </ToggleCard>

      {saveErr ? <div className="text-sm text-md-error">{saveErr}</div> : null}
      {done ? <div className="text-sm text-md-success">Saved.</div> : null}
      <Button type="button" variant="primary" loading={saving} onClick={() => void save()}>
        Save feature flags
      </Button>
    </div>
  )
}

