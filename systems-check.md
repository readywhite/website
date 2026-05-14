# Ready White Systems Check Runbook

Use this runbook to prove the infrastructure is operational instead of only partially connected.

## Systems map

```text
Squarespace or public website entry
↓
GitHub repo
↓
Railway deployment
↓
API layer: /api/ghl-lead
↓
GoHighLevel CRM + pipelines + workflows
↓
Automations / SMS / Email
```

## Automated cadence

GitHub Actions runs the Ready White Systems Check at 00:00, 12:00, and 18:00 EST daily using `0 5,17,23 * * *` UTC. The scheduled run validates deterministic scripts every time, runs the live GHL smoke test when `READYWHITE_BASE_URL` is configured, and uploads a GHL setup report when `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID` secrets are configured.

Codex works through repo access:

```text
Codex
↓
GitHub repo changes
↓
Railway deployment updates
↓
Website/API/integration changes
```

## 1. GitHub → Railway

**Test**

- Push a small repo change to the production branch.
- Watch Railway deployments.

**Pass if**

- Railway starts a new deployment automatically.
- Deployment finishes successfully.

**Fail if**

- No deployment starts.
- Railway is connected to the wrong repo or branch.

## 2. Railway → Website

**Test**

```bash
curl https://YOUR-RAILWAY-DOMAIN/health
curl -I https://YOUR-RAILWAY-DOMAIN/
curl -I https://YOUR-RAILWAY-DOMAIN/services
```

**Pass if**

- `/health` returns `{ "ok": true }`.
- Homepage and services page return `200`.

## 3. Railway configuration readiness

**Test**

```bash
curl https://YOUR-RAILWAY-DOMAIN/readiness
```

**Pass if**

- Status is `200`.
- `GHL_PRIVATE_INTEGRATION_TOKEN` is `true`.
- `GHL_LOCATION_ID` is `true`.

**Fail if**

- Status is `503`.
- Any required Railway variable is missing.

## 4. Railway → GHL test lead

Run the automated smoke test from a local clone or any terminal with Node. Use the Railway backend URL for `/health`, `/readiness`, and `/api/ghl-lead`; `https://www.readywhite.com/` is the Squarespace marketing layer unless it is configured to proxy backend routes.

```bash
READYWHITE_RAILWAY_BASE_URL=https://YOUR-RAILWAY-DOMAIN npm run smoke:ghl
```

Or manually post a test lead:

```bash
curl -X POST https://YOUR-RAILWAY-DOMAIN/api/ghl-lead \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Test Lead",
    "email":"readywhite.test@example.com",
    "phone":"555-555-5555",
    "propertyAddress":"123 Test Turnover Ave",
    "propertyType":"Single-family rental",
    "occupiedStatus":"Vacant",
    "desiredTimeline":"ASAP turnover",
    "packageInterest":"Standard Market Ready",
    "notes":"Systems-check lead. Delete after verification."
  }'
```

**Pass if**

- API response includes `"ok": true`.
- GHL contact is created or updated.
- If `GHL_PIPELINE_ID` is set, GHL opportunity is created.
- If `GHL_PIPELINE_STAGE_ID` is not set, the backend resolves `GHL_PIPELINE_STAGE_NAME` (`New Lead` by default) from the Ready White Customer Jobs pipeline.

## 5. GHL setup report

Generate a structured report of current GHL pipelines, stages, tags, workflows, missing steps, and recommendations:

```bash
GHL_PRIVATE_INTEGRATION_TOKEN=your_token \
GHL_LOCATION_ID=your_location_id \
GHL_REPORT_OUTPUT=reports/ghl-setup-report.md \
npm run report:ghl
```

**Pass if**

- Ready White Customer Jobs exists.
- All required stages exist in order.
- Required tags exist.
- Workflow names/signals cover photos requested, photos received, scope review, quote sent, follow-up, approved, vendor assignment, scheduled, photo proof, completed, and review requested.
- Automation coverage includes speed-to-lead, missed-call text-back, stale-lead recovery, internal notification, stage movement, package fit, photo policy, exception escalation, vendor scorecard, callback tracking, review flywheel, and property-manager nurture.

## 6. Paint material estimator

**Test**

```bash
npm run estimate:paint -- --length=12 --width=10 --height=8 --coats=2 --product=property_solution_interior_flat --format=markdown
```

**Pass if**

- Output includes paintable square footage, adjusted square footage, raw gallons, required gallons, container plan, and total material cost.
- Pricing assumptions come from `config/material-pricing.json`.
- Exception conditions remain constrained to approved scope workflows instead of hourly drift.

## 7. GHL workflow trigger

**Test inside GHL**

- Find the test contact.
- Check tags.
- Check workflow history.
- Check conversations.
- Check opportunity pipeline.

**Pass if**

- Tags apply.
- Workflow starts.
- SMS/email actions fire.
- Internal notification fires.
- Lead enters the correct pipeline stage.

## 8. Squarespace → backend, if Squarespace is used as the public frontend

**Test**

- Confirm the Squarespace form or embed posts to the Railway `/api/ghl-lead` endpoint.
- Submit the same test lead from the live Squarespace page.

**Pass if**

- The lead reaches GHL exactly like the Railway website test.

**Fail if**

- Squarespace only displays static content and does not post to Railway.
- CORS or form-action issues block the request.

## 9. Biggest failure points

- Missing Railway variables.
- Wrong `GHL_LOCATION_ID`.
- Invalid or rotated private integration token.
- Pipeline variables missing, so contact is created but opportunity is not.
- GHL workflow trigger is not connected to the website lead/contact event.
- Missing GHL report credentials, so scheduled systems checks cannot audit live pipeline/tag/workflow drift.
- Squarespace form is not actually posting to Railway.
- Stale Sherwin-Williams material pricing, which can erode margins and package buy-rate accuracy.

## Final green-light test

Create this test lead from the public website:

```text
Name: Test Lead
Email: readywhite.test@example.com
Phone: 555-555-5555
Package: Standard Market Ready
```

The stack is operational only when:

- Contact appears in GHL.
- Opportunity appears in Ready White Customer Jobs at the correct pipeline stage, if configured.
- Standardized tags such as source:squarespace, vertical:property-management, timeline:asap, vacant:true, and lead:new are applied.
- Workflow starts.
- SMS/email automation sends.
- Internal notification sends.

## SEO launch checks

Run the SEO checklist before launch and during monthly reviews:

```bash
npm run audit:ops
npm run audit:seo
```

Pass criteria include readable slugs, unique SEO descriptions, Open Graph metadata, JSON-LD structured data, descriptive image alt text, custom 404 links, sitemap availability, image/page-size limits, and local Central PA service-area language. Manual post-publish steps live in `docs/seo-launch-checklist.md`.
