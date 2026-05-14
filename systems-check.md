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

Run the automated smoke test from a local clone or any terminal with Node:

```bash
READYWHITE_BASE_URL=https://YOUR-RAILWAY-DOMAIN npm run smoke:ghl
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
- If pipeline variables are set, GHL opportunity is created.

## 5. GHL workflow trigger

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

## 6. Squarespace → backend, if Squarespace is used as the public frontend

**Test**

- Confirm the Squarespace form or embed posts to the Railway `/api/ghl-lead` endpoint.
- Submit the same test lead from the live Squarespace page.

**Pass if**

- The lead reaches GHL exactly like the Railway website test.

**Fail if**

- Squarespace only displays static content and does not post to Railway.
- CORS or form-action issues block the request.

## 7. Biggest failure points

- Missing Railway variables.
- Wrong `GHL_LOCATION_ID`.
- Invalid or rotated private integration token.
- Pipeline variables missing, so contact is created but opportunity is not.
- GHL workflow trigger is not connected to the website lead/contact event.
- Squarespace form is not actually posting to Railway.

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
