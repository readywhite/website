# READY WHITE SYSTEM RULES

Ready White is an AI-native operational platform for standardized property-turnover repainting, not just a website. Treat this repository as company operating memory and implementation source for the Ready White system.

## Operating Principles

Always optimize for:
- speed-to-lead
- operational reliability
- recurring property-management relationships
- standardized workflows
- reduced vacancy turnover time
- pipeline integrity
- fast execution
- scalable automation
- cash flow
- close rate
- automation
- recurring revenue
- operational leverage

Always think like:
- a systems operator
- a revenue optimizer
- a workflow architect
- an operational scaling engineer

Never optimize for vanity features.

## Business Model

Ready White is NOT a traditional painting company. Ready White is a standardized property-turnover operating system using subcontractor fulfillment.

Primary goals:
- speed
- standardized workflows
- low overhead
- vendor scalability
- automation-first operations

Optimize for:
- package-based quoting
- photo-based scope verification
- vendor standardization
- recurring property-manager relationships
- operational speed
- automation reliability

Operational terminology to use:
- property refresh
- occupancy turnover
- scope verification
- vendor assignment

Avoid:
- handyman terminology
- luxury painter language
- flat hourly labor as the core operating model

## Architecture Standards

Never redesign the stack unnecessarily.

Core stack:
- Squarespace = marketing layer
- Railway = backend orchestration layer
- GoHighLevel = CRM + automation system
- GitHub = source control and operational memory
- Mercury = banking/finance operations

Canonical workflow:

```txt
Website/Squarespace -> Railway API -> GoHighLevel -> Vendor Dispatch
```

Always preserve:
- deterministic scripts
- stable naming conventions
- standardized GHL objects
- operational documentation
- environment-variable security
- production-safe architecture

## Customer Photo Policy

Require:
- 1 wide photo of each room
- 1 photo of the worst wall in each room
- photos of ceilings, trim, stains, peeling paint, water damage, smoke damage, holes, and heavy prep areas when present

Use photos to:
- prevent scope drift
- protect margins
- detect exception jobs
- preserve quote speed

## Pricing Standards

Baseline pricing references live in `docs/pricing/` and `docs/estimating/`.

Current defaults:
- minimum room charge: $1,200
- standard target room price: $2,500
- minimum all-in cost reference: $600
- target gross profit range: $600-$1,900 per room

Do not build pricing around flat hourly labor. Use package-based pricing, standard size bands, standard add-ons, and exception escalation.

## Vendor Policy

Do NOT build around flat hourly labor.

Use:
- preset package buy rates
- standard size bands
- standard add-ons
- exception escalation workflows

Hourly/change-order rates are ONLY for:
- severe prep
- water damage
- smoke/stain blocking
- custom repairs
- approved scope exceptions

Always enforce:
- vendor scorecards
- response SLAs
- photo proof requirements
- standardized scopes
- callback tracking
- operational redundancy

## Required GoHighLevel Standards

Pipeline:
- Ready White Customer Jobs

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
- source:squarespace
- vertical:property-management
- vertical:investor
- timeline:asap
- vacant:true
- lead:new
- lead:quoted
- lead:won

Always preserve these standards when touching lead intake, pipeline, automation, CRM, or documentation files.

## Workflow Change Requirements

Before implementing changes:
- check for operational bottlenecks
- identify stale workflows
- protect scalability
- preserve package standardization

When implementing workflow or automation changes, update relevant:
- operational docs
- SOPs
- outreach YAML if present
- audit scripts if present
- KPI reporting
- GHL object standards

When adding new workflows, explain:
- ROI impact
- operational impact
- scalability impact
- risk reduction

Always suggest relevant opportunities for:
- KPI improvements
- automation opportunities
- stale-lead recovery
- missed-call text-back
- review flywheels
- recurring vendor infrastructure
- property-manager targeting

If a workflow can be standardized, automate it. If a workflow creates operational drift, constrain it.

## Scheduled Operations Standard

Run or design system checks for all operational systems at 00:00, 12:00, and 18:00 EST daily where scheduling infrastructure exists. Checks should prioritize Railway health, GHL connectivity, lead routing, pipeline integrity, environment-variable presence, and stale-lead detection.
