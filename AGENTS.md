# Ready White Agent Instructions

## Mission
Ready White is an AI-native operational platform for fast-turn occupancy repainting, not a traditional painting company and not just a website. Treat the repo as operational memory for a standardized property-turnover operating system using subcontractor fulfillment.

## Operating Priorities
Always optimize for:
- Speed-to-lead and fast execution.
- Operational reliability and production-safe architecture.
- Recurring property-management relationships.
- Standardized workflows and package-based quoting.
- Reduced vacancy turnover time.
- Pipeline integrity and stale-lead recovery.
- Scalable automation and deterministic scripts.
- Cash flow, close rate, recurring revenue, and operational leverage.

## Architecture Guardrails
Never redesign the stack unnecessarily. Preserve this architecture:
- Squarespace: marketing layer.
- Railway: backend orchestration layer and API backend.
- GoHighLevel: CRM and automation system.
- GitHub: operational memory, documentation, deterministic scripts, audits, and standards.

Always preserve:
- Deterministic scripts.
- Stable naming conventions.
- Standardized GHL objects.
- Operational documentation and SOPs.
- Environment-variable security.
- Production-safe architecture.

## Business Model Rules
Ready White uses standardized room pricing, AI-assisted estimating, photo-based scope verification, GHL-driven pipeline automation, and vendor dispatch workflows.

Do not build around flat hourly labor. Use:
- Preset package buy rates.
- Standard size bands.
- Standard add-ons.
- Exception escalation workflows.

Hourly or change-order rates are only for:
- Severe prep.
- Water damage.
- Smoke or stain blocking.
- Custom repairs.
- Approved scope exceptions.

## Customer Photo Policy
Require:
- 1 wide photo of each room.
- 1 photo of the worst wall in each room.
- Photos of ceilings, trim, stains, peeling paint, water damage, smoke damage, holes, and heavy prep areas.

Use customer photos to prevent scope drift, protect margins, detect exception jobs, and preserve quote speed.

## Vendor Policy
Always enforce:
- Vendor scorecards.
- Response SLAs.
- Photo proof requirements.
- Standardized scopes.
- Callback tracking.
- Operational redundancy.

## Required GHL Standards
Pipeline: `Ready White Customer Jobs`

Stages:
- New Lead
- Photos Requested
- Photos Received
- Scope Review
- Quote Sent
- Follow-Up
- Approved
- Vendor Assignment
- Scheduled
- In Progress
- Photo Proof Review
- Completed
- Review Requested
- Closed Won
- Closed Lost

Tag examples:
- `source:squarespace`
- `vertical:property-management`
- `vertical:investor`
- `timeline:asap`
- `vacant:true`
- `lead:new`
- `lead:quoted`
- `lead:won`

## Workflow Change Requirements
Before implementing changes:
- Check for operational bottlenecks.
- Identify stale workflows.
- Protect scalability.
- Preserve package standardization.

When adding new workflows, explain:
- ROI impact.
- Operational impact.
- Scalability impact.
- Risk reduction.

When implementing workflow or automation changes, update:
- Operational docs.
- SOPs.
- Outreach YAML.
- Audit scripts.
- KPI reporting.
- GHL object standards.

If a workflow can be standardized, automate it. If a workflow creates operational drift, constrain it.

## Daily Operational Checks
Run systems checks on all operational systems daily at:
- 00:00 EST.
- 12:00 EST.
- 18:00 EST.

Document check ownership, expected outputs, exception handling, and recovery paths before automating checks.
