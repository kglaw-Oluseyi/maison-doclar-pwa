const textEncoder = new TextEncoder()

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i] ?? 0)
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
  return bytesToBase64(bytes).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
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
  return await crypto.subtle.importKey('raw', textEncoder.encode(sessionSecret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
}

async function hmacSha256Base64Url(key: CryptoKey, message: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(message))
  return toBase64Url(new Uint8Array(sig))
}

async function derivePbkdf2(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const saltBuf = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuf, iterations: 100_000 },
    keyMaterial,
    32 * 8,
  )
  return new Uint8Array(bits)
}

function randomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n)
  ;(crypto.getRandomValues as unknown as (arr: Uint8Array) => Uint8Array)(bytes)
  return bytes
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await derivePbkdf2(password, salt)
  return `pbkdf2:${bytesToBase64(salt)}:${bytesToBase64(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':')
  if (parts.length !== 3) return false
  if (parts[0] !== 'pbkdf2') return false
  const salt = base64ToBytes(parts[1] ?? '')
  const hash = base64ToBytes(parts[2] ?? '')
  if (!salt || !hash) return false
  const derived = await derivePbkdf2(password, salt)
  return constantTimeEqual(derived, hash)
}

export async function generateHostSessionToken(eventId: string, now: Date = new Date()): Promise<string> {
  const password = process.env.DASHBOARD_PASSWORD
  const secret = process.env.SESSION_SECRET
  if (!password || !secret) throw new Error('Missing DASHBOARD_PASSWORD or SESSION_SECRET')
  const bucket = utcDayBucket(now)
  const key = await importHmacKey(secret)
  const sig = await hmacSha256Base64Url(key, `${eventId}:${password}:${bucket}`)
  return `${eventId}.${bucket}.${sig}`
}

export async function verifyHostSessionToken(token: string, eventId: string, now: Date = new Date()): Promise<boolean> {
  const password = process.env.DASHBOARD_PASSWORD
  const secret = process.env.SESSION_SECRET
  if (!password || !secret) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false
  const tokenEventId = parts[0]
  const bucket = parts[1]
  const providedSigB64Url = parts[2]
  if (!tokenEventId || !bucket || !providedSigB64Url) return false
  if (tokenEventId !== eventId) return false

  const today = utcDayBucket(now)
  const yesterday = utcDayBucket(new Date(now.getTime() - 24 * 60 * 60 * 1000))
  if (bucket !== today && bucket !== yesterday) return false

  const providedSigBytes = fromBase64Url(providedSigB64Url)
  if (!providedSigBytes) return false

  const key = await importHmacKey(secret)
  const expectedSig = await hmacSha256Base64Url(key, `${eventId}:${password}:${bucket}`)
  const expectedBytes = fromBase64Url(expectedSig)
  if (!expectedBytes) return false

  return constantTimeEqual(providedSigBytes, expectedBytes)
}

