import * as React from 'react'
import { notFound } from 'next/navigation'

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

type DesignConfig = Record<string, unknown>

function parseJsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}
  return value as Record<string, unknown>
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
      designConfig: true,
    },
  })

  if (!event) notFound()
  if (!token) return <AccessDenied />

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
    },
  })

  if (!guest) return <AccessDenied />

  const itinerary = parseJsonArray<ItineraryBlock>(event.itinerary)
  const contacts = parseJsonArray<Contact>(event.contacts)
  const designConfig = parseJsonObject(event.designConfig) as DesignConfig

  return (
    <EventShell>
      <EventHero
        eventName={event.name}
        eventDateISO={event.date.toISOString()}
        locationName={event.location}
        guestName={guest.name}
        guestTags={guest.tags}
      />

      <RSVPCard slug={slug} token={token} rsvpOpen={event.rsvpOpen} initialStatus={guest.rsvpStatus} />

      <EventDetailsCard description={event.description} dressCode={event.dressCode} />

      <Card title="Calendar">
        <SaveToCalendarButton slug={slug} token={token} />
      </Card>

      <VenueCard location={event.location} address={event.address} coordinates={event.coordinates} />

      {itinerary.length ? <ItineraryCard items={itinerary} /> : null}

      {contacts.length ? (
        <ContactsCard
          contacts={contacts}
          whatsappNumber={event.whatsappNumber}
          guestName={guest.name}
          eventName={event.name}
        />
      ) : null}
    </EventShell>
  )
}

