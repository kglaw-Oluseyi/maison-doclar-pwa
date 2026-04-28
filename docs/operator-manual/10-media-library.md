# Media library: assets, performance, and operational safety

The media library allows operators to upload and manage event assets such as images, videos, and PDFs. These assets can be referenced in portal content (for example, a gallery, dress code PDF, venue map, or sponsor video). The library stores files under the event’s public directory so that assets can be served efficiently by the application.

## What belongs in the media library

Use the media library for assets that are part of the event experience:

- **Images**: hero background, gallery photos, venue maps, brand marks.
- **Videos**: short teasers or venue walkthrough clips (keep them small).
- **PDFs**: schedules, policies, menus, or transport instructions.

Avoid uploading internal documents or sensitive files. Anything in the library is served as a public URL. If a document should not be accessible to a guest, it should not be uploaded here.

## Size limits and why they exist

Media size directly affects performance, especially on mobile networks. The library enforces limits (for example, large videos capped and PDFs kept smaller). These limits protect the guest experience: a portal that loads slowly or crashes the browser becomes a support problem.

Before uploading:

- Compress images appropriately. Prefer modern formats when supported, but keep compatibility in mind.
- Keep videos short. If a video is “nice to have,” consider linking externally rather than embedding.
- Optimize PDFs. A multi-megabyte PDF on cellular can feel broken even if it technically loads.

## Upload workflow

Uploading is supported by drag-and-drop and file input. After upload, verify:

- The asset appears in the grid with the correct type (image thumbnail, video indicator, or PDF icon).
- The “Copy URL” action produces a working link when opened in a new tab.
- The asset displays correctly on mobile (especially PDFs).

If an asset does not render, it may be an unsupported codec or an invalid file extension. Replace the asset with a more standard encoding.

## Deleting assets safely

Deletion is immediate. Before deleting:

- Confirm the asset is not referenced in the portal or post-event gallery.
- If it is referenced, update the content first to avoid broken links.
- If you are unsure, duplicate the asset under a new name, update references, then delete the old one.

Because assets are stored locally under `public/events/[slug]/media`, they are not a long-term, globally replicated CDN by default. Treat the library as a deployment artifact: it is excellent for local or controlled environments, and it can be extended to a more durable storage solution later if required.

## Naming conventions and organization

A small amount of discipline makes a big difference:

- Use descriptive filenames: `venue-map-v3.pdf`, `gala-hero-2026.jpg`, `menu-vegetarian.pdf`.
- Avoid spaces and unusual characters in filenames. Hyphens are safest.
- If you iterate, include version numbers rather than overwriting blindly.

## Performance guidance for guests

Media is most effective when it is deliberate. A portal with too many heavy assets will feel sluggish. If you are adding a gallery, select a curated set of images rather than dozens. If you need many images, consider creating a single optimized PDF or linking to an external gallery platform.

The media library gives you the freedom to create a rich experience, but the goal is always the same: a portal that loads quickly, feels premium, and behaves predictably on the devices guests actually use.

