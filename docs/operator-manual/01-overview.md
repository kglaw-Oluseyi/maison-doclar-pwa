# Maison Doclar OS — Operator Manual Overview

This manual describes how to operate the Maison Doclar PWA and its operator dashboard in a production setting. The dashboard is designed for fast, low-friction changes during busy event timelines, while still keeping data consistent and auditable. As an operator, your responsibility is to keep the guest experience clear and calm, keep staff tools reliable, and ensure that all changes are deliberate and reversible when possible. The platform is built around a single concept: an **Event**. Everything you see in the dashboard is scoped to an event slug, and every guest action on the portal is tied to that event.

## What you control

Operators typically control four layers:

- **Design system**: Colors and fonts that shape the guest-facing portal. This is not a “theme switcher” but a small, consistent token set. Consistency matters more than novelty; avoid rapid changes close to event day.
- **Content cards**: The portal is composed of cards (RSVP, venue, itinerary, contacts, concierge, chatbot, polling, access pass). Operators decide which cards appear, their order, and key configuration (for example, whether RSVP is native or handled by an external form).
- **Lifecycle**: Events progress through statuses from draft to published and beyond. Status gating prevents guests from seeing incomplete experiences and enables a post-event experience.
- **Operational tooling**: Guests, groups, media assets, exports, logs, and integrations. These surfaces exist to support real-world operations like catering, accessibility, arrival flow, and concierge service.

## Where to start for a new event

If you are creating an event from scratch, the recommended order is:

1. **Create the event** with the wizard and verify the slug is correct. Slugs are public-facing, so keep them clean and stable.
2. **Set dates and timezone** early. Timezone affects how dates render across the portal and host views. If you change timezone later, double-check the displayed date/time on guest and host surfaces.
3. **Upload an icon and media**. Icons matter for installability and home screen presentation. Media matters for the guest’s perception of polish.
4. **Set up guests**. Add guests individually or import via CSV. Confirm QR access passes exist for every guest and release them when you are ready.
5. **Configure cards and copy**. Make sure guests can immediately find what they need: venue, time, RSVP, and contact channels.
6. **Run the PWA deployment checks**. Publishing without passing checks is discouraged because it creates brittle installs and offline failures.

## Understanding roles: operator vs host

The operator dashboard is the authoritative control plane. Host users are delegated access for a narrower “command center” view, usually used on event day. Hosts should not be asked to manage configuration or bulk data. Instead, operators grant host access and define what a host can see via **view configuration**. The platform includes a live host preview to validate host configuration without needing to log in as a host.

## Data integrity and “production habits”

The system prefers **explicit actions** over hidden automation. If you import guests, verify the preview step carefully before committing. If you regenerate QR codes, understand that old tokens will no longer validate. If you revoke API keys, understand that connected systems will immediately lose access. When in doubt, make one change at a time and re-check the corresponding surface (guest portal, host dashboard, exports, and logs).

Finally, remember that great production operations are as much about communication as tooling. When making changes that affect guests (publishing, changing RSVP flow, enabling post-event feedback, editing contact channels), coordinate with the event lead so guest messaging stays consistent across channels.

