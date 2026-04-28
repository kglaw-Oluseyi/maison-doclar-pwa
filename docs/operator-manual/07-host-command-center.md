# Host command center: delegated control for event day

Hosts are the people running the room: the door team, the floor manager, or the on-site coordinator. They need a focused interface that provides clarity without exposing full operator complexity. The host command center is built for this purpose. It surfaces the most useful event-day information—arrivals, RSVP progress, outstanding requests, and guest details—while remaining fast and readable on mobile devices.

## Why host access is separate

Operator tools are powerful: they allow editing event settings, importing guests, generating passes, and changing lifecycle status. Hosts should not be asked to carry that cognitive load, especially under time pressure. Host access is a controlled view that:

- Reduces the chance of accidental configuration changes
- Keeps the interface calm and “task oriented”
- Enables fast decisions at the door and on the floor

## Creating host users

Hosts are created per event. Each host user has an email and password, plus an associated role label. Use meaningful role names (“Door Lead”, “Floor Manager”) rather than generic labels. Create only the host accounts you need, and delete temporary accounts after the event. Passwords should be at least eight characters; auto-generation is recommended for speed and uniqueness.

## View configuration: controlling the host’s surface

The host dashboard is modular. You can enable or disable sections based on role:

- **Stats bar**: useful for leadership and planning; often not needed for door staff.
- **Arrival feed**: essential at entry and helpful for VIP awareness.
- **Guest list**: useful for staff handling exceptions and seating coordination.
- **Dietary & accessibility summary**: useful for floor managers and catering coordination.
- **Outstanding requests**: useful for concierge leads; may distract door staff.
- **Awaiting response list**: useful pre-event; typically less useful once doors open.
- **Export button**: generally operator-only; enable only if hosts are trusted to export.
- **VIP alerts**: recommended when VIP handling matters operationally.
- **Post-event summary**: useful after the event for wrap-up.

This configuration is not a permissions system for every action, but it is an effective “attention filter.” The goal is to show hosts the minimum surface required to do their job well.

## Live preview and safe iteration

The dashboard includes a live preview of the host experience. Preview is powered by mock data that updates in real time as you toggle view configuration. This is intentional: you can validate layout and content density without logging in as a host, and without risk of triggering real APIs or modifying event data. Use preview as your primary tool for dialing in host UI.

## Event-day operating guidance for hosts

If you are training hosts, the recommended usage pattern is:

1. Start on the arrival feed to confirm the scanner is functioning and arrivals are being recorded.
2. Use the guest list only for exceptions (guest without phone, token mismatch, name spelling).
3. Watch outstanding requests and VIP alerts only if you have staffing to act on them.
4. Keep the interface open and avoid switching contexts frequently.

Hosts should also know how to handle the most common edge cases:

- **Guest cannot find pass**: use manual lookup, confirm identity, check in manually.
- **Guest appears twice**: verify email, check if a plus-one or duplicate record exists.
- **Guest already checked in**: treat as possible re-entry or token sharing; escalate if needed.

## Post-event handoff

After the event, hosts should hand off operational notes to the operator team: unresolved requests, any identity anomalies, VIP arrival times, or incidents at entry. Operators can then use exports and logs to produce final reporting. The host command center is the “front line” interface, and the operator dashboard is the “system of record.”

Used together, these surfaces create a clear division of responsibility: hosts manage the moment; operators manage the system.

