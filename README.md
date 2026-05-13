# Ready White Website

> **Important:** This repository does not directly create or modify GoHighLevel pipelines, workflows, tags, calendars, or contacts. It provides the website frontend, a webhook-ready payload, and a configuration checklist/template that you or an integration service can connect to an existing GoHighLevel account.

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

## What is configured here

This repo configures the public website experience and the browser-side lead payload shape. It does **not** authenticate to GoHighLevel, create CRM objects, or publish GHL workflows on its own.

| Area | Included in this repo | Must be configured in GoHighLevel |
| --- | --- | --- |
| Landing page | Hero, CTAs, packages, gallery placeholders, intake form | Domain/Squarespace publishing if hosted outside this repo |
| Lead payload | Contact details, tags, pipeline stage, photo file names | Contact creation endpoint or workflow webhook trigger |
| Automations | Recommended SMS/email copy shown on the page | Actual workflow steps, senders, notifications, and timing |
| Pipeline | Suggested stage names documented in copy/config | Real pipeline, stage IDs, opportunity creation, assignee rules |
| Photos | File names included in JSON demo payload | File hosting/upload handling before sending production payloads |

## Connect GoHighLevel

Set `GHL_WEBHOOK_URL` in `script.js` to the live webhook endpoint provided by GoHighLevel or your integration layer.

```js
const GHL_WEBHOOK_URL = "https://example.com/your-ghl-webhook";
```

With no webhook configured, submissions run in demo mode and log the lead payload in the browser console.

Use `ghl-stack.example.json` as the implementation checklist for the real GoHighLevel setup: tags, pipeline stages, workflow messages, notification expectations, and future enhancements.

## GoHighLevel setup checklist

Before this form can drive live CRM automation, configure these items in GoHighLevel or in your middleware/integration layer:

1. Create the tags `Website Lead`, `Property Refresh`, and `Interior Estimate`.
2. Create a Ready White pipeline with `New Lead`, `Reviewing Photos`, `Quote Sent`, `Scheduled`, and `Completed` stages.
3. Create a webhook/API handler that receives the payload from `script.js`.
4. In that handler or workflow, create/update the contact and create/update the opportunity.
5. Add workflow actions for confirmation SMS, confirmation email, and internal notification.
6. Add production photo upload handling if actual image files need to be stored, reviewed, or attached to opportunities.

## Local preview

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.
