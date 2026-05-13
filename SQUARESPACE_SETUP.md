# Squarespace Setup for Ready White

Squarespace is the marketing layer and visual brand experience. Keep it focused on the public website, brand presentation, and lead capture experience.

## API Key Handling

A Squarespace API key named **Square space GHL** has been generated with these permissions:

- Forms: Read Only
- Inventory: Read and Write
- Orders: Read and Write
- Products: Read and Write
- Profiles: Read Only
- Transactions: Read Only

Treat this key as a private secret:

- Do not commit the real key to this repo.
- Do not paste the real key into frontend JavaScript, HTML, or public Squarespace page code.
- Store the key only in a secure secrets manager such as Railway Variables if a backend process needs it.
- Rotate the key in Squarespace if it is ever exposed in a browser, screenshot, chat, or public repository.

## Recommended Railway Variables

For the current lead bridge, the Squarespace API key is optional. The `/api/ghl-lead` endpoint can receive form/webhook payloads without calling the Squarespace API.

If you want to keep the generated key available for future backend-only Squarespace API work, add it to Railway as:

```text
SQUARESPACE_API_KEY=YOUR_SQUARESPACE_API_KEY
SQUARESPACE_API_KEY_NAME=Square space GHL
```

To secure inbound lead submissions, use a separate shared webhook secret rather than the Squarespace API key:

```text
LEAD_WEBHOOK_SECRET=YOUR_RANDOM_WEBHOOK_SECRET
```

When `LEAD_WEBHOOK_SECRET` is set, callers must include either:

```text
Authorization: Bearer YOUR_RANDOM_WEBHOOK_SECRET
```

or:

```text
x-readywhite-webhook-secret: YOUR_RANDOM_WEBHOOK_SECRET
```

## Lead Submission Target

Point the Squarespace form, webhook automation, or middleware to:

```text
https://YOUR-RAILWAY-URL/api/ghl-lead
```

The Railway backend will normalize the lead payload, upsert the contact in GoHighLevel, and create the opportunity in the Ready White Customer Jobs pipeline.

## Platform Boundary

- Squarespace owns the visual page and customer-facing form experience.
- Railway owns private secrets and API calls.
- GoHighLevel owns CRM records, opportunities, automations, SMS/email, notifications, and pipeline operations.
