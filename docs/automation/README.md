# Automation Documentation

This folder defines Ready White's automation standards across GoHighLevel, Railway, GitHub, and future audit scripts. Automation should increase speed-to-lead, protect pipeline integrity, and reduce operational drift.

## Automation goals

- Capture and respond to leads immediately.
- Request missing photos automatically.
- Recover stale leads and missed calls.
- Keep GHL stages, tags, and opportunity data standardized.
- Trigger vendor dispatch workflows only after approval and scope readiness.
- Produce KPI reporting for lead speed, quote speed, close rate, vendor performance, and review generation.

## Stack boundaries

- Squarespace captures and markets to prospects.
- GoHighLevel owns CRM, pipeline, conversations, automations, and follow-up.
- Railway orchestrates backend API endpoints and integration logic.
- GitHub stores operational memory, standards, docs, scripts, and change history.

## Required GHL objects

Pipeline:

- Ready White Customer Jobs

Core tag examples:

- `source:squarespace`
- `vertical:property-management`
- `vertical:investor`
- `timeline:asap`
- `vacant:true`
- `lead:new`
- `lead:quoted`
- `lead:won`

## Automation candidates

- Missed-call text-back.
- New-lead speed-to-lead alert.
- Photo request and reminder sequence.
- Stale quote recovery.
- Approved-job vendor assignment alert.
- Vendor proof photo reminder.
- Review request workflow.
- Property-manager reactivation campaigns.
- Daily systems checks at 00:00, 12:00, and 18:00 EST.

## Change policy

When adding workflow or automation changes, document:

- ROI impact.
- Operational impact.
- Scalability impact.
- Risk reduction.
- Required GHL objects.
- Required environment variables.
- Audit or KPI reporting updates.

## Future documents

- `ghl-object-standards.md`
- `daily-audit-scripts.md`
- `missed-call-text-back.md`
- `stale-lead-recovery.md`
- `kpi-reporting.md`
- `railway-api-standards.md`
