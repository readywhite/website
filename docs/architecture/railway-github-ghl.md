# Railway, GitHub, and GoHighLevel Architecture

Ready White uses a stable three-layer architecture:

```text
Squarespace = marketing layer
Railway = backend orchestration layer
GoHighLevel = CRM + automation system
GitHub = version-controlled source of truth
```

Do not redesign the stack unnecessarily. Improve it by making the existing layers more deterministic, observable, and secure.

## Responsibilities

| Layer | Responsibility | Must preserve |
| --- | --- | --- |
| Squarespace | Marketing pages, public forms, lead capture entry point | Fast UX, no private tokens, clear photo policy. |
| Railway | Secure API routes, environment variables, health endpoint, integration glue | Deterministic scripts, production-safe env handling, backend token security. |
| GoHighLevel | Contacts, opportunities, pipeline, automations, tasks, messages, reporting | Standard pipeline, standard stages, standard tags, workflow reliability. |
| GitHub | Versioned website, docs, scripts, deployment source | Stable naming conventions, auditability, rollback path. |

## Production Data Flow

1. Prospect or property manager submits a quote request from Squarespace.
2. Squarespace posts to Railway at `/api/ghl-lead`.
3. Railway validates required fields and reads GoHighLevel credentials from environment variables.
4. Railway upserts the contact in GoHighLevel.
5. Railway creates or updates the opportunity in **Ready White Customer Jobs**.
6. GoHighLevel workflows handle speed-to-lead, photo collection, quote follow-up, vendor dispatch, completion, review requests, and stale-lead recovery.

## Environment Security

Never commit private tokens. Store production values in Railway variables only:

- `GHL_PRIVATE_INTEGRATION_TOKEN`
- `GHL_LOCATION_ID`
- `GHL_PIPELINE_ID`
- `GHL_PIPELINE_STAGE_ID`
- `ALLOWED_ORIGIN` when CORS should be constrained
- `RAILWAY_HEALTH_URL` for operational system checks
- `SQUARESPACE_FORM_URL` for marketing-form checks

## Reliability Standards

- Keep `/health` lightweight and deterministic.
- Keep API payload naming stable.
- Keep GHL object names stable.
- Use audit scripts before changing production workflow objects.
- Document all workflow changes with ROI, operational impact, scalability impact, and risk reduction.
- Prefer additive improvements over stack replacement.
