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
- GHL setup report generator that audits live pipelines, stages, tags, workflows, automation signals, missing objects, and drift recommendations.
- GitHub Actions systems check scheduled at 00:00, 12:00, and 18:00 EST daily.

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
   - Add `GHL_REPORT_OUTPUT=reports/ghl-setup-report.md` only when a file artifact is desired for local or CI reports.

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
     2. Photos Requested
     3. Photos Received
     4. Scope Review
     5. Quote Sent
     6. Follow-Up
     7. Approved
     8. Vendor Assignment
     9. Scheduled
     10. In Progress
     11. Photo Proof Review
     12. Completed
     13. Review Requested
     14. Closed Won
     15. Closed Lost

2. **GHL tags**
   - Create or confirm these tags:
     - source:squarespace
     - vertical:property-management
     - vertical:investor
     - timeline:asap
     - vacant:true
     - lead:new
     - lead:quoted
     - lead:won

3. **Customer workflow automation**
   - Trigger from website lead/contact creation.
   - Send immediate customer SMS/email using operational language.
   - Notify internal operations team.
   - Move or branch based on photos requested, photos received, scope review, quote sent, follow-up, approval, vendor assignment, scheduled, in progress, photo proof review, completed, review requested, and closeout.

4. **Automation language**
   - Use:
     - "Your property refresh request is under review."
     - "Photos requested."
     - "Photos received."
     - "Scope review is in progress."
     - "Quote sent."
     - "Your refresh is moving into vendor assignment."
     - "Scheduling details will follow."
   - Do not use painter/handyman language.

5. **Package alignment**
   - Make sure GHL references these service lanes:
     - Basic Turn White
     - Standard Market Ready
     - Premium Listing Ready
     - Heavy Turn Reset

6. **Workflow report review**
   - Run or review the generated GHL setup report after pipeline, tag, workflow, or automation changes.
   - Resolve missing stages, missing tags, stage-order inconsistencies, stale workflow names, inactive workflows, and missing automation signals before scale-up.
   - Confirm missed-call text-back, stale-lead recovery, review flywheel, property-manager nurture, vendor scorecard, callback tracking, and exception escalation remain active.

## Shared final acceptance checklist

- Railway `/health` works on the public URL.
- Website form submits from the public URL.
- GHL contact is created or updated.
- GHL tags are applied.
- GHL opportunity is created if pipeline variables are configured.
- GHL customer receives the first confirmation message.
- Internal team receives the lead notification.
- Lead can move through the full Ready White Customer Jobs pipeline from New Lead to Closed Won or Closed Lost.
- GHL setup report shows no missing required stages, tags, workflow signals, automation signals, or stage-order inconsistencies.
- DNS records verify in GHL for email sending.

## Message to use with Codex

Use this prompt when asking Codex for future changes:

> Update the Ready White system so the website intake, Railway API, and GoHighLevel workflow stay aligned around the standardized property refresh operating system. Do not use painter/handyman language. Keep the pipeline stages as New Lead, Photos Requested, Photos Received, Scope Review, Quote Sent, Follow-Up, Approved, Vendor Assignment, Scheduled, In Progress, Photo Proof Review, Completed, Review Requested, Closed Won, and Closed Lost. Keep credentials server-side only.
