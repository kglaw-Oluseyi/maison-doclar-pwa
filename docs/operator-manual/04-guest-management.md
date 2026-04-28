# Guest management: accuracy, scale, and operational confidence

Guest data is the backbone of the system. Every access pass, RSVP, concierge request, and check-in is attached to a guest record. Because this data drives real-world decisions (seating, catering, accessibility preparation, security at entry), the primary goal of guest management is **accuracy**, not raw speed. The dashboard provides tooling for both small changes and large-scale imports, but the operator should treat guest edits as production changes.

## Creating and editing guests

You can add guests individually through the dashboard and edit them inline. Common fields include name, email, table number, tags, dietary notes, and accessibility notes. A few best practices:

- **Keep names guest-facing**: use capitalization and spelling that you want the guest to see on their pass and in communications.
- **Email is an identifier**: if the import flow uses upsert-by-email, a small typo can create duplicates. If you are unsure, search the guest list before adding.
- **Tags are operational signals**: use tags like `VIP`, `Press`, or `Staff` consistently. Avoid creating many near-duplicates (for example, `vip`, `VIP `, `Very Important`).
- **Notes are sensitive**: dietary and accessibility notes may contain health-related information. Record only what is needed for the event.

## Bulk operations

Bulk selection enables actions like exporting a subset of guests or deleting multiple records. Bulk deletion is irreversible; use it only when you are confident that the selected guests are incorrect. Bulk export is useful for sharing targeted lists with operations teams (for example, only accepted guests at specific tables).

## CSV import workflow

Imports are intentionally multi-step:

1. **Upload**: select a CSV file and verify it is the correct version. If you have multiple drafts, rename files clearly (e.g., `gala-2026-final-guestlist.csv`).
2. **Map fields**: map CSV headers to system fields. Take time here; a wrong mapping will propagate errors across many guests.
3. **Preview and validation**: the wizard highlights missing names and invalid enumerations. Fix issues before importing, not after.
4. **Import**: the system upserts by email when available. This means the same file can be re-imported to apply corrections without duplicating guests, but only if email values are stable.

If the import returns an error report, download it and treat it as your to-do list. Resolve errors and re-import rather than manually editing dozens of rows; doing so reduces the chance of inconsistent state.

## Guest groups and plus-ones

Guest groups enable controlled plus-one behavior. A group has a maximum size and an overflow message. When configured, the RSVP experience allows guests to add group members up to the limit. When the limit is reached, the portal can guide the guest to submit a concierge request for an additional plus-one. This creates a clear operational workflow: guests are not blocked, but additional capacity is handled as an explicit operator decision.

Operationally, you should define group sizes early, because group rules affect RSVP data shape. If you adjust `maxSize` later, review the RSVP form behavior and ensure it still matches expectations.

## Portal visit tracking

If invitation tracking is enabled, the platform can record portal visit counts and first-visit timestamps. Treat this data as an approximate signal rather than a perfect measurement, because devices, privacy settings, and caching may affect the numbers. It is most useful to answer questions like “Have the VIP guests opened their portal?” or “Are invites being delivered?”

## Deleting guests: when and how

Deleting a guest removes associated access cards and related records. Only delete guests when you are certain they should not exist for the event. If a guest declines, do not delete them; a declined RSVP is still valuable operationally. If a guest record was created with an incorrect email or name, consider editing it instead of deleting, especially if a token has already been distributed. Deletion is best reserved for true duplicates or import mistakes.

With careful guest management, every downstream surface becomes easier: check-in becomes faster, host tools become calmer, and exports become accurate the first time.

