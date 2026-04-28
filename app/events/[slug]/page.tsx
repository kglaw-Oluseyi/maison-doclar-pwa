import * as React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { prisma } from '@/lib/prisma'

import { EventShell } from '@/components/event/EventShell'
import { EventHero } from '@/components/event/EventHero'
import { RSVPCard } from '@/components/event/RSVPCard'
import { EventDetailsCard } from '@/components/event/EventDetailsCard'
import { VenueCard } from '@/components/event/VenueCard'
import { ItineraryCard, type ItineraryBlock } from '@/components/event/ItineraryCard'
import { ContactsCard, type Contact } from '@/components/event/ContactsCard'
import { SaveToCalendarButton } from '@/components/event/SaveToCalendarButton'
import { Card } from '@/components/ui/Card'
import { PwaOrchestrator } from '@/components/pwa/PwaOrchestrator'
import { AccessPassCard } from '@/components/qr/AccessPassCard'
import { RemindersSection } from '@/components/concierge/RemindersSection'
import { ChatbotCard } from '@/components/concierge/ChatbotCard'
import { PollingCard } from '@/components/concierge/PollingCard'
import { GuestRequestCard } from '@/components/concierge/GuestRequestCard'
import { DraftEventPage } from '@/components/event/DraftEventPage'
import { PostEventShell } from '@/components/event/PostEventShell'

type DesignConfig = Record<string, unknown>

function parseJsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

