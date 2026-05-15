# Railway, GitHub, and GoHighLevel Architecture

Ready White uses a simple production-safe stack with clear system boundaries.

## System Boundaries

| System | Role |
| --- | --- |
| Squarespace | Marketing layer and public website entry point when used outside this repo. |
| Railway | Backend orchestration layer for server-side routes, health checks, and integrations. |
| GoHighLevel | CRM, pipeline, automations, SMS/email workflows, and opportunity management. |
| GitHub | Source control, operational documentation, and implementation memory. |
| Mercury | Banking and finance operations. |

## Canonical Request Path

```txt
Customer form / website CTA
  -> Railway-hosted backend route
  -> GoHighLevel contact upsert
  -> GoHighLevel opportunity creation
  -> GHL automation and pipeline progression
  -> Vendor dispatch workflow
```

## Environment Variable Security

Private tokens must stay server-side. Never place GoHighLevel private integration tokens in frontend JavaScript, HTML, Squarespace public code, or committed files.

Required deployment variables:
- `GHL_PRIVATE_INTEGRATION_TOKEN`
- `GHL_LOCATION_ID`

Optional opportunity variables:
- `GHL_PIPELINE_ID`
- `GHL_PIPELINE_STAGE_ID`

## Railway Health Standard

Railway production services should expose a deterministic health endpoint and include restart/healthcheck settings in code where possible. Operational checks should validate `/health` before testing lead submission behavior.

## GitHub Operational Memory

Operational knowledge should live in markdown, scripts, configuration, and audit checks rather than chat history. When business rules change, update the repository documentation in the same change set.
