# Security & privacy: practical rules for production operations

Event operations handle real personal data: names, emails, attendance status, dietary requirements, and accessibility notes. The platform is designed to minimize exposure while still enabling the workflows that make an event run smoothly. Security is not only a technical property; it is a set of operator habits that reduce risk during busy timelines.

## Authentication surfaces

There are multiple protected surfaces:

- **Operator dashboard**: the control plane. It should be accessible only to trusted operators.
- **Host command center**: a delegated view for event-day staff. It should not include full configuration capabilities.
- **Guest portal**: token-based access for guests. Guest tokens should be treated as “ticket links.” If a token is leaked, an unauthorized person could potentially view guest-specific content.

Avoid sharing dashboard credentials in group chats. Instead, create separate host users for on-site staff and revoke them after the event.

## Passwords and sessions

Host accounts should use strong passwords. Auto-generated passwords are recommended because they reduce reuse and predictable patterns. When sharing a password with a host, use a secure channel and ask them to change it if the event timeline allows. After the event, delete temporary host users.

Operator sessions should be treated as privileged. If you are working on a shared machine, log out when done and avoid storing credentials in unsecured browsers.

## API keys: least privilege and one-time reveal

API keys are powerful. They should be generated only when you have a clear integration need. Use these rules:

- **Least privilege**: select only the permissions required. Do not grant write permissions if read is sufficient.
- **One-time reveal**: copy the key immediately and store it in a secret manager. The system will not show it again.
- **Label keys**: labels help you audit what a key was for and whether it is still needed.
- **Revoke proactively**: if an integration is paused or the event ends, revoke keys to reduce long-term exposure.

If a key is accidentally shared, treat it as compromised and revoke it immediately. Generate a new key and rotate the integration configuration.

## Sensitive guest fields

Dietary and accessibility fields may contain health-related information. Operators should:

- Record only what is necessary for operations.
- Avoid subjective judgments or unnecessary details.
- Keep language respectful and neutral.
- Share exports only with teams that require them (catering, venue accessibility lead).

When exporting dietary or accessibility data, confirm that you are sending it to a trusted recipient. These exports often travel beyond the dashboard and therefore increase exposure risk.

## QR tokens and regeneration

QR regeneration invalidates previous tokens. This is a security feature and an operational tool. Use regeneration when:

- A token was accidentally forwarded.
- A guest requests a new link due to device changes.
- You suspect unauthorized access to a guest’s pass.

Do not regenerate tokens casually, because it can confuse guests who saved an older pass. When you regenerate, communicate clearly that the guest should use the newest link.

## Webhooks and external connectivity

When running in integrated mode, webhooks may send operational events to external systems. Treat webhook URLs as sensitive configuration. Use HTTPS in production, validate that endpoints are correct, and subscribe only to the events you need. If an external system becomes unstable, switch integration mode to standalone so the guest portal remains unaffected.

## Operator hygiene checklist

Before event day:

- Confirm only necessary operators and hosts have access.
- Revoke test keys and delete test users.
- Verify that public URLs do not leak internal documents.

After event day:

- Revoke integration keys that are no longer needed.
- Export required reports and remove temporary access.
- Archive the event to reduce accidental edits.

Security is achieved through consistent habits. The platform provides guardrails—hashed keys, role separation, and lifecycle gating—but operators are the final line of defense.