type PageProps = {
  params: { slug: string }
  searchParams: { token?: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, designConfig: true },
  })
  if (!event) return {}

  const config = event.designConfig as Record<string, unknown>
  const palette = (config?.palette ?? {}) as Record<string, string>

  return {
    title: event.name,
    description: event.description ?? event.name,
    other: {
      'theme-color': palette.accent ?? '#B79F85',
    },
    manifest: `/events/${params.slug}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: event.name,
    },
  }
}

function AccessDenied() {
  return (
    <div className="min-h-[100svh] bg-md-background text-md-text-primary">
      <div className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col justify-center px-6 py-12">
        <div className="text-center">
          <div className="font-[family-name:var(--md-font-heading)] text-4xl font-light text-md-accent">
            Maison Doclar
          </div>
          <div className="mx-auto mt-5 h-px w-10 bg-md-accent" />
          <div className="mt-6 font-[family-name:var(--md-font-heading)] text-2xl font-light">
            Access denied
          </div>
          <div className="mt-3 text-sm text-md-text-muted">
            This link may be invalid or expired. Please contact the event organiser for assistance.
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function EventPortalPage(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { slug } = await props.params
  const { token } = await props.searchParams

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      timezone: true,
      date: true,
      endDate: true,
      location: true,
      address: true,
      coordinates: true,
      dressCode: true,
      description: true,
      rsvpOpen: true,
      itinerary: true,
      contacts: true,
      whatsappNumber: true,
      whatsappTemplate: true,
      designConfig: true,
      contentConfig: true,
      featureFlags: true,
      postEventConfig: true,
      pwaConfig: { select: { installHeadline: true, installBody: true } },
    },
  })

  if (!event) notFound()
  if (!token) return <AccessDenied />

  // Block DRAFT events from guest access
  if (event.status === 'DRAFT') {
    return <DraftEventPage />
  }

  const guest = await prisma.guest.findFirst({
    where: { accessToken: token, eventId: event.id },
    select: {
      id: true,
      name: true,
      rsvpStatus: true,
      rsvpDetails: true,
      tableNumber: true,
      dietaryNotes: true,
      tags: true,
      isPa: true,
      managedGuestId: true,
      groupId: true,
      accessCard: {
        select: {
          qrToken: true,
          releasedAt: true,
          invalidatedAt: true,
        },
      },
    },
  })

  if (!guest) return <AccessDenied />

  const flags = (event.featureFlags ?? {}) as Record<string, unknown>
  const isPostEvent =
    (event.status === 'CONCLUDED' || event.status === 'ARCHIVED') && flags.postEventEnabled === true
  if (isPostEvent) {
    return (
      <PostEventShell
        event={event as any}
        guest={{ ...(guest as any), accessToken: token, tableNumber: guest.tableNumber, tags: guest.tags, accessCard: guest.accessCard }}
      />
    )
  }

  const itinerary = parseJsonArray<ItineraryBlock>(event.itinerary)
  const contacts = parseJsonArray<Contact>(event.contacts)
  const designConfig = parseJsonObject(event.designConfig) as DesignConfig
  const contentConfig = parseJsonObject(event.contentConfig)

  const managedGuest =
    guest.isPa && guest.managedGuestId
      ? await prisma.guest.findUnique({
          where: { id: guest.managedGuestId },
          select: {
            id: true,
            name: true,
            rsvpStatus: true,
            rsvpDetails: true,
            tableNumber: true,
            dietaryNotes: true,
            tags: true,
            accessCard: {
              select: {
                qrToken: true,
                releasedAt: true,
                invalidatedAt: true,
              },
            },
          },
        })
      : null

  const portalGuest = guest.isPa && managedGuest ? managedGuest : guest

  const chatbotUrl = typeof contentConfig.chatbotUrl === 'string' ? contentConfig.chatbotUrl : undefined
  const chatbotTitle = typeof contentConfig.chatbotTitle === 'string' ? contentConfig.chatbotTitle : undefined
  const pollingUrl = typeof contentConfig.pollingUrl === 'string' ? contentConfig.pollingUrl : undefined
  const pollingTitle = typeof contentConfig.pollingTitle === 'string' ? contentConfig.pollingTitle : undefined
  const requestFormEnabled = contentConfig.requestFormEnabled === true
  const requestFormTypes = Array.isArray(contentConfig.requestFormTypes)
    ? contentConfig.requestFormTypes.filter((t) => typeof t === 'string')
    : []

  return (
    <EventShell>
      {guest.isPa && managedGuest ? (
        <div
          style={{
            background: 'var(--md-surface-elevated)',
            borderBottom: '1px solid var(--md-border)',
            padding: '12px 24px',
            fontSize: '0.8rem',
            color: 'var(--md-text-muted)',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          Managing attendance for{' '}
          <span style={{ color: 'var(--md-text-primary)' }}>{managedGuest.name}</span>
        </div>
      ) : null}
      <EventHero
        eventName={event.name}
        eventDateISO={event.date.toISOString()}
        locationName={event.location}
        guestName={portalGuest.name}
        guestTags={portalGuest.tags}
      />

      <RSVPCard slug={slug} token={token} rsvpOpen={event.rsvpOpen} initialStatus={portalGuest.rsvpStatus} />

      <EventDetailsCard description={event.description} dressCode={event.dressCode} />

      <Card title="Calendar">
        <SaveToCalendarButton slug={slug} token={token} />
      </Card>

      <VenueCard location={event.location} address={event.address} coordinates={event.coordinates} />

      {itinerary.length ? <ItineraryCard items={itinerary} /> : null}

      {portalGuest.accessCard && portalGuest.accessCard.invalidatedAt === null ? (
        <AccessPassCard
          guestName={portalGuest.name}
          eventName={event.name}
          eventDate={event.date}
          timezone={typeof (event as any).timezone === 'string' ? ((event as any).timezone as string) : undefined}
          walletPassEnabled={flags.walletPassEnabled === true}
          accessToken={token}
          tableNumber={portalGuest.tableNumber}
          tags={portalGuest.tags}
          qrToken={portalGuest.accessCard.qrToken}
          releasedAt={portalGuest.accessCard.releasedAt}
        />
      ) : null}

      {contacts.length ? (
        <ContactsCard
          contacts={contacts}
          whatsappNumber={event.whatsappNumber}
          whatsappTemplate={event.whatsappTemplate}
          guestName={portalGuest.name}
          eventName={event.name}
        />
      ) : null}

      <RemindersSection token={token} eventSlug={slug} />

      {chatbotUrl ? (
        <ChatbotCard
          chatbotUrl={chatbotUrl}
          chatbotTitle={chatbotTitle ?? 'Concierge'}
          guestToken={token}
          eventSlug={slug}
        />
      ) : null}

      {pollingUrl ? (
        <PollingCard
          pollingUrl={pollingUrl}
          pollingTitle={pollingTitle ?? 'Live Polling'}
          guestToken={token}
          eventSlug={slug}
        />
      ) : null}

      <GuestRequestCard enabled={requestFormEnabled} enabledTypes={requestFormTypes} token={token} />

      <PwaOrchestrator
        slug={slug}
        eventId={event.id}
        guestId={guest.id}
        eventName={event.name}
        installHeadline={event.pwaConfig?.installHeadline ?? 'Save to your home screen'}
        installBody={event.pwaConfig?.installBody ?? 'Access your event guide instantly, even offline.'}
      />
    </EventShell>
  )
}

