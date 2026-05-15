# Architecture Context

## Objective
Preserve the Ready White production architecture while documenting clear system responsibilities, operational boundaries, and safe expansion paths.

## Stack Responsibilities
- Squarespace is the marketing layer for public pages, forms, and conversion entry points.
- Railway is the backend orchestration layer and API backend.
- GoHighLevel is the CRM and automation system for pipeline, messaging, and workflow execution.
- GitHub is operational memory for documentation, standards, deterministic scripts, audit logic, and source-controlled changes.

## Architecture Guardrails
Never redesign the stack unnecessarily. Always preserve:
- Deterministic scripts.
- Stable naming conventions.
- Standardized GHL objects.
- Operational documentation.
- Environment-variable security.
- Production-safe architecture.

## System Boundaries
Document integrations by system:
- Squarespace: marketing forms, tracking, conversion surfaces.
- Railway: APIs, webhook processing, orchestration, scheduled checks.
- GoHighLevel: contacts, opportunities, pipeline stages, tags, automations, messaging.
- GitHub: docs, SOPs, audit scripts, version history, operational standards.

## Reliability Requirements
Architecture changes should explain:
- ROI impact.
- Operational impact.
- Scalability impact.
- Risk reduction.
- Failure modes.
- Rollback plan.
- Required environment variables.
- Audit and alerting path.

## Future Artifacts
- `system-map.md`
- `environment-variables.md`
- `ghl-object-standards.md`
- `railway-api-contracts.md`
- `production-safety-checklist.md`
