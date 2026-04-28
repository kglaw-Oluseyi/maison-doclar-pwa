# Event lifecycle: Draft → Published → Live → Concluded → Archived

The event lifecycle exists to protect guests from partial setups and to support operational phases that change over time. A single configuration rarely fits the entire timeline: in early planning, you are collecting RSVPs; on event day, you are managing arrivals; afterward, you may want to show a thank-you message, gallery, and feedback form. Lifecycle status is the mechanism that gates what the portal renders and which operational tools are active.

## Status meanings

- **DRAFT**: Private build phase. Use this status while the portal is incomplete, the guest list is being prepared, and content is still changing frequently. Guests should not rely on this portal yet.
- **PUBLISHED**: Publicly shareable portal. Publishing indicates the experience is stable enough to distribute. At this stage you typically begin sending invitations or releasing access passes.
- **LIVE**: Event-day mode. LIVE is intended for the period when arrivals and check-ins are operationally critical. Host command center usage typically peaks here.
- **CONCLUDED**: Event has ended. This status can activate the post-event shell (thank you message, gallery, feedback, follow-ups) depending on configuration and activation timing.
- **ARCHIVED**: Event is closed out. Use this when the event is no longer operationally active. Archiving is a way to reduce accidental edits and keep focus on current events.

## Transition rules and why they matter

Status transitions are designed to be **forward-only**. This prevents accidental “rewinds” that would confuse guests or invalidate downstream expectations. For example, if guests have installed the PWA while the event is PUBLISHED or LIVE, returning to DRAFT would be unexpected and could break trust. Forward-only transitions also simplify auditability: when something changes, you can reason about the direction of travel.

When moving into **CONCLUDED**, the platform may set a post-event activation timestamp automatically if one is not configured. This prevents the post-event experience from being gated indefinitely. However, you should still review the post-event configuration before concluding the event, especially if you plan to collect feedback.

## Recommended operator workflow by phase

### Draft phase checklist

- Confirm event name, slug, date, and timezone.
- Configure design tokens and the content card layout.
- Import or add guests and validate that each guest has an access pass.
- Upload the master icon and verify installability previews.
- Run pre-deploy checks and resolve failures early (manifest, service worker, offline page).

### Published phase checklist

- Release access passes when you are ready for guests to receive them.
- Verify RSVP flow end-to-end using at least one test guest.
- Validate venue, itinerary, and contact details for correctness and clarity.
- Ensure concierge routes are functional if you are enabling requests.

### Live phase checklist

- Confirm check-in tools are online (QR and manual).
- Ensure host users exist and view config matches operational needs.
- Keep changes minimal. If you must edit content or design, prefer small, reversible changes.
- Monitor communication logs and arrivals feeds for anomalies (for example, repeated QR regenerations).

### Concluded/Archived phase checklist

- Activate post-event shell when appropriate. Ensure thank-you copy is final, gallery assets are ready, and feedback questions are reviewed.
- Export final reports (guest list, dietary, accessibility, check-in summary) for internal wrap-up.
- Revoke unused API keys and remove temporary host users created for the event.
- Archive the event once all operational work is complete.

Lifecycle status is not a cosmetic label. It is an operational contract that tells guests and staff what to expect. Treat transitions as deliberate milestones, and make sure every transition is accompanied by a quick verification of the guest portal and host views.

