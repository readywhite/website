# Automation Context

## Objective
Automate standardized workflows that improve speed-to-lead, close rate, vendor execution, pipeline integrity, review generation, and operational reliability.

## Automation Principles
- If a workflow can be standardized, automate it.
- If a workflow creates operational drift, constrain it.
- Automations must preserve GHL object standards.
- Automations must be deterministic, auditable, and production-safe.
- Environment variables must remain secure and out of source control.

## Core Automation Areas
Document automations for:
- Squarespace lead capture into GHL.
- Missed-call text-back.
- Speed-to-lead response.
- Photo request reminders.
- Quote follow-up.
- Stale-lead recovery.
- Vendor dispatch notifications.
- Scheduled status checks.
- Photo proof reminders.
- Review requests.
- KPI reporting.
- Failed webhook and integration audits.

## Daily Systems Check Schedule
Operational systems checks should run daily at:
- 00:00 EST.
- 12:00 EST.
- 18:00 EST.

Checks should report health for Squarespace, Railway, GoHighLevel, vendor dispatch queues, webhook delivery, error logs, and KPI reporting freshness.

## Change Documentation Requirements
When adding automation, document:
- ROI impact.
- Operational impact.
- Scalability impact.
- Risk reduction.
- Required GHL objects.
- Failure modes.
- Manual fallback process.
- Audit or alerting path.

## Future Artifacts
- `ghl-automation-map.md`
- `railway-orchestration-map.md`
- `audit-script-index.md`
- `kpi-reporting-plan.md`
- `missed-call-text-back.md`
