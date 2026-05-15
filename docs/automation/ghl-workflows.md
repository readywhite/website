# GoHighLevel Workflow Standards

GoHighLevel is the CRM and automation system for Ready White. Railway handles backend orchestration. Squarespace remains the marketing layer. Keep workflow objects deterministic and production-safe.

## Pipeline Standard

Pipeline name: **Ready White Customer Jobs**

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

## Tag Standard

Approved example tags:

- `source:squarespace`
- `vertical:property-management`
- `vertical:investor`
- `timeline:asap`
- `vacant:true`
- `lead:new`
- `lead:quoted`
- `lead:won`

Add new tags only when they support routing, reporting, or automation. Avoid vanity tags.

## Core Workflows

### New Lead Intake

- Trigger: form/webhook creates or updates opportunity.
- Conditions: pipeline equals **Ready White Customer Jobs**.
- Actions: apply source/lead tags, send auto-reply, notify internal team, create first-response task, and keep opportunity in **New Lead** or **Photos Requested** depending on photo completeness.
- ROI impact: faster contact improves close rate.
- Operational impact: reduces manual lead triage.
- Scalability impact: standardizes every inbound lead.
- Risk reduction: prevents untracked leads and missing follow-up.

### Photo Request / Missing Photos

- Trigger: opportunity enters **Photos Requested**.
- Actions: send photo checklist, remind customer/property manager, assign task if no photos arrive.
- ROI impact: increases quoteable lead percentage.
- Operational impact: prevents estimator back-and-forth.
- Scalability impact: makes photo collection repeatable.
- Risk reduction: reduces scope drift and margin leakage.

### Scope Review

- Trigger: opportunity enters **Photos Received** or **Scope Review**.
- Actions: create estimator task, apply exception tags if needed, keep quote blocked until package or escalation path is chosen.
- ROI impact: protects gross margin.
- Operational impact: separates standard jobs from exceptions.
- Scalability impact: trains the system around packages.
- Risk reduction: prevents underquoted severe-prep jobs.

### Quote Sent Follow-Up

- Trigger: quote sent.
- Actions: apply `lead:quoted`, move to **Quote Sent**, send reminders, move to **Follow-Up** when needed, and trigger stale-lead recovery after no response.
- ROI impact: improves quote-to-close conversion.
- Operational impact: removes coordinator memory burden.
- Scalability impact: makes follow-up consistent across markets.
- Risk reduction: reduces pipeline leakage.

### Approved Job / Vendor Assignment

- Trigger: customer approves quote.
- Actions: move to **Approved**, create vendor assignment task, send internal dispatch notification, then move to **Vendor Assignment** when a vendor is selected.
- ROI impact: accelerates revenue realization.
- Operational impact: shortens approved-to-scheduled cycle time.
- Scalability impact: keeps subcontractor fulfillment standardized.
- Risk reduction: prevents approved jobs from sitting unassigned.

### Completion / Review Flywheel

- Trigger: opportunity enters **Completed**.
- Actions: request review, move to **Review Requested**, tag satisfied customers, and create property-manager nurture task when applicable.
- ROI impact: increases referrals and repeat PM revenue.
- Operational impact: creates a consistent post-job loop.
- Scalability impact: turns completed jobs into acquisition assets.
- Risk reduction: catches unresolved issues before final close.

## Daily Operational System Checks

Run system checks at **00:00, 12:00, and 18:00 Eastern Time daily**. The check should cover:

- Squarespace lead form availability or webhook routing.
- Railway `/health` availability.
- GoHighLevel contact/opportunity routing readiness.
- Pipeline stage integrity.
- Required environment variables.
- Recent lead capture failures.
- Stale opportunities stuck in non-terminal stages.

Suggested cron expression when the scheduler timezone is set to `America/New_York`:

```cron
0 0,12,18 * * * /workspace/website/scripts/ops-system-check.sh
```

If the scheduler only supports UTC, convert Eastern Time carefully and account for daylight saving time using scheduler timezone support whenever possible.
