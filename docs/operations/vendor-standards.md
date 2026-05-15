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
