# Check-in operations: QR scanning, manual check-in, and arrival confidence

Check-in is the highest-stakes operational surface on event day. The primary goal is to confirm that the right guest is arriving, mark them as arrived quickly, and keep the line moving. The system supports both QR scanning and manual check-in so that operations remain resilient even when devices, lighting, or connectivity create friction.

## QR scanning workflow

QR scanning is the default method because it is fast and reduces operator error. A guest’s access pass contains a token that can be validated at the door. When a QR code is scanned, the scanner provides layered micro-feedback: a viewfinder flash, audio tone, optional haptic feedback, and a toast notification that includes the guest identity. The camera feed remains visible, which helps staff keep the QR in frame and avoid disorientation.

If scanning works but detection is inconsistent, common causes include:

- **Lighting and glare**: glossy screens or low lighting can reduce contrast. Ask the guest to increase brightness.
- **Motion blur**: keep the phone steady and allow the scanner a fraction of a second to lock on.
- **Small QR size**: if the QR is tiny on screen, ask the guest to open the access pass full-screen.

## Manual check-in workflow

Manual check-in is critical for operational continuity when scanning fails. Use manual check-in when:

- The guest cannot access their pass due to battery or connectivity issues.
- The QR is damaged or displayed in a way the camera cannot read.
- A staff member is working from a printed list.

When checking in manually, verify at least two pieces of information (name and email, or name and table). Avoid relying on approximate matches when guests have similar names. If you have tags like `VIP`, use them as verification signals but do not treat tags as primary identity fields.

## Handling edge cases

### Duplicate or stale tokens

If QR regeneration is used, older tokens may no longer validate. This is intentional: regeneration revokes old tokens. If a guest presents an old QR, guide them to refresh their portal and access pass. If they cannot, use manual check-in and flag the issue for follow-up.

### Already checked in

If a scan indicates the guest is already checked in, do not re-check them in repeatedly. Instead, confirm if the guest truly left and returned, or if the QR was shared. In cases of suspected token sharing, escalate to the event lead; the system is an operational tool, but policy decisions belong to the lead.

### Accessibility and support

Some guests may require assistance at entry. Accessibility notes and special requests should be visible to operators and hosts as configured. Use this information discreetly. Operationally, it is best to greet the guest normally and direct staff support behind the scenes rather than making accessibility needs a public topic.

## Arrival feed and real-time awareness

The host command center may display an arrivals feed that updates periodically. This provides situational awareness: who arrived recently, whether VIP guests are present, and whether arrivals are clustering by table or group. As an operator, you should treat the feed as a “pulse,” not a ledger. The canonical record is the guest check-in state.

## Recommended event-day checks

Before doors open:

- Test the scanner on the actual device being used.
- Verify camera permissions and ensure the video feed is visible.
- Confirm network conditions if the environment relies on live updates.
- Ensure at least one device has access to the dashboard for manual overrides.

During doors:

- Prefer QR scanning when possible.
- Use manual check-in for exceptions and keep notes minimal but useful.
- Avoid changing configuration while the line is active unless absolutely required.

After peak arrivals:

- Review check-in counts against expected attendance.
- Export a final arrival list if the operations team needs it.

When check-in is smooth, guests feel welcomed and the event starts with confidence. The system is designed to help you achieve that calm, repeatable flow.

