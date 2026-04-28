export function eventScope(slug: string): string {
  return `/events/${slug}/`
}

export function manifestUrl(slug: string): string {
  return `/events/${slug}/manifest.webmanifest`
}

export function serviceWorkerUrl(slug: string): string {
  return `/events/${slug}/sw.js`
}

export function offlineUrl(slug: string): string {
  return `/events/${slug}/offline`
}

export function iconUrl(slug: string, size: number, variant?: 'maskable'): string {
  const suffix = variant === 'maskable' ? '-maskable' : ''
  return `/events/${slug}/icons/${size}${suffix}`
}

