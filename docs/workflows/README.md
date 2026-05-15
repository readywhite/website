# Workflow Context

## Objective
Standardize every repeatable operating motion so Ready White can reduce vacancy turnover time, preserve pipeline integrity, and scale subcontractor fulfillment without operational drift.

## Required GHL Pipeline
Pipeline: `Ready White Customer Jobs`

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

## Required Tag Standards
Examples:
- `source:squarespace`
- `vertical:property-management`
- `vertical:investor`
- `timeline:asap`
- `vacant:true`
- `lead:new`
- `lead:quoted`
- `lead:won`

## Core Workflow Families
Document SOPs for:
- Speed-to-lead response.
- Missed-call text-back.
- Photo request and photo follow-up.
- Scope review and exception routing.
- Quote send and quote follow-up.
- Approval and deposit or payment collection.
- Vendor dispatch.
- Schedule confirmation.
- In-progress status checks.
- Photo proof review.
- Completion, review request, and closeout.
- Stale-lead recovery.

## Daily Operational Systems Checks
Run checks on all operational systems daily at:
- 00:00 EST.
- 12:00 EST.
- 18:00 EST.

Each check should confirm:
- Squarespace lead capture health.
- Railway API availability.
- GHL pipeline sync and automation health.
- Missed-call and text-back workflow health.
- Quote follow-up workflow health.
- Vendor dispatch queue health.
- Error logs and failed webhook retries.

## Future Artifacts
- `lead-intake-sop.md`
- `photo-request-sop.md`
- `quote-follow-up-sop.md`
- `stale-lead-recovery-sop.md`
- `daily-systems-checks.md`
- `pipeline-stage-definitions.md`
