# Operational Control Systems

Ready White should scale as a feedback-loop operating system, not only an SOP company. The control system detects operational variance, assigns root-cause categories, recommends corrective actions, and prevents regional workflow drift before it becomes organizational entropy.

## Control-loop pattern

```text
Metric drift detected
→ anomaly classified
→ owner assigned
→ workflow gate adjusted
→ QA / dispatch / pricing action triggered
→ outcome measured
→ scorecard and SOP updated
```

Example:

```text
Vendor callback rate rises
→ system detects anomaly
→ QA sampling increases
→ dispatch weighting decreases
→ vendor retraining triggered
→ vendor probation initiated if critical
→ scorecard adjusted after correction window
```

## Deterministic control script

Run the control check manually or from a future authenticated monitor:

```bash
npm run ops:control
```

The command reads `config/ops-snapshot.example.json` by default and evaluates it against `config/control-thresholds.json`. Production snapshots should eventually come from durable Railway Postgres job storage, GoHighLevel pipeline state, vendor scorecards, and proof-of-work records.

## Control domains

| Domain | Drift detected | Default correction |
| --- | --- | --- |
| Speed-to-lead | median response exceeds target | audit missed-call text-back, assign response owner |
| Pipeline integrity | stale stage counts exceed limits | run stale-lead recovery and audit automation |
| Photo estimate quality | manual-review spike | inspect paper-reference compliance and prompt/schema drift |
| Margin control | market margin variance | freeze auto-quote for market and review pricing config |
| Dispatch | vendor assignment backlog | run vendor ranking and activate overflow capacity |
| QA | proof-review backlog | increase review capacity and block completion without proof |
| Vendor quality | callback rate spike | increase QA sampling, reduce dispatch weight, retrain/probate vendor |
| Proof compliance | proof-photo compliance drops | block completion without proof and require vendor retraining |
| Variance control | estimate vs actual drift | sample recent jobs and update pricing/training data |

## ROI / operational impact / scalability / risk reduction

- **ROI impact:** catches margin leaks, callback clusters, stale leads, and vendor drift before they compound across markets.
- **Operational impact:** operators get recommended actions instead of manually hunting through CRM records.
- **Scalability impact:** every market is measured against the same thresholds, reducing local improvisation.
- **Risk reduction:** high-risk vendors, pricing drift, and QA backlog are constrained by system rules before customer experience decays.

## Anti-entropy rules

- New workflows must define a measurable control metric.
- Every anomaly must map to an owner, action, tag, and correction window.
- Manual exceptions must be structured; free-form tribal knowledge is not an operating system.
- Dispatch weighting, QA sampling, pricing review, and vendor probation should eventually become system decisions with human override.
- Control thresholds belong in versioned config, not hidden in individual operator habits.
