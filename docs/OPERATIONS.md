# Ready White Operational System

Ready White is not a traditional painting company. It is a standardized property-turnover operating system using subcontractor fulfillment, with Squarespace as the marketing layer, Railway as the backend orchestration layer, and GoHighLevel as the CRM and automation system.

The current priority is not launching AI. The milestone is creating machine-readable operational logic that can be documented, standardized, simplified, and operationalized.

## Operating priorities

Always optimize for:

- speed-to-lead
- operational reliability
- recurring property-management relationships
- standardized workflows
- reduced vacancy turnover time
- pipeline integrity
- fast execution
- scalable automation

Do not optimize for vanity features. Optimize for cash flow, close rate, automation, recurring revenue, and operational leverage.

## Daily systems checks

Run operational systems checks at **00:00, 12:00, and 18:00 America/New_York time** every day.

Recommended cron entries:

```cron
0 0,12,18 * * * cd /path/to/readywhite/website && npm run ops:check
```

The check command validates:

- Railway health endpoint reachability when `RAILWAY_HEALTH_URL` is provided.
- required GoHighLevel environment variables.
- standardized pipeline, stage, tag, and photo-policy objects in `config/ready-white-operations.yaml`.
- JavaScript syntax for the Railway backend and browser form code.

## Machine-readable operating source

`config/ready-white-operations.yaml` is the operational source of truth. Update it whenever a workflow, automation, SOP, KPI, vendor rule, pricing rule, or GHL object standard changes.

## Required GoHighLevel standards

Pipeline: **Ready White Customer Jobs**

Stages:

1. New Lead
2. Photos Requested
3. Photos Received
4. Scope Review
5. Quote Sent
6. Follow-Up
7. Approved
8. Vendor Assignment
9. Scheduled
10. In Progress
11. Photo Proof Review
12. Completed
13. Review Requested
14. Closed Won
15. Closed Lost

Standard tags:

- `source:squarespace`
- `vertical:property-management`
- `vertical:investor`
- `timeline:asap`
- `vacant:true`
- `lead:new`
- `lead:quoted`
- `lead:won`

## Customer photo policy

Require:

- one wide photo of each room
- one photo of the worst wall in each room
- photos of ceilings, trim, stains, peeling paint, water damage, smoke damage, holes, and heavy prep areas

Use these photos to prevent scope drift, protect margins, detect exception jobs, and preserve quote speed.

## Vendor policy

Do **not** build around flat hourly labor.

Use:

- preset package buy rates
- standard size bands
- standard add-ons
- exception escalation workflows

Hourly or change-order rates are only for severe prep, water damage, smoke/stain blocking, custom repairs, and approved scope exceptions.

Always enforce vendor scorecards, response SLAs, photo proof requirements, standardized scopes, callback tracking, and operational redundancy.

## Workflow change checklist

Before implementing workflow or automation changes:

1. Check for operational bottlenecks.
2. Identify stale workflows.
3. Protect scalability.
4. Preserve package standardization.
5. Explain ROI impact.
6. Explain operational impact.
7. Explain scalability impact.
8. Explain risk reduction.
9. Update operational docs, SOPs, outreach YAML, audit scripts, KPI reporting, and GHL object standards.

## Automation opportunities to keep prioritized

- stale-lead recovery
- missed-call text-back
- review flywheel after completed jobs
- property-manager targeting
- recurring vendor infrastructure
- quote follow-up by stage age
- photo request follow-up when photos are missing
