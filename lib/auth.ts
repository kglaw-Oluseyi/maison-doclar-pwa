const textEncoder = new TextEncoder()

function bytesToBase64(bytes: Uint8Array): string {
  // Edge/runtime-safe base64 encoding (no Node Buffer required).
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] ?? 0)
  }
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array | null {
  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

function toBase64Url(bytes: Uint8Array): string {
  const base64 = bytesToBase64(bytes)
  return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fromBase64Url(input: string): Uint8Array | null {
  const normalized = input.replaceAll('-', '+').replaceAll('_', '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return base64ToBytes(padded)
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
  return diff === 0
}

function utcDayBucket(now: Date): string {
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function importHmacKey(sessionSecret: string): Promise<CryptoKey> {
  const keyData = textEncoder.encode(sessionSecret)
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

async function hmacSha256Base64Url(key: CryptoKey, message: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(message))
  return toBase64Url(new Uint8Array(sig))
}

export type SessionTokenResult =
  | { ok: true; token: string }
  | { ok: false; error: string; code: 'MISSING_ENV' }

export async function generateDashboardSessionToken(now: Date = new Date()): Promise<SessionTokenResult> {
  const password = process.env.DASHBOARD_PASSWORD
  const secret = process.env.SESSION_SECRET
  if (!password || !secret) {
    return { ok: false, error: 'Missing DASHBOARD_PASSWORD or SESSION_SECRET', code: 'MISSING_ENV' }
  }

  const bucket = utcDayBucket(now)
  const key = await importHmacKey(secret)
  const message = `${password}:${bucket}`
  const sig = await hmacSha256Base64Url(key, message)
  return { ok: true, token: `${bucket}.${sig}` }
}

export async function verifyDashboardSessionToken(
  token: string | undefined,
  now: Date = new Date(),
): Promise<boolean> {
  const password = process.env.DASHBOARD_PASSWORD
  const secret = process.env.SESSION_SECRET
  if (!token || !password || !secret) return false

  const parts = token.split('.')
  if (parts.length !== 2) return false
  const bucket = parts[0]
  const providedSigB64Url = parts[1]
  if (!bucket || !providedSigB64Url) return false

  const today = utcDayBucket(now)
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const yesterday = utcDayBucket(yesterdayDate)
  if (bucket !== today && bucket !== yesterday) return false

  const providedSigBytes = fromBase64Url(providedSigB64Url)
  if (!providedSigBytes) return false

  const key = await importHmacKey(secret)
  const expectedSig = await hmacSha256Base64Url(key, `${password}:${bucket}`)
  const expectedBytes = fromBase64Url(expectedSig)
  if (!expectedBytes) return false

  return constantTimeEqual(providedSigBytes, expectedBytes)
}

