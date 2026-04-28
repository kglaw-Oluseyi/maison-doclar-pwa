export type EventForICS = {
  id: string
  name: string
  date: Date
  endDate: Date | null
  address: string
  description: string | null
  slug: string
}

function formatICSDateUTC(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const mm = String(date.getUTCMinutes()).padStart(2, '0')
  const ss = String(date.getUTCSeconds()).padStart(2, '0')
  return `${y}${m}${d}T${hh}${mm}${ss}Z`
}

function escapeICSText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replaceAll('\n', '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;')
}

export function generateICS(event: EventForICS): string {
  const now = new Date()
  const end = event.endDate ?? new Date(event.date.getTime() + 3 * 60 * 60 * 1000)
  const summary = escapeICSText(event.name)
  const location = escapeICSText(event.address)
  const description = escapeICSText(event.description ?? event.name)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Maison Doclar//Event Portal//EN',
    'BEGIN:VEVENT',
    `UID:${escapeICSText(event.id)}@maisondoclar.com`,
    `DTSTAMP:${formatICSDateUTC(now)}`,
    `DTSTART:${formatICSDateUTC(event.date)}`,
    `DTEND:${formatICSDateUTC(end)}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ]

  return lines.join('\r\n')
}

