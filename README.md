# Ready White Website

> **Important:** Do not paste a real GoHighLevel Private Integration Token into frontend code, commits, or public settings. This repo now includes a server-side API route that reads the token from environment variables and sends leads to GoHighLevel without exposing the token in the browser.

A lightweight static landing page for the Ready White property-refresh funnel. The page is designed as a premium frontend that can send branded quote requests into GoHighLevel workflows instead of relying on an embedded form.

## Funnel stack

- **Website frontend:** hero, service packages, before/after gallery, CTA buttons, and lead form.
- **GoHighLevel backend:** lead capture, CRM, automations, SMS/email follow-up, pipeline management, quote workflows, and appointment booking.
- **Custom integration:** form submissions post to `api/ghl-lead.js`, which uses a GoHighLevel Private Integration Token from server-side environment variables.

## Recommended lead flow

1. Visitor clicks **Get My Property Quote**.
2. The form collects name, email, phone, property address, property type, notes, and uploaded photo names.
3. The payload includes the tags `Website Lead`, `Property Refresh`, and `Interior Estimate`.
4. The lead starts in the `New Lead` pipeline stage for follow-up workflows.

## What is configured here

This repo configures the public website experience, the browser-side lead payload, and a server-side API route for sending contacts to GoHighLevel. It does **not** create GHL pipelines, stage IDs, workflow automations, calendars, or message senders on its own.

| Area | Included in this repo | Must be configured in GoHighLevel |
| --- | --- | --- |
| Landing page | Hero, CTAs, packages, gallery placeholders, intake form | Domain/Squarespace publishing if hosted outside this repo |
| Lead payload | Contact details, tags, pipeline stage, photo file names | Production file storage if actual photo uploads are required |
| Contact sync | `api/ghl-lead.js` calls `/contacts/upsert` with the server-side token | `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID` deployment variables |
| Automations | Recommended SMS/email copy shown on the page | Actual workflow steps, senders, notifications, and timing |
| Pipeline | Optional opportunity creation when pipeline env vars are set | Real pipeline ID, stage ID, assignee rules, and workflow automations |
| Photos | File names included in JSON demo payload | File hosting/upload handling before sending production payloads |

## Connect GoHighLevel

Add your GoHighLevel credentials as deployment environment variables. The private token belongs on the server only; never put it in `script.js` or `index.html`.

```bash
GHL_PRIVATE_INTEGRATION_TOKEN=pit_your_private_integration_token_here
GHL_LOCATION_ID=your_highlevel_location_id
GHL_PIPELINE_ID=your_ready_white_pipeline_id          # optional
GHL_PIPELINE_STAGE_ID=your_new_lead_stage_id          # optional
```

The browser posts quote requests to `/api/ghl-lead`. That route uses the token to call HighLevel's `/contacts/upsert` endpoint and, when both pipeline variables are present, creates an opportunity through `/opportunities/`.

With no deployed backend, local preview submissions run in demo mode and log the lead payload in the browser console.

Use `ghl-stack.example.json` as the implementation checklist for the real GoHighLevel setup: tags, pipeline stages, workflow messages, notification expectations, and future enhancements.


## API references

- HighLevel Contacts API: <https://marketplace.gohighlevel.com/docs/ghl/contacts/contacts-api/index.html>
- Upsert Contact endpoint: <https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact/index.html>
- Create Opportunity endpoint: <https://marketplace.gohighlevel.com/docs/ghl/opportunities/create-opportunity/>

## GoHighLevel setup checklist

Before this form can drive live CRM automation, configure these items in GoHighLevel or in your middleware/integration layer:

1. Create the tags `Website Lead`, `Property Refresh`, and `Interior Estimate`.
2. Create a Ready White pipeline with `New Lead`, `Reviewing Photos`, `Quote Sent`, `Scheduled`, and `Completed` stages.
3. Deploy the included `/api/ghl-lead` route with `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID` set.
4. Add `GHL_PIPELINE_ID` and `GHL_PIPELINE_STAGE_ID` if the route should create opportunities after contact upsert.
5. Add workflow actions for confirmation SMS, confirmation email, and internal notification.
6. Add production photo upload handling if actual image files need to be stored, reviewed, or attached to opportunities.

## Local preview

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>. Local form submissions intentionally stay in demo mode so a private token is never needed in the browser.
