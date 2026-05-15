# Architecture Documentation

This folder defines Ready White's production-safe architecture and stack boundaries. The stack should not be redesigned unnecessarily.

## Architecture goals

- Preserve a simple, reliable, production-safe stack.
- Keep marketing, CRM, backend orchestration, and operational memory clearly separated.
- Protect environment-variable security.
- Keep scripts deterministic and naming conventions stable.
- Support scalable automation without building vanity features.

## Approved stack

| Layer | System | Responsibility |
| --- | --- | --- |
| Marketing | Squarespace | Public marketing site, landing pages, lead capture entry points. |
| CRM + automation | GoHighLevel | Pipeline, contacts, opportunities, conversations, automations, follow-up, review requests. |
| Backend orchestration | Railway | API endpoints, integration logic, secure environment variables, operational automation hooks. |
| Operational memory | GitHub | Documentation, SOPs, standards, scripts, decisions, and change history. |

## Non-goals for this scaffold

- Do not build application logic yet.
- Do not replace Squarespace, Railway, or GoHighLevel without a clear operational reason.
- Do not hard-code secrets or tokens.
- Do not introduce non-deterministic scripts for operational workflows.
- Do not create custom CRM objects that conflict with the standardized GHL pipeline.

## Environment-variable standards

- Store private tokens only in Railway or approved secret managers.
- Never expose GoHighLevel private integration tokens in browser code.
- Document required variables before adding integration logic.
- Use stable names and avoid unnecessary renaming.

## Future documents

- `system-boundaries.md`
- `environment-variables.md`
- `railway-backend.md`
- `ghl-integration.md`
- `github-operational-memory.md`
- `production-safety.md`
