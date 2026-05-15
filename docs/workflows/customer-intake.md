# Customer Intake Workflow

Customer intake is optimized for speed-to-lead, complete photo capture, fast quote turnaround, and recurring property-manager relationships.

## Source Architecture

```text
Squarespace marketing form
    ↓
Railway backend orchestration (/api/ghl-lead)
    ↓
GoHighLevel CRM, pipeline, automations, tasks, and reporting
```

Do not redesign this stack unless a production reliability issue requires it.

## Intake Steps

1. Capture the lead from Squarespace or another approved source.
2. Upsert the contact in GoHighLevel.
3. Create or update an opportunity in **Ready White Customer Jobs**.
4. Apply deterministic tags such as `source:squarespace`, `lead:new`, `timeline:asap`, and `vacant:true` when applicable.
5. Move the opportunity to **New Lead**.
6. Send an immediate confirmation message.
7. If photos are incomplete, move to **Photos Requested** and trigger photo-request automation.
8. When photos are complete, move to **Photos Received** and queue scope review.
9. Complete package estimate or exception escalation.
10. Send quote and move to **Quote Sent**.
11. Run follow-up, stale-lead recovery, and close/lost capture based on pipeline state.

## Required Intake Fields

| Field | Purpose |
| --- | --- |
| Name, phone, email | Speed-to-lead and multi-channel follow-up. |
| Property address | Job record, vendor dispatch, and PM portfolio tracking. |
| Company / property manager name | Recurring relationship segmentation. |
| Property type | Package assumptions and vertical reporting. |
| Vacancy status | Turnover priority and scheduling expectations. |
| Timeline | SLA routing and urgency tags. |
| Room count / scope notes | Preliminary package sizing. |
| Photo links or uploads | Scope verification and margin protection. |

## Photo Intake Checklist

Before marking **Photos Received**, confirm:

- One wide photo per room.
- One worst-wall photo per room.
- Ceiling photos when ceiling work or damage is relevant.
- Trim photos when trim work is requested.
- Damage photos for stains, peeling paint, holes, water damage, smoke damage, and heavy prep.

If the checklist is incomplete, keep the opportunity in **Photos Requested** and send the missing-photo message.

## Speed-to-Lead SLA

- Missed-call text-back: immediate.
- Form submission auto-reply: immediate.
- Internal notification: immediate.
- First human review for complete photo leads: target under 15 minutes during business coverage.
- Photo-missing reminder: same day, then stale-lead sequence.

## KPI Tracking

Track these intake KPIs weekly:

- New lead volume by source.
- Median first-response time.
- Percent of leads with complete photos on first submission.
- Quote turnaround time.
- Quote sent-to-approved conversion rate.
- Stale lead recovery rate.
- Property-manager repeat lead rate.
