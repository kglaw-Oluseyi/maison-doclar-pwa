export type GuestForCSV = {
  name: string
  email: string | null
  rsvpStatus: string
  tableNumber: string | null
  dietaryNotes: string | null
  specialNotes: string | null
  tags: string[]
  createdAt: Date
}

function escapeField(value: string | null | undefined): string {
  const raw = value ?? ''
  const needsQuotes = raw.includes(',') || raw.includes('"') || raw.includes('\n') || raw.includes('\r')
  const escaped = raw.replaceAll('"', '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

export function generateGuestCSV(guests: GuestForCSV[]): string {
  const header = [
    'Name',
    'Email',
    'RSVP Status',
    'Table Number',
    'Dietary Notes',
    'Special Notes',
    'Tags',
    'Created At',
  ].join(',')

  const rows = guests.map((g) => {
    const tags = g.tags.join('; ')
    const createdAt = g.createdAt.toISOString()
    return [
      escapeField(g.name),
      escapeField(g.email),
      escapeField(g.rsvpStatus),
      escapeField(g.tableNumber),
      escapeField(g.dietaryNotes),
      escapeField(g.specialNotes),
      escapeField(tags),
      escapeField(createdAt),
    ].join(',')
  })

  return [header, ...rows, ''].join('\n')
}

