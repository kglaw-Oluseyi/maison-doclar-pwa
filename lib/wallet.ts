import type { AccessCard, Event, Guest } from '@prisma/client'

export class WalletNotConfiguredError extends Error {
  code = 'WALLET_NOT_CONFIGURED' as const
  constructor() {
    super('Wallet passes not configured')
  }
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new WalletNotConfiguredError()
  return v
}

export async function generateAppleWalletPass(
  guest: Pick<Guest, 'id' | 'name' | 'tableNumber' | 'accessToken'>,
  event: Pick<Event, 'id' | 'name' | 'date'>,
  accessCard: Pick<AccessCard, 'qrToken'>,
): Promise<Buffer> {
  // Only validate configuration here; a full pass implementation requires
  // production certificates + pass type identifiers specific to Maison Doclar.
  requireEnv('APPLE_PASS_CERT')
  requireEnv('APPLE_PASS_KEY')
  requireEnv('APPLE_PASS_WWDR')

  const passjs: any = await import('@walletpass/pass-js')
  const PKPass = passjs?.PKPass ?? passjs?.default?.PKPass
  if (!PKPass) throw new Error('PKPass unavailable')

  // Minimal valid pass: generic style with a QR payload.
  // NOTE: certificate/passinfrastructure must be configured in env.
  const pass = new PKPass(
    {},
    {
      signerCert: Buffer.from(process.env.APPLE_PASS_CERT as string),
      signerKey: Buffer.from(process.env.APPLE_PASS_KEY as string),
      wwdr: Buffer.from(process.env.APPLE_PASS_WWDR as string),
    } as any,
  )

  pass.type = 'generic'
  pass.serialNumber = guest.id
  pass.organizationName = 'Maison Doclar'
  pass.description = `${event.name} — Access Pass`
  pass.teamIdentifier = 'MAISONDOC'
  pass.passTypeIdentifier = 'pass.maison.doclar'

  pass.setBarcodes({
    message: accessCard.qrToken,
    format: 'PKBarcodeFormatQR',
    messageEncoding: 'iso-8859-1',
  })

  pass.primaryFields.add({ key: 'guest', label: 'Guest', value: guest.name })
  pass.secondaryFields.add({ key: 'event', label: 'Event', value: event.name })
  if (guest.tableNumber) pass.auxiliaryFields.add({ key: 'table', label: 'Table', value: guest.tableNumber })

  return pass.getAsBuffer()
}

export async function generateGoogleWalletPassUrl(
  guest: Pick<Guest, 'id' | 'name' | 'tableNumber' | 'accessToken'>,
  event: Pick<Event, 'id' | 'name' | 'date'>,
  accessCard: Pick<AccessCard, 'qrToken'>,
): Promise<string> {
  requireEnv('GOOGLE_WALLET_CREDENTIALS')
  requireEnv('GOOGLE_WALLET_ISSUER_ID')

  const { google } = await import('googleapis')

  // Credentials must be the raw JSON string for a service account.
  const creds = JSON.parse(process.env.GOOGLE_WALLET_CREDENTIALS as string) as any
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID as string

  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  })

  // This is a pragmatic implementation that returns a Save URL for a generic pass.
  // Full template management should be configured per issuer in production.
  const walletobjects = google.walletobjects({ version: 'v1', auth })

  const objectId = `${issuerId}.${guest.id}`
  const classId = `${issuerId}.maison_doclar_generic`

  await walletobjects.genericobject
    .insert({
      requestBody: {
        id: objectId,
        classId,
        state: 'ACTIVE',
        heroImage: undefined,
        cardTitle: { defaultValue: { language: 'en-GB', value: event.name } },
        subheader: { defaultValue: { language: 'en-GB', value: 'Guest' } },
        header: { defaultValue: { language: 'en-GB', value: guest.name } },
        textModulesData: [
          ...(guest.tableNumber ? [{ id: 'table', header: 'Table', body: guest.tableNumber }] : []),
          { id: 'token', header: 'QR Token', body: accessCard.qrToken },
        ],
        barcode: { type: 'QR_CODE', value: accessCard.qrToken },
      },
    })
    .catch(() => {
      // If object already exists, ignore.
    })

  // "Add to Google Wallet" Save URL pattern.
  // The API supports JWT save URLs; here we return a deep-link to the object.
  return `https://pay.google.com/gp/v/save/${encodeURIComponent(objectId)}`
}

