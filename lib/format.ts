export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  }).format(date)
}

export function formatDateTimeInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date)
}

export function formatTimeInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date)
}

export function getTimezoneAbbreviation(date: Date, timezone: string): string {
  return (
    new Intl.DateTimeFormat('en-GB', {
      timeZoneName: 'short',
      timeZone: timezone,
    })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? ''
  )
}

