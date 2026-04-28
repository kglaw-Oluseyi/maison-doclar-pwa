# PWA deployment: installability, offline resilience, and publishing

The PWA deployment surface exists to turn an event portal into a polished, installable app experience. In practice, deployment is a combination of correct assets (icons), correct metadata (manifest), correct offline behavior (service worker and offline page), and correct lifecycle status (published). Operators should treat deployment as a checklist-driven process rather than a one-click action.

## Icons and why they matter

Icons affect more than aesthetics. On iOS and Android, icons determine how the portal looks on the home screen and in app switchers. Poor icons make the experience feel untrusted, even when the content is correct. Upload a **1024×1024 PNG master icon** and let the system generate the required sizes. After upload, verify:

- `192` and `512` icons render correctly
- A **maskable** icon is generated for Android
- The Apple touch icon is present for iOS

If icons look blurry, the master PNG may be too small or improperly scaled. Always start from a crisp source asset.

## Install card copy

The install card is often a guest’s first hint that the portal can be saved for offline access. Keep copy simple and confident. Good copy clarifies:

- The portal can be saved to the home screen
- The portal will work in weak connectivity
- The portal will keep important details available during travel

Avoid overpromising. If a feature depends on network connectivity, do not imply that everything works offline.

## Manifest preview

The manifest describes the PWA: its name, icons, colors, and start URL. The dashboard shows a manifest preview so you can verify correctness without opening developer tools. When reviewing the manifest:

- Confirm the short name and title match the event tone
- Confirm icons are present and point to valid URLs
- Confirm theme colors match your design tokens
- Confirm the start URL points to the correct event slug

## Pre-deploy checklist

Before publishing, run the checklist and resolve failures. The checklist typically verifies:

- Event has a name and date
- At least one guest exists (so access pass flows are meaningful)
- Icons exist on disk
- Manifest returns HTTP 200
- Service worker returns HTTP 200
- Offline page returns HTTP 200
- At least one content card is enabled

Treat checklist results as gating. Publishing without passing checks is possible but discouraged, because it creates brittle installs and support issues (“it doesn’t work offline”, “the install prompt never appears”, “the icon is broken”).

## Publishing the event

Publishing transitions the event status from DRAFT to PUBLISHED. This is a public milestone: once published, you can distribute the portal URL and guests can install it. Before publishing:

- Verify the portal on a phone-sized viewport
- Confirm RSVP flow works end-to-end for a test guest
- Confirm contact channels and venue details are correct
- Confirm you have a plan for access pass release and invitation messaging

After publishing:

- Share the portal link via your chosen invitation channel
- Release access passes when you are ready for guest distribution
- Monitor portal visit tracking if enabled to confirm invites are being opened

## Offline expectations and practical tips

Offline support is not magic. It is a careful balance of cached assets and clear fallback behavior. The offline page should be calm and helpful, not alarming. Encourage guests to install early, and remind them to open the portal at least once before traveling so assets are cached on their device.

Finally, deployment is not just technical. It is a guest trust exercise. A clean icon, a reliable offline page, and a stable published experience reduce anxiety and improve guest confidence. Run the checklist, verify on mobile, and publish only when you are comfortable that the portal is ready to represent the event.

