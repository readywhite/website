# Vendor Operating System Standards

Ready White vendors are standardized execution units, not random subcontractors. Vendor routing must protect speed, proof quality, package consistency, and recurring property-manager relationships.

## Vendor scorecard object

```json
{
  "vendor_id": "vendor_dallas_a",
  "markets": ["dallas", "houston"],
  "services": ["interior_repaint", "make_ready_refresh"],
  "score": 92,
  "on_time_rate_bps": 9600,
  "callback_rate_bps": 300,
  "photo_compliance_rate_bps": 9800,
  "avg_variance_bps": 700,
  "capacity_open_jobs": 4,
  "avg_response_minutes": 18
}
```

## Dispatch ranking factors

`lib/dispatch.js` ranks vendors by:

1. market match,
2. service/package match,
3. scorecard quality score,
4. on-time rate,
5. callback rate,
6. proof-photo compliance,
7. estimate variance,
8. current capacity,
9. response speed.

## Required vendor policies

- Use preset package buy rates, size bands, standard add-ons, and exception escalation.
- Do not build the operating model around flat hourly labor.
- Require before photos, after photos, wall IDs, completion checklist, and timestamped proof.
- Track callbacks, photo compliance, response SLA, estimate variance, and operator corrections.
- Maintain redundancy in each market before increasing lead volume.

## Manual escalation

Route severe prep, water damage, smoke/stain blocking, custom repairs, high complexity, missing proof photos, and callback-risk jobs to operator review before completion or additional dispatch.

## Control-system feedback loops

Vendor scorecards must feed the control system. If callback rate, proof-photo compliance, on-time rate, or variance crosses configured thresholds, the system should recommend one or more of:

- increased QA sampling,
- dispatch weight reduction,
- vendor retraining,
- vendor probation,
- overflow vendor activation,
- temporary market capacity hold.

This converts vendor management from founder memory into a measurable execution network.

## Vendor onboarding gate

Use `docs/operations/vendor-onboarding.md` and `config/vendor-onboarding-checklist.json` before activating a vendor. Do not dispatch production work to vendors that have not acknowledged scope standards, package buy rates, photo proof requirements, response SLAs, callback policy, and completion rules.

Additional scorecard fields now include QA failure rate and customer satisfaction so vendor quality can be managed as an execution network rather than local relationship memory.
# Vendor Standards

Ready White uses subcontractor fulfillment through standardized packages, not open-ended hourly labor.

## Vendor operating rules

- Assign vendors by package fit, availability, service area, scorecard, and response SLA.
- Require start, progress, and completion photo proof for every job.
- Track callback rate by vendor and job type.
- Maintain operational redundancy so one unavailable vendor does not block dispatch.
- Use exception/change-order rates only for approved severe prep, water damage, smoke/stain blocking, custom repairs, and other documented scope exceptions.

## Scorecard fields

| Metric | Why it matters |
| --- | --- |
| response time | Protects speed-to-lead and dispatch reliability. |
| acceptance rate | Measures capacity reliability. |
| on-time start | Reduces vacancy turnover time. |
| on-time completion | Protects PM relationships. |
| photo proof compliance | Reduces quality drift and callbacks. |
| callback rate | Measures execution quality. |
| estimate variance | Improves package economics. |

## Dispatch priority

1. Recurring property-manager jobs with vacancy impact.
2. Vacant units with 24- or 48-hour timeline.
3. Approved quotes with complete photo evidence.
4. Standard residential leads.
5. Exception jobs after operator review.
