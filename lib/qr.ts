import QRCode from 'qrcode'

export async function generateQrDataUrl(token: string): Promise<string> {
  return await QRCode.toDataURL(token, {
    width: 280,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFF0',
    },
    errorCorrectionLevel: 'H',
  })
}

export async function generateQrSvgString(token: string): Promise<string> {
  return await QRCode.toString(token, {
    type: 'svg',
    width: 280,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFF0',
    },
    errorCorrectionLevel: 'H',
  })
}

export function generateQrToken(): string {
  return crypto.randomUUID()
}

