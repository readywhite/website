# Ready White Website

A lightweight static landing page for the Ready White property-refresh funnel. The page is designed as a premium frontend that can send branded quote requests into GoHighLevel workflows instead of relying on an embedded form.

## Funnel stack

- **Website frontend:** hero, service packages, before/after gallery, CTA buttons, and lead form.
- **GoHighLevel backend:** lead capture, CRM, automations, SMS/email follow-up, pipeline management, quote workflows, and appointment booking.
- **Custom integration:** form submissions can be routed to a GoHighLevel webhook or API endpoint from `script.js`.

## Recommended lead flow

1. Visitor clicks **Get My Property Quote**.
2. The form collects name, email, phone, property address, property type, notes, and uploaded photo names.
3. The payload includes the tags `Website Lead`, `Property Refresh`, and `Interior Estimate`.
4. The lead starts in the `New Lead` pipeline stage for follow-up workflows.

## Connect GoHighLevel

Set `GHL_WEBHOOK_URL` in `script.js` to the live webhook endpoint provided by GoHighLevel or your integration layer.

```js
const GHL_WEBHOOK_URL = "https://example.com/your-ghl-webhook";
```

With no webhook configured, submissions run in demo mode and log the lead payload in the browser console.

## Local preview

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.
