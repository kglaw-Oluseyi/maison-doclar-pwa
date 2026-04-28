# Content cards: designing the guest portal layout

The guest portal is assembled from a sequence of **content cards**. Cards are modular, reorderable blocks that each solve a single guest need: RSVP, venue address, itinerary, contact channels, concierge requests, a chatbot, polling, and an access pass. Operators configure which cards appear and in what order. This approach keeps the portal flexible without needing a custom page for every event.

## Principles for a good card layout

1. **Start with the essentials**: date, location, RSVP, and access pass. Guests should not scroll through optional features before finding what they need.
2. **One action per card**: keep each card’s main call-to-action obvious. Avoid multiple competing buttons inside a single card.
3. **Progressive disclosure**: cards that contain heavy content (iframes for a chatbot or a poll) should be collapsed by default and only load when expanded. This preserves performance and reduces distraction.
4. **Consistency across events**: repeat a familiar structure. Guests build habits; stable patterns reduce support burden.

## Reordering cards

The dashboard allows drag-and-drop reordering. When you reorder, you are changing the narrative of the portal. The most common, reliable order is:

- Event details / hero
- Venue
- RSVP
- Itinerary
- Contacts / WhatsApp
- Concierge requests
- Polling (if used)
- Chatbot (if used)
- Access pass

This is not the only valid order, but it matches typical guest intent: “Where is it?” → “Am I coming?” → “What’s the schedule?” → “How do I contact someone?” → “What do I show at the door?”

## Card-specific configuration

### RSVP card

RSVP can be run in native mode or routed to an external form. Native RSVP is recommended for operational reporting and for enabling guest groups. If you switch to an external RSVP flow (for example, a third-party form), you should clearly communicate to guests where their response is recorded and whether they will receive confirmation.

### WhatsApp and contacts

Contact channels should be configured with care. Provide a single, well-monitored number or email rather than multiple unstaffed endpoints. If you enable WhatsApp, confirm the number includes country code and test the link on mobile.

### Concierge requests

Concierge requests are most effective when you predefine request categories and respond quickly. The operator dashboard and host surfaces may surface outstanding requests. Treat concierge messages as time-sensitive operational signals, not general inquiries.

### Chatbot and polling

Chatbots and polls add engagement but can also introduce confusion if they appear too early. Keep both collapsed by default and load the iframe only when the guest expands the card. If you use a chatbot, ensure its title and description clarify its scope (“Ask questions about venue, schedule, dress code”). For polling, keep prompts short and avoid polls that would create disappointment if the outcome cannot be honored.

### Access pass

The access pass is a guest’s “ticket.” Ensure it is present and visually stable. If wallet passes are enabled, confirm the wallet buttons behave correctly in your environment and that you have communicated whether wallet passes are optional or required.

## How content cards relate to features

Cards are the “layout layer,” while **feature flags** are the “capability layer.” A card can be enabled but still constrained by feature flags. For example, you may have an access pass card visible while wallet pass generation is disabled. Keep this distinction in mind: if a card is present but missing functionality, the fix may be in the features panel rather than the content card configuration itself.

When you adjust card layout, always verify the portal on mobile dimensions. The portal is a PWA-first experience. A layout that feels spacious on desktop can be cramped and confusing on a phone. A final, practical tip: after major card changes, run through the portal as a guest would, starting from a fresh browser session, to confirm that the initial view is calm and obvious.

