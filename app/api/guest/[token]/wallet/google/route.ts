'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { WalletNotConfiguredError, generateGoogleWalletPassUrl } from '@/lib/wallet'
import { logCommunication } from '@/lib/communication-log'

function asFlags(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params

  const guest = await prisma.guest.findFirst({
    where: { accessToken: token },
    select: {
      id: true,
      name: true,
      tableNumber: true,
      accessToken: true,
      event: { select: { id: true, name: true, date: true, featureFlags: true } },
      accessCard: { select: { qrToken: true } },
    },
  })
  if (!guest || !guest.accessCard) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const flags = asFlags(guest.event.featureFlags)
  if (flags.walletPassEnabled !== true) return NextResponse.json({ error: 'Wallet passes disabled' }, { status: 409 })

  try {
    const url = await generateGoogleWalletPassUrl(guest as any, guest.event as any, guest.accessCard as any)

    try {
      void logCommunication({
        guestId: guest.id,
        eventId: guest.event.id,
        type: 'WALLET_PASS_GENERATED',
        channel: 'IN_APP',
        summary: 'Google Wallet pass generated',
        metadata: { platform: 'google' },
      })
    } catch {
      // ignore
    }

    return NextResponse.redirect(url)
  } catch (err: unknown) {
    if (err instanceof WalletNotConfiguredError) {
      return NextResponse.json(
        { error: 'Wallet passes not configured', code: 'WALLET_NOT_CONFIGURED' },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: 'Failed to generate pass' }, { status: 500 })
  }
}

