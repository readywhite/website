# Ready White Stack Architecture

Ready White uses a three-layer stack so each platform does the job it is best at.

## 1. Squarespace: Marketing Layer

Squarespace is the public visual brand experience.

Use Squarespace for:

- homepage and campaign landing pages
- brand visuals, copy, trust sections, and calls to action
- public quote-request forms or buttons
- conversion-focused page edits that non-technical users can update quickly

Do not use Squarespace for:

- storing private GoHighLevel tokens
- storing the generated Squarespace API key in public page code
- calling the GoHighLevel API directly from browser code
- complex CRM routing logic
- operational automation rules

When a visitor submits a lead form, Squarespace should send the payload to the Railway backend endpoint:

```text
https://YOUR-RAILWAY-URL/api/ghl-lead
```

## 2. Railway: Secure Backend Integration Layer

Railway is the private integration layer between the marketing site and GoHighLevel.

Use Railway for:

- receiving Squarespace form or webhook submissions
- holding private environment variables securely
- normalizing field names from Squarespace into a clean lead payload
- calling the GoHighLevel API server-side
- upserting contacts and creating opportunities
- returning safe success or error responses to the form/webhook caller

Railway must store these required environment variables:

```text
GHL_PRIVATE_INTEGRATION_TOKEN=YOUR_TOKEN
GHL_LOCATION_ID=wXwmRjNVCUq1DCIy4Lqc
GHL_PIPELINE_ID=wtwJBdMmtrUDQX0PU5Z7
```

Optional Railway variables:

```text
GHL_PIPELINE_STAGE_ID=YOUR_NEW_LEAD_STAGE_ID
GHL_CONTACT_TAGS=source:squarespace,lead:new
GHL_CONTACT_ENDPOINT=/contacts/upsert
ALLOWED_ORIGIN=https://your-squarespace-domain.com
LEAD_WEBHOOK_SECRET=YOUR_RANDOM_WEBHOOK_SECRET
GHL_COO_USER_ID=YOUR_COO_USER_ID
GHL_SDR_USER_ID=YOUR_SDR_USER_ID
```

Do not paste the private integration token or generated Squarespace API key into Squarespace page code, frontend scripts, or committed repo files.

## 3. GoHighLevel: Operational CRM + Automation System

GoHighLevel is the system of record for customer operations.

Use GoHighLevel for:

- contacts
- opportunities
- Ready White Customer Jobs pipeline
- workflow automations
- SMS and email follow-up
- internal team notifications
- user assignment
- quote and job status tracking

Recommended workflow trigger:

```text
Opportunity Created
```

Recommended workflow condition:

```text
Pipeline = Ready White Customer Jobs
```

## Production Data Flow

```text
Squarespace marketing form
    ↓
Railway API layer (/api/ghl-lead + /api/ghl-webhook)
    ↓
GoHighLevel contact upsert + opportunity creation
    ↓
Operational automations
    ↓
VA execution
    ↓
Metrics + audits
    ↓
Codex optimization loop
```

This separation keeps the public website flexible, the private API credentials secure, and Ready White's operations centralized in GoHighLevel.
