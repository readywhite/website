# GoHighLevel Object Standards

## Pipeline

Name: `Ready White Customer Jobs`

## Stages

1. `New Lead`
2. `Photos Requested`
3. `Photos Received`
4. `Scope Review`
5. `Quote Sent`
6. `Follow-Up`
7. `Approved`
8. `Vendor Assignment`
9. `Scheduled`
10. `In Progress`
11. `Photo Proof Review`
12. `Completed`
13. `Review Requested`
14. `Closed Won`
15. `Closed Lost`

## Standard tags

| Tag | Use |
| --- | --- |
| `source:squarespace` | Website/Squarespace lead source. |
| `vertical:property-management` | Property manager lead. |
| `vertical:investor` | Investor lead. |
| `timeline:asap` | Urgent lead requiring speed-to-lead priority. |
| `vacant:true` | Vacant unit/property. |
| `lead:new` | New unquoted lead. |
| `lead:quoted` | Quote has been sent. |
| `lead:won` | Job closed won. |
| `estimate:manual-review` | Photo estimate needs operator confirmation before firm quote. |
| `damage:basic` | AI/photo scope currently classified as basic damage. |
| `damage:standard` | AI/photo scope currently classified as standard damage. |
| `damage:heavy` | AI/photo scope currently classified as heavy damage. |

## Stage movement rules

- `New Lead` to `Photos Requested`: send instant SMS/email with photo policy.
- `Photos Requested` to `Photos Received`: only after photo evidence is logged.
- `Photos Received` to `Scope Review`: normalize intake into canonical job object, run photo estimate analysis, normalize damage tier, and attach pricing/manual-review output.
- `Scope Review` to `Quote Sent`: only after package, add-ons, margin, and exception status are resolved.
- `Approved` to `Vendor Assignment`: only after customer approval and target schedule are known.
- `In Progress` to `Photo Proof Review`: only after vendor submits required completion photos.
- `Completed` to `Review Requested`: only after proof review passes.

## Workflow ROI

These standards improve speed-to-lead, reduce stale opportunities, protect margin, enable package pricing, and preserve reporting integrity across GHL and Railway.


## Photo estimate custom-field targets

Create these as GHL custom fields when ready to preserve reporting integrity:

- `rw_estimated_wall_sqft`
- `rw_damage_tier`
- `rw_paint_option`
- `rw_estimate_confidence`
- `rw_manual_review_required`
- `rw_price_to_customer_cents`
- `rw_vendor_package`

Until custom fields are created, preserve the payload in Railway logs and use tags to trigger review workflows.

## Wall-estimate and national operations tags

Additional standardized tags for the wall-estimate and Vendor OS lifecycle:

- `estimate:ai-assisted`
- `estimate:manual-review`
- `estimate:confidence-high`
- `estimate:confidence-low`
- `estimate:manual-override`
- `estimate:pricing-versioned`
- `damage:basic`
- `damage:standard`
- `damage:heavy`
- `scope:high-complexity`
- `market:dallas`
- `market:houston`
- `market:atlanta`
- `market:phoenix`
- `market:san_francisco`

Wall-level estimates must remain attached to the canonical job payload as `walls[]` with wall ID, photo ID, square footage, damage tier, wall type, confidence, complexity score, manual-review status, and exception flags. GHL is the CRM/workflow layer; durable wall history should eventually live in Ready White operational storage.

## Control-system tags

Control-system alerts and anti-entropy workflows may add these standardized tags:

- `control:anomaly`
- `sla:speed-to-lead`
- `pipeline:stale-leads`
- `estimate:manual-review-spike`
- `risk:margin-drift`
- `dispatch:backlog`
- `qa:proof-backlog`
- `qa:sampling-increased`
- `vendor:probation`
- `vendor:sla-watch`
- `proof:non-compliant`
- `variance:vendor-drift`

These tags should route work to operator review, vendor coaching, stale-lead recovery, pricing review, or QA sampling. They must not bypass the approved `Ready White Customer Jobs` pipeline stages.

## Operational database identifiers

When Railway Postgres is enabled, preserve these IDs in GHL custom fields or notes so CRM activity can be joined back to operational memory:

- `rw_job_id`
- `rw_wall_ids`
- `rw_latest_event_id`
- `rw_pricing_rules_version`
- `rw_control_snapshot_version`

GHL remains the workflow/relationship layer; the operational database becomes the audit and replay source of truth.

## Stabilization tags

During calibration, use these tags to protect quote discipline and reporting:

- `estimate:calibration-review`
- `scope:premium-review`
- `vendor:onboarding-incomplete`
- `vendor:onboarding-complete`

`estimate:calibration-review` means the estimate is preliminary until an operator approves the quote.

## Actuals and validation tags

Use these tags during operational truth collection:

- `actuals:required`
- `actuals:recorded`
- `validation:feature-freeze`
- `validation:operational-truth`

Do not move a completed job into reporting-ready status until actuals are recorded or an approved exception is documented.

## Trusted estimate and photo evidence policy

GoHighLevel opportunity value must be derived from server-verified `signedEstimatePayload.pricing.priceToCustomerCents`, never from mutable browser pricing fields. Lead payloads with uploaded photos must include durable `photoUrls`; filenames alone are insufficient for Scope Review, Photo Proof Review, variance review, or callback defense.
