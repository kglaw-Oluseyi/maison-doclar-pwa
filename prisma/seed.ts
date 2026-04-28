import { PrismaClient, RSVPStatus } from '@prisma/client'

import { hashPassword } from '../lib/host-auth'

const prisma = new PrismaClient()

type DesignConfig = {
  tokens: Record<string, string>
}

type ItineraryBlock = {
  time: string
  title: string
  detail?: string
}

type Contact = {
  role: 'Event Coordinator' | 'Concierge'
  name: string
  phone: string
  email?: string
}

async function main() {
  const eventSlug = 'maison-doclar-gala-2026'

  const designConfig: DesignConfig = {
    tokens: {
      '--md-background': '#000000',
      '--md-surface': '#0a0a0a',
      '--md-surface-elevated': '#111111',
      '--md-text-primary': '#FFFFF0',
      '--md-text-muted': '#888888',
      '--md-text-subtle': '#444444',
      '--md-accent': '#B79F85',
      '--md-accent-light': '#D4BFA0',
      '--md-accent-dark': '#8A7260',
      '--md-border': '#1e1e1e',
      '--md-border-muted': '#2a2a2a',
      '--md-error': '#E05252',
      '--md-success': '#52A080',
      '--md-warning': '#C4933F',
      '--md-font-heading': "'Cormorant Garamond', Georgia, serif",
      '--md-font-body': "'Inter', system-ui, sans-serif",
    },
  }

  const itinerary: ItineraryBlock[] = [
    { time: '18:30', title: 'Arrival & Welcome Champagne', detail: 'Coat check and garden reception' },
    { time: '19:15', title: 'Opening Remarks', detail: 'Grand salon — Maison Doclar' },
    { time: '19:30', title: 'Dinner Service', detail: 'Three-course tasting menu' },
    { time: '21:45', title: 'Live Quartet & Dancing', detail: 'Salon floor opens' },
  ]

  const contacts: Contact[] = [
    { role: 'Event Coordinator', name: 'Amélie Laurent', phone: '+33 6 12 34 56 78', email: 'amelie@maisondoclar.com' },
    { role: 'Concierge', name: 'Julien Moreau', phone: '+33 7 98 76 54 32' },
  ]

  const event = await prisma.event.upsert({
    where: { slug: eventSlug },
    update: {
      name: 'Maison Doclar Gala 2026',
      status: 'CONCLUDED',
      timezone: 'Europe/Paris',
      date: new Date('2026-03-14T18:30:00.000Z'),
      endDate: new Date('2026-03-14T23:30:00.000Z'),
      location: 'Hôtel de Ville — Grand Salon',
      address: 'Place de l’Hôtel de Ville, 75004 Paris, France',
      coordinates: '48.856614,2.3522219',
      dressCode: 'Black tie — evening elegance',
      description:
        'An evening of ceremony, dining, and music in celebration of Maison Doclar. Please arrive promptly to enjoy the welcome reception.',
      rsvpOpen: true,
      designConfig,
      contentConfig: {
        chatbotUrl: 'https://example.com/concierge-chat',
        chatbotTitle: 'Concierge',
        pollingUrl: 'https://example.com/live-polling',
        pollingTitle: 'Live Polling',
        requestFormEnabled: true,
        requestFormTypes: ['DIETARY', 'TRANSPORT', 'ACCESSIBILITY', 'PLUS_ONE', 'GENERAL'],
      },
      featureFlags: {
        walletPassEnabled: true,
        postEventEnabled: true,
        communicationLogEnabled: true,
        guestGroupsEnabled: true,
        invitationTrackingEnabled: true,
        dietaryExportEnabled: true,
        accessibilityExportEnabled: true,
        feedbackFormEnabled: true,
      },
      postEventConfig: {
        thankYouMessage: 'Thank you for joining us.',
        thankYouSubtext: 'Your presence made the evening unforgettable.',
        galleryEnabled: true,
        galleryImages: [
          'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80',
        ],
        feedbackEnabled: true,
        feedbackQuestions: [
          { id: 'q1', question: 'How was your overall experience?', type: 'rating' },
          { id: 'q2', question: 'Any notes for next year?', type: 'text' },
        ],
        followUpLinks: [{ label: 'Maison Doclar', url: 'https://maisondoclar.com' }],
        activatesAt: new Date().toISOString(),
      },
      itinerary,
      contacts,
      whatsappNumber: '33798765432',
    },
    create: {
      slug: eventSlug,
      name: 'Maison Doclar Gala 2026',
      status: 'CONCLUDED',
      timezone: 'Europe/Paris',
      date: new Date('2026-03-14T18:30:00.000Z'),
      endDate: new Date('2026-03-14T23:30:00.000Z'),
      location: 'Hôtel de Ville — Grand Salon',
      address: 'Place de l’Hôtel de Ville, 75004 Paris, France',
      coordinates: '48.856614,2.3522219',
      dressCode: 'Black tie — evening elegance',
      description:
        'An evening of ceremony, dining, and music in celebration of Maison Doclar. Please arrive promptly to enjoy the welcome reception.',
      rsvpOpen: true,
      designConfig,
      contentConfig: {
        chatbotUrl: 'https://example.com/concierge-chat',
        chatbotTitle: 'Concierge',
        pollingUrl: 'https://example.com/live-polling',
        pollingTitle: 'Live Polling',
        requestFormEnabled: true,
        requestFormTypes: ['DIETARY', 'TRANSPORT', 'ACCESSIBILITY', 'PLUS_ONE', 'GENERAL'],
      },
      featureFlags: {
        walletPassEnabled: true,
        postEventEnabled: true,
        communicationLogEnabled: true,
        guestGroupsEnabled: true,
        invitationTrackingEnabled: true,
        dietaryExportEnabled: true,
        accessibilityExportEnabled: true,
        feedbackFormEnabled: true,
      },
      postEventConfig: {
        thankYouMessage: 'Thank you for joining us.',
        thankYouSubtext: 'Your presence made the evening unforgettable.',
        galleryEnabled: true,
        galleryImages: [
          'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80',
        ],
        feedbackEnabled: true,
        feedbackQuestions: [
          { id: 'q1', question: 'How was your overall experience?', type: 'rating' },
          { id: 'q2', question: 'Any notes for next year?', type: 'text' },
        ],
        followUpLinks: [{ label: 'Maison Doclar', url: 'https://maisondoclar.com' }],
        activatesAt: new Date().toISOString(),
      },
      itinerary,
      contacts,
      whatsappNumber: '33798765432',
    },
  })

  await prisma.pwaConfig.upsert({
    where: { eventId: event.id },
    update: {
      installHeadline: 'Save to your home screen',
      installBody: 'Access your event guide instantly, even offline.',
      screenshotApproved: false,
    },
    create: {
      eventId: event.id,
      installHeadline: 'Save to your home screen',
      installBody: 'Access your event guide instantly, even offline.',
      screenshotApproved: false,
    },
  })

  const guests = [
    {
      accessToken: '11111111-1111-1111-1111-111111111111',
      qrToken: 'qr-11111111-1111-1111-1111-111111111111',
      name: 'Sofia Beaumont',
      email: 'sofia.beaumont@example.com',
      rsvpStatus: RSVPStatus.ACCEPTED,
      rsvpDetails: { plusOneName: 'Étienne Beaumont', dietaryRequirements: '', message: 'Looking forward to the evening.' },
      tags: ['VIP'],
      tableNumber: 'A1',
      dietaryNotes: null,
      specialNotes: 'Prefers aisle seating.',
    },
    {
      accessToken: '22222222-2222-2222-2222-222222222222',
      qrToken: 'qr-22222222-2222-2222-2222-222222222222',
      name: 'Noah Lambert',
      email: 'noah.lambert@example.com',
      rsvpStatus: RSVPStatus.ACCEPTED,
      rsvpDetails: { plusOneName: '', dietaryRequirements: 'No shellfish', message: '' },
      tags: [],
      tableNumber: 'B3',
      dietaryNotes: 'No shellfish',
      specialNotes: null,
    },
    {
      accessToken: '33333333-3333-3333-3333-333333333333',
      qrToken: 'qr-33333333-3333-3333-3333-333333333333',
      name: 'Camille Durand',
      email: 'camille.durand@example.com',
      rsvpStatus: RSVPStatus.DECLINED,
      rsvpDetails: { message: 'Unfortunately out of town that weekend.' },
      tags: ['Press'],
      tableNumber: null,
      dietaryNotes: null,
      specialNotes: null,
    },
    {
      accessToken: '44444444-4444-4444-4444-444444444444',
      qrToken: 'qr-44444444-4444-4444-4444-444444444444',
      name: 'Luca Moretti',
      email: 'luca.moretti@example.com',
      rsvpStatus: RSVPStatus.PENDING,
      rsvpDetails: {},
      tags: [],
      tableNumber: null,
      dietaryNotes: null,
      specialNotes: 'May arrive late due to travel.',
    },
    {
      accessToken: '55555555-5555-5555-5555-555555555555',
      qrToken: 'qr-55555555-5555-5555-5555-555555555555',
      name: 'Aisha Khan',
      email: 'aisha.khan@example.com',
      rsvpStatus: RSVPStatus.PENDING,
      rsvpDetails: {},
      tags: ['Partner'],
      tableNumber: null,
      dietaryNotes: null,
      specialNotes: null,
    },
  ] as const

  await Promise.all(
    guests.map(async (g) => {
      const guest = await prisma.guest.upsert({
        where: { accessToken: g.accessToken },
        update: {
          eventId: event.id,
          name: g.name,
          email: g.email,
          rsvpStatus: g.rsvpStatus,
          rsvpDetails: g.rsvpDetails,
          tags: [...g.tags],
          tableNumber: g.tableNumber,
          dietaryNotes: g.dietaryNotes,
          specialNotes: g.specialNotes,
          invitedAt: g.accessToken === guests[0].accessToken ? new Date() : null,
          invitationChannel: g.accessToken === guests[0].accessToken ? 'MANUAL' : null,
          accessibilityNotes: null,
        },
        create: {
          eventId: event.id,
          accessToken: g.accessToken,
          name: g.name,
          email: g.email,
          rsvpStatus: g.rsvpStatus,
          rsvpDetails: g.rsvpDetails,
          tags: [...g.tags],
          tableNumber: g.tableNumber,
          dietaryNotes: g.dietaryNotes,
          specialNotes: g.specialNotes,
          invitedAt: g.accessToken === guests[0].accessToken ? new Date() : null,
          invitationChannel: g.accessToken === guests[0].accessToken ? 'MANUAL' : null,
          accessibilityNotes: null,
        },
      })

      await prisma.accessCard.upsert({
        where: { guestId: guest.id },
        update: {
          eventId: event.id,
          qrToken: g.qrToken,
          releasedAt: new Date(),
          invalidatedAt: null,
        },
        create: {
          guestId: guest.id,
          eventId: event.id,
          qrToken: g.qrToken,
          releasedAt: new Date(),
        },
      })
    }),
  )

  const firstGuest = await prisma.guest.findFirst({ where: { eventId: event.id }, orderBy: { createdAt: 'asc' } })
  if (!firstGuest) return

  const group = await prisma.guestGroup.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {
      eventId: event.id,
      name: 'Primary Group',
      primaryGuestId: firstGuest.id,
      maxSize: 3,
      overflowMessage: 'Need to add more guests? Send us a message through the app.',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      eventId: event.id,
      name: 'Primary Group',
      primaryGuestId: firstGuest.id,
      maxSize: 3,
      overflowMessage: 'Need to add more guests? Send us a message through the app.',
    },
  })

  await prisma.guest.update({
    where: { id: firstGuest.id },
    data: { groupId: group.id },
  })

  const dressCodeScheduledAt = new Date(event.date.getTime() - 7 * 24 * 60 * 60 * 1000)
  const scheduleScheduledAt = new Date(event.date.getTime() - 24 * 60 * 60 * 1000)

  const dressCodeReminder = await prisma.reminder.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000001',
    },
    update: {
      eventId: event.id,
      type: 'DRESS_CODE',
      title: 'Dress Code',
      content: 'Black tie — evening elegance. Consider a light wrap for the garden reception.',
      scheduledAt: dressCodeScheduledAt,
      channel: 'IN_APP',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      eventId: event.id,
      type: 'DRESS_CODE',
      title: 'Dress Code',
      content: 'Black tie — evening elegance. Consider a light wrap for the garden reception.',
      scheduledAt: dressCodeScheduledAt,
      channel: 'IN_APP',
    },
  })

  await prisma.reminder.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000002',
    },
    update: {
      eventId: event.id,
      type: 'SCHEDULE',
      title: 'Tomorrow',
      content: 'Arrival begins at 18:30. Please arrive promptly to enjoy the welcome reception.',
      scheduledAt: scheduleScheduledAt,
      channel: 'IN_APP',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      eventId: event.id,
      type: 'SCHEDULE',
      title: 'Tomorrow',
      content: 'Arrival begins at 18:30. Please arrive promptly to enjoy the welcome reception.',
      scheduledAt: scheduleScheduledAt,
      channel: 'IN_APP',
    },
  })

  await prisma.guestRequest.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000003',
    },
    update: {
      guestId: firstGuest.id,
      eventId: event.id,
      type: 'DIETARY',
      message: 'I have a severe nut allergy not previously noted.',
      status: 'PENDING',
      operatorNote: null,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      guestId: firstGuest.id,
      eventId: event.id,
      type: 'DIETARY',
      message: 'I have a severe nut allergy not previously noted.',
      status: 'PENDING',
    },
  })

  const hostPasswordHash = await hashPassword('maison-host-2026')
  await prisma.hostUser.upsert({
    where: { email: 'host@maisondoclar.com' },
    update: {
      eventId: event.id,
      name: 'Isabelle Fontaine',
      passwordHash: hostPasswordHash,
      role: 'HOST',
      viewConfig: {
        showStatsBar: true,
        showArrivalFeed: true,
        showGuestList: true,
        showDietaryAccessibilitySummary: true,
        showOutstandingRequests: true,
        showAwaitingResponseList: true,
        showExportButton: true,
        showRsvpDetails: true,
        showVipAlerts: true,
        showPostEventSummary: true,
        eventDayModeAutoSwitch: true,
      },
    },
    create: {
      eventId: event.id,
      email: 'host@maisondoclar.com',
      name: 'Isabelle Fontaine',
      passwordHash: hostPasswordHash,
      role: 'HOST',
      viewConfig: {
        showStatsBar: true,
        showArrivalFeed: true,
        showGuestList: true,
        showDietaryAccessibilitySummary: true,
        showOutstandingRequests: true,
        showAwaitingResponseList: true,
        showExportButton: true,
        showRsvpDetails: true,
        showVipAlerts: true,
        showPostEventSummary: true,
        eventDayModeAutoSwitch: true,
      },
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (err: unknown) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })

