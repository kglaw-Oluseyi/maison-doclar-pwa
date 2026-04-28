# Troubleshooting: diagnosing issues quickly under pressure

Production operations are rarely quiet. When something breaks, the goal is not to find the perfect explanation; it is to restore a working flow with minimal guest impact. This guide lists common issues and the fastest, safest responses. When troubleshooting, prefer reversible changes and avoid making multiple configuration edits at once.

## Guests report “page not loading” or “blank screen”

Start with the basics:

- Confirm the correct event URL and slug.
- Ask the guest to refresh or reopen the link.
- Test the portal yourself on a separate device or in a private browsing session.

If the portal is down for everyone, check whether the server is reachable and whether the event has been published. Draft events should not be distributed. If the portal is reachable but content is missing, review content card configuration and confirm that at least one card is enabled.

## PWA install issues

If guests cannot install:

- Confirm icons are uploaded and manifest preview is valid.
- Run the pre-deploy checklist and ensure manifest and service worker return HTTP 200.
- On iOS, remind guests that installation is typically done via Share → “Add to Home Screen.”

If icons show as broken squares, the icon paths may be missing. Re-upload the master icon and verify that `192` and `512` previews render in the dashboard. Avoid publishing until installability checks pass.

## Offline page appears unexpectedly

If guests see the offline page, they are likely in poor connectivity or have not opened the portal recently enough for assets to cache. Recommended response:

- Ask the guest to reconnect briefly (Wi‑Fi or cellular) and open the portal once.
- Encourage guests to install and open the portal at least once before traveling.

Do not promise full offline functionality for features that depend on server calls. The offline page exists to keep the experience calm, not to pretend the network does not matter.

## QR scanning issues

If the camera view shows but QR codes are not detected:

- Increase brightness and reduce glare.
- Hold the QR steady and allow a second for detection.
- Try scanning a different QR to rule out a damaged code.

If the camera says “unavailable,” verify that browser permissions allow camera access and that no other app is locking the camera. Reload the page after granting permissions. If scanning fails during doors, switch to manual check-in rather than spending minutes on diagnostics.

## Manual check-in mismatch or duplicates

If a guest cannot be found:

- Search by email first if available.
- Check for spelling variations and whitespace.
- Verify you are in the correct event slug (operators sometimes keep multiple events open).

If you find duplicates, prefer editing and consolidating carefully rather than deleting immediately. Deletion removes related records and can break audit trails. If you must remove a duplicate, ensure the correct record retains the access pass and RSVP history.

## Host dashboard shows “unauthorized” or redirect loops

Host access depends on correct route protection and session cookies. If a host cannot log in:

- Confirm you created a host user for the correct event.
- Confirm the host is using the correct slug URL.
- Have the host clear cookies for the domain and retry.

If a redirect loop occurs, it is usually caused by protecting the login page or misrouting sessions. Operators should verify middleware exclusions for login routes and ensure host session validation is not executed in layouts that re-render during navigation.

## API integration failures

If OS integration is enabled and something fails:

- Use Test Connection to validate `GET /health`.
- If health fails or latency spikes, switch to Standalone or Hybrid to reduce dependency.
- If keys are suspected compromised, revoke the key and rotate immediately.

When in doubt, prioritize the guest portal and check-in flow. Integration can be restored later; a broken door flow cannot.

## A simple incident playbook

1. Identify scope: one guest vs all guests vs staff tools.
2. Apply the smallest change to restore operation (refresh, switch to manual, disable integration).
3. Verify the critical path works again (portal loads, check-in works, hosts can view arrivals).
4. Only then investigate deeper causes using logs and exports.

Troubleshooting is a skill. The platform provides logs, exports, and configuration surfaces, but calm decision-making is what keeps the event running.

