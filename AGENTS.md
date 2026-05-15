# Ready White Operating Constitution

## Mission
Ready White is an AI-native operational platform for standardized property turnover, not a traditional painting company and not merely a marketing website. The repo should compound operational memory into repeatable systems, pricing logic, workflows, vendor standards, automation, and production-safe software.

## Business Goals
Always optimize for:
- Speed-to-lead and fast quote turnaround.
- Operational reliability and deterministic execution.
- Recurring property-management relationships.
- Standardized workflows and package-based quoting.
- Reduced vacancy turnover time.
- Pipeline integrity and stale-lead recovery.
- Cash flow, close rate, recurring revenue, and operational leverage.
- Scalable automation that reduces manual coordination without creating drift.

Do not optimize for vanity features. Prefer practical improvements that improve conversion, fulfillment reliability, margin protection, or repeatable property-manager workflows.

## Core Terminology
- **Ready White**: The property-turnover operating system and customer-facing brand.
- **Customer**: A homeowner, investor, property manager, leasing office, or asset operator requesting turnover painting or related make-ready work.
- **Property Manager (PM)**: A recurring B2B customer managing multiple rental units or properties.
- **Turnover**: A standardized make-ready scope intended to reduce vacancy time and prepare a unit for listing, leasing, sale, or occupancy.
- **Package**: A preset sellable scope with standard room-size bands, condition tiers, inclusions, exclusions, and vendor buy rates.
- **Vendor**: A subcontractor or fulfillment partner assigned to complete standardized scopes.
- **Buy Rate**: The preset vendor payout for a package, size band, tier, or approved add-on.
- **Sell Price**: The customer-facing price quoted by Ready White.
- **Gross Margin**: Sell price minus vendor buy rate, materials allowance, platform costs, and approved add-ons.
- **Exception Job**: A scope that exceeds standard package assumptions and requires escalation, manual review, change order, or restoration pricing.
- **Photo Proof**: Required before/after/vendor completion photos used to protect margin, verify scope, and reduce callbacks.
- **GHL**: GoHighLevel, the CRM and automation system of record.
- **Railway API**: Backend orchestration layer for estimate logic, integrations, scheduled checks, and automation services.
- **Squarespace**: Marketing layer and public intake surface.

## Architecture Assumptions
Never redesign the stack unnecessarily. Preserve the current operating architecture unless a change has clear ROI, operational, reliability, or security justification.

Default stack:
1. Squarespace is the marketing layer and form/intake entry point.
2. Railway is the backend orchestration layer.
3. Estimate Engine applies pricing, estimating, photo, and exception logic.
4. GoHighLevel is the CRM, pipeline, messaging, follow-up, and automation system.
5. Vendor Dispatch coordinates subcontractor assignment, scheduling, proof, and completion.
6. Invoicing and payment close the loop after approval or completion, depending on the package and customer type.

System path:
Customer -> Squarespace Form -> Railway API -> Estimate Engine -> GHL Pipeline -> Vendor Dispatch -> Completion Photos -> Invoice -> Payment.

## Required GHL Standards
Pipeline: **Ready White Customer Jobs**

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

Preserve standardized GHL object names. When adding workflows, document ROI impact, operational impact, scalability impact, and risk reduction.

## Pricing Philosophy
Ready White should use package-based quoting, standard size bands, standard condition tiers, and preset vendor buy rates. Do not build around flat hourly labor except for approved exceptions.

Pricing must protect:
- Minimum trip economics.
- Gross margin after vendor payout and materials.
- Speed of quote generation.
- Repeatable vendor fulfillment.
- Scope clarity and callback prevention.
- Ability to serve recurring PM customers quickly.

Hourly or change-order rates are only for severe prep, water damage, smoke or stain blocking, custom repairs, approved scope exceptions, and restoration-level work.

## Workflow Philosophy
If a workflow can be standardized, automate it. If a workflow creates operational drift, constrain it.

Before implementing changes:
- Check for operational bottlenecks.
- Identify stale workflows and failure points.
- Protect package standardization.
- Preserve vendor redundancy and response SLAs.
- Protect environment-variable security.
- Preserve deterministic scripts and stable naming conventions.
- Update relevant operational docs, SOPs, outreach YAML, audit scripts, KPI reporting, and GHL object standards when workflow or automation behavior changes.

## Customer Photo Policy
Require:
- 1 wide photo of each room.
- 1 photo of the worst wall in each room.
- Photos of ceilings, trim, stains, peeling paint, water damage, smoke damage, holes, and heavy prep areas when present.

Use photos to:
- Prevent scope drift.
- Protect margins.
- Detect exception jobs.
- Preserve quote speed.
- Support completion verification and callback defense.

## Vendor Policy
Do not build vendor workflows around flat hourly labor. Use preset package buy rates, standard size bands, standard add-ons, and exception escalation workflows.

Always enforce:
- Vendor scorecards.
- Response SLAs.
- Photo proof requirements.
- Standardized scopes.
- Callback tracking.
- Operational redundancy.
- Completion verification before final closeout.

## Automation Priorities
Highest-value automations:
- Missed-call text-back.
- Instant lead acknowledgement.
- Photo request and reminder sequences.
- AI-assisted scope classification.
- Quote generation using documented pricing rules.
- Stale-lead recovery.
- Vendor availability and dispatch.
- Completion-photo verification.
- Review requests after completion.
- KPI reporting for lead speed, quote speed, win rate, margin, cycle time, callback rate, and vendor reliability.

Run systems checks on all operational systems at 00:00, 12:00, and 18:00 Eastern Time daily when scheduled automation infrastructure exists.

## Documentation Standards
Operational documentation is first-class product infrastructure. Keep language standardized and reusable. Use docs as the source of truth for pricing, workflows, estimating rules, architecture, vendors, automation, sales, and KPI definitions.

When adding or changing operational logic, update the relevant documentation in the same change. Prefer clear rules, tables, thresholds, and decision trees over vague prose.

## Code Style and Safety
- Never put try/catch blocks around imports.
- Prefer deterministic scripts and explicit naming.
- Keep secrets in environment variables, never committed files.
- Favor production-safe architecture over experiments.
- Avoid unnecessary stack changes.
- Write changes that a future automation engine can consume.
