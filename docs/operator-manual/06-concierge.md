# Concierge & requests: turning messages into outcomes

Concierge requests transform the portal from a static information page into a living service channel. Guests can submit structured requests (dietary changes, accessibility needs, plus-one questions, schedule clarifications) and operators can manage them in the dashboard. The key to a successful concierge workflow is treating requests as operational tasks with clear ownership and status.

## Request lifecycle and status

Requests move through a simple lifecycle:

- **PENDING**: newly submitted, not yet acknowledged.
- **ACKNOWLEDGED**: someone has seen it and is actively working on it.
- **RESOLVED**: the request has been fulfilled or closed with a decision.

The purpose of these statuses is not bureaucracy. Status is how you maintain calm under load. When requests pile up, the team should be able to answer, in seconds, “What’s still waiting?” and “What is being handled right now?”

## Writing operator notes

Operator notes are for internal coordination. They should be short, factual, and action-oriented. Good notes answer: what we decided, who is responsible, and what is next. Avoid writing anything that would be inappropriate if shared outside the team. If you need to capture sensitive details, prefer private operational channels rather than the request note field.

Example note patterns:

- “Confirmed vegan meal with catering; update guest record dietary notes.”
- “Plus-one request pending capacity check; follow up by 16:00.”
- “Accessibility request: reserved front-row seating; notify venue lead.”

## Plus-one overflow workflow

Guest groups allow controlled plus-one behavior. When a guest reaches the group limit, the portal can offer an overflow message and a one-tap path to submit a plus-one request. This is intentionally designed to prevent hard-blocking. Operationally, it moves additional capacity decisions into a clear queue where you can resolve them with context (venue capacity, catering constraints, VIP exceptions).

When resolving plus-one requests, the recommended workflow is:

1. Confirm whether capacity exists for the event.
2. If approved, create an additional guest record and connect them to the appropriate group where possible.
3. Release access passes once the plus-one is confirmed.
4. Mark the request as resolved with a note indicating the outcome.

## Reminders and receipts

The concierge layer may include reminders and reminder receipts. A reminder is an operator-defined message intended to drive a guest action (complete RSVP, review itinerary, confirm dietary requirements). A receipt is proof that a guest has interacted with a reminder. Reminders should be used sparingly; if every message is urgent, nothing feels urgent.

If a reminder is dismissed by a guest, it should collapse to a slim “read” state rather than disappearing entirely. This design avoids the anxiety of “did I miss something?” while still keeping the interface clean. Guests can re-expand a dismissed reminder if they need to refer back to it.

## Communication logs and auditability

Communication logs track critical touchpoints such as portal visits, RSVP submissions, QR regenerations, and request changes. Use logs to diagnose operational questions:

- Did the guest open their portal?
- Did they submit RSVP successfully?
- Was the QR regenerated multiple times?
- When was the request acknowledged?

Logs are not a replacement for human coordination, but they are invaluable when you need to reconstruct what happened during a busy window.

## Recommended concierge operating rhythm

For high-volume events, adopt a rhythm:

- **Triage**: scan pending requests, tag urgent items, acknowledge quickly.
- **Resolve**: complete actions in batches (catering updates, seating changes, transport coordination).
- **Close loop**: mark requests resolved and ensure guest-facing content is consistent with the decision.

Concierge is a service promise. When handled well, it increases guest trust and reduces last-minute chaos. When handled poorly, it becomes a source of noise. Use the platform’s structure to keep requests crisp, visible, and actionable.

