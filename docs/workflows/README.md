# Workflow Documentation

This folder defines Ready White's operating workflows from lead intake through completion, review request, and closed-won reporting.

## Workflow goals

- Preserve speed-to-lead.
- Keep GHL pipeline stages accurate.
- Standardize handoffs between sales, estimating, dispatch, vendors, and completion review.
- Reduce stale leads, missed calls, and unassigned approved jobs.
- Keep workflows scalable enough for recurring property-management volume.

## Required GHL pipeline

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

## Standard lead-to-completion flow

1. **New Lead:** lead captured from Squarespace, phone, referral, or outbound campaign.
2. **Photos Requested:** incomplete photo set triggers automated request.
3. **Photos Received:** photos meet minimum intake requirements.
4. **Scope Review:** estimator confirms package, add-ons, exceptions, and quote readiness.
5. **Quote Sent:** standardized quote delivered with clear scope and assumptions.
6. **Follow-Up:** automated and manual follow-up prevents stale opportunities.
7. **Approved:** customer approves quote and schedule window.
8. **Vendor Assignment:** vendor is dispatched with standard scope and proof requirements.
9. **Scheduled:** date, access details, and vendor confirmation are captured.
10. **In Progress:** job is underway and exceptions require approval before change order.
11. **Photo Proof Review:** completion photos are checked against the scope.
12. **Completed:** work is accepted operationally.
13. **Review Requested:** customer receives review request and relationship-building follow-up.
14. **Closed Won:** payment, completion, and review workflow are resolved.
15. **Closed Lost:** lost reason is captured for KPI analysis.

## Daily systems checks

Run checks at 00:00, 12:00, and 18:00 EST for:

- New leads without response.
- Leads missing photos.
- Quotes not followed up.
- Approved jobs without vendor assignment.
- Scheduled jobs missing vendor confirmation.
- In-progress jobs missing proof photos.
- Completed jobs missing review requests.
- Closed-lost reasons and recovery candidates.

## Future documents

- `lead-intake-sop.md`
- `photo-request-sop.md`
- `quote-follow-up-sop.md`
- `daily-systems-check.md`
- `stale-lead-recovery.md`
- `missed-call-text-back.md`
