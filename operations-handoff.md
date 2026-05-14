# Ready White Operations Handoff for June and Jason

This document separates what is already built in the repo from what June and Jason still need to finish in live systems.

## Current truth

The Ready White repo is prepared for a connected workflow, but the repo alone does not prove every external service is live. The website and API can communicate with GoHighLevel after Railway has the correct environment variables and the GHL workflow/pipeline is configured.

## What is already built

- Website homepage for Ready White as a standardized property refresh operating system.
- `/services` page for package lanes, service categories, add-ons, and operational handoff.
- Express server with `/health`, `/services`, and `POST /api/ghl-lead`.
- Secure GHL lead endpoint that reads credentials from server-side environment variables.
- Contact upsert logic for GoHighLevel.
- Optional opportunity creation when pipeline and stage IDs are configured.
- Railway deployment config with `npm start` and `/health` healthcheck.
- GHL email DNS documentation for the LeadConnector/Mailgun sending subdomain.

## Jason responsibilities

1. **GitHub / repo**
   - Make sure all app files are pushed to the production branch connected to Railway.
   - Confirm the branch is `main` unless Railway is configured differently.

2. **Railway**
   - Confirm the Railway service is connected to the Ready White GitHub repo.
   - Confirm the service has a public domain generated.
   - Confirm `/health` returns `{ "ok": true }` on the Railway domain.
   - Add or confirm these Railway variables:
     - `GHL_PRIVATE_INTEGRATION_TOKEN`
     - `GHL_LOCATION_ID`
     - `GHL_PIPELINE_ID` if opportunities should be created
     - `GHL_PIPELINE_STAGE_ID` if opportunities should be created
   - Redeploy after variables are added.

3. **Domain / DNS**
   - Add the GHL email DNS records at the domain DNS provider, not Railway.
   - Verify the records in GoHighLevel after propagation.

4. **Live test**
   - Submit one test lead from the public website.
   - Confirm the lead reaches Railway without errors.
   - Confirm the contact appears in GHL.
   - If pipeline variables are set, confirm an opportunity appears in the correct pipeline stage.

## June responsibilities

1. **GHL pipeline**
   - Create or confirm the Ready White pipeline with these stages:
     1. New Lead
     2. Photo Review
     3. Scope Verification
     4. Package Confirmation
     5. Quote Approval
     6. Vendor Assignment
     7. Scheduling
     8. Refresh Completion

2. **GHL tags**
   - Create or confirm these tags:
     - Website Lead
     - Property Refresh
     - Ready White OS
     - Photo Review
     - Package Confirmation

3. **Customer workflow automation**
   - Trigger from website lead/contact creation.
   - Send immediate customer SMS/email using operational language.
   - Notify internal operations team.
   - Move or branch based on photo review, package fit, quote approval, vendor assignment, and scheduling.

4. **Automation language**
   - Use:
     - "Your property refresh request is under review."
     - "Photos received."
     - "Scope verification is in progress."
     - "Package fit confirmed."
     - "Your refresh is moving into vendor assignment."
     - "Scheduling details will follow."
   - Do not use painter/handyman language.

5. **Package alignment**
   - Make sure GHL references these service lanes:
     - Basic Turn White
     - Standard Market Ready
     - Premium Listing Ready
     - Heavy Turn Reset

## Shared final acceptance checklist

- Railway `/health` works on the public URL.
- Website form submits from the public URL.
- GHL contact is created or updated.
- GHL tags are applied.
- GHL opportunity is created if pipeline variables are configured.
- GHL customer receives the first confirmation message.
- Internal team receives the lead notification.
- Lead can move through the full pipeline from New Lead to Refresh Completion.
- DNS records verify in GHL for email sending.

## Message to use with Codex

Use this prompt when asking Codex for future changes:

> Update the Ready White system so the website intake, Railway API, and GoHighLevel workflow stay aligned around the standardized property refresh operating system. Do not use painter/handyman language. Keep the pipeline stages as New Lead, Photo Review, Scope Verification, Package Confirmation, Quote Approval, Vendor Assignment, Scheduling, and Refresh Completion. Keep credentials server-side only.
