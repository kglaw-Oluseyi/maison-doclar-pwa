import { PrismaClient, RSVPStatus } from '@prisma/client'

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
      itinerary,
      contacts,
      whatsappNumber: '33798765432',
    },
    create: {
      slug: eventSlug,
      name: 'Maison Doclar Gala 2026',
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
      await prisma.guest.upsert({
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
        },
      })
    }),
  )
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

