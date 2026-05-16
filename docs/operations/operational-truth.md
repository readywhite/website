# Operational Truth Collection Plan

Ready White has enough architecture for the current stage. The next 90–120 days are about operational validation, not feature expansion.

## Feature freeze rule

`config/operational-validation-plan.json` keeps feature freeze enabled until Ready White has enough real-world evidence from jobs, walls, vendors, QA, callbacks, queue behavior, and actual margins.

Do not add new service lines, unvalidated markets, firm auto-quotes, premium/luxury auto-quotes, or vendor dispatch without completed onboarding while the validation phase is active.

## Operational truth targets

| Signal | Target |
| --- | ---: |
| Real wall photos | 1,000 |
| Completed jobs with actuals | 100 |
| Correction coverage | 90% |
| Actuals coverage | 90% |
| Active vendors with scorecards per market | 3 |
| Queue dead-letter rate | under 1% |
| Manual-review backlog | under 15 |

## Actuals required immediately

Every completed job/wall should capture:

- actual square footage,
- actual damage tier,
- actual complexity score,
- actual labor hours,
- actual material cost,
- actual completion time,
- callback required,
- QA failure,
- repaint required,
- customer satisfaction,
- variance reason,
- vendor ID,
- recorder/operator.

Use `POST /api/job-actuals` to validate and persist actuals when `DATABASE_URL` is configured. Without `DATABASE_URL`, the endpoint validates the object and returns a non-persisted warning for local testing.

## Vendor intelligence questions

Operational data must eventually answer instantly:

- best repaint vendor by market,
- lowest callback vendor by market,
- fastest turnaround vendor by market,
- highest margin vendor by market,
- most reliable multifamily vendor by market.

## ROI / operational impact / scalability / risk reduction

- **ROI impact:** actuals expose margin leaks and pricing calibration gaps.
- **Operational impact:** managers stop relying on memory and can see real execution variance.
- **Scalability impact:** new markets are blocked until operating data proves repeatability.
- **Risk reduction:** feature freeze prevents architectural overexpansion before real jobs validate the system.
