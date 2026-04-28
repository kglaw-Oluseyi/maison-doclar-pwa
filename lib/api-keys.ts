import crypto from 'node:crypto'

function toBase64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

export function generateRawApiKey(): string {
  return toBase64Url(crypto.randomBytes(32))
}

export function hmacKeyHash(rawKey: string, secret: string): string {
  const h = crypto.createHmac('sha256', secret).update(rawKey).digest()
  return toBase64Url(h)
}

