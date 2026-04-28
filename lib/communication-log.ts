import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import type { CommunicationLogType } from '@prisma/client'

export async function logCommunication({
  guestId,
  eventId,
  type,
  channel,
  summary,
  metadata,
}: {
  guestId: string
  eventId: string
  type: CommunicationLogType
  channel?: string
  summary: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  await prisma.communicationLog.create({
    data: {
      guestId,
      eventId,
      type,
      channel: channel ?? null,
      summary,
      metadata: (metadata ?? {}) as Prisma.JsonObject,
    },
  })
}

