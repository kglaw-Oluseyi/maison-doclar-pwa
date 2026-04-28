# API integration: connecting Maison Doclar OS safely

The platform can operate in standalone mode, but it is also designed to integrate with an external “OS” system for advanced workflows. Integration is configured per event. The most important principle is that integrations must be **revocable, observable, and least-privilege**. If an integration goes wrong on event day, you need to be able to disable it quickly without breaking the guest portal.

## Integration modes

- **Standalone**: No external dependencies. This is the safest default and is recommended when you do not have a fully tested OS deployment.
- **Integrated**: The PWA and the OS exchange data in real time. Use this when devices, staff workflows, or external systems require shared state.
- **Hybrid**: Both systems operate and reconcile periodically. Hybrid is useful when event-day connectivity is uncertain, or when you want OS support without making the guest portal dependent on the OS.

Choose the mode based on operational risk, not preference. Standalone is the right choice for many events, especially when the PWA already covers core needs.

## OS connection settings

When you enable Integrated or Hybrid mode, you configure:

- **OS base URL**: the HTTP origin the dashboard will contact for health checks and API operations.
- **OS webhook URL**: the endpoint the OS will call for events (new RSVP, check-in, portal visit, request submissions).

Always verify URLs include `https://` in production. For local testing, `http://localhost` may be used, but remember that webhooks cannot reach localhost from hosted environments.

Use the **Test Connection** action to validate that the OS responds at `GET /health`. This is a lightweight check that confirms DNS and TLS are configured correctly and gives you latency visibility. Passing health checks does not guarantee correct integration logic, but failing them is a clear indicator that you should not rely on integration on event day.

## Webhook subscriptions

Webhook subscriptions are an “intent list” that tells the system which events you expect the OS to handle. Subscriptions should be explicit so that you can reason about what will flow out of the platform. Common subscriptions include:

- New RSVP and RSVP updates
- Guest checked in events
- QR regenerations
- Portal visits (optional)
- Concierge requests (optional)

Enable only what you need. More signals can be helpful, but they also add noise and increase the surface area of failures.

## API keys: one-time reveal and revocation

API keys are generated in the dashboard and stored only as a **hash** on the server. The raw key is shown exactly once using a one-time reveal pattern. This protects you from accidental key leaks through screenshots, support logs, or later UI access.

When generating a key:

1. Assign a meaningful label (for example, “OS staging sync” or “Door tablets integration”).
2. Select the minimum set of permissions required.
3. Copy the raw key immediately and store it in a secure secret manager.
4. Confirm the “I have saved this key” checkbox before closing.

If you lose the key, you cannot recover it; you must revoke it and generate a new one.

Revocation is immediate. Once revoked, the key should no longer be accepted by the platform. In production operations, revoke unused keys after the event to reduce long-term exposure.

## Observability and incident response

When integration is enabled, you should watch for:

- Unexpected spikes in traffic or webhook events
- Repeated QR regenerations
- High error rates in OS callbacks
- Latency increases on health checks

If something looks wrong, prefer decisive action: switch integration mode to Standalone or revoke the active API key. The guest portal should remain functional even if the OS becomes unavailable. The integration layer is valuable, but the guest experience is the priority.

Finally, maintain a simple runbook: who owns OS deployment, who owns the event data, and who has authority to revoke keys. Clear ownership prevents hesitation when minutes matter.

