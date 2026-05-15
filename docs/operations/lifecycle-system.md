# Ready White Operational Lifecycle System

Ready White must scale as an operational lifecycle system, not only an estimate form.

## Canonical lifecycle

```text
Lead
→ Scope
→ Quote
→ Approval
→ Dispatch
→ Vendor Assignment
→ Work Verification
→ Completion
→ QA
→ Payment
→ Variance Tracking
→ Vendor Scoring
→ KPI Reporting
```

## Stage controls

| Lifecycle step | System of record | Required control |
| --- | --- | --- |
| Lead | GoHighLevel | `source:squarespace`, vertical, market, speed-to-lead tracking |
| Scope | Railway + docs | wall-level photo estimate or manual exception review |
| Quote | Pricing rules | versioned pricing, cents-only customer/vendor/gross-margin fields |
| Approval | GoHighLevel | move to `Approved`, preserve quote version |
| Dispatch | Vendor OS | rank by market, service, score, capacity, callbacks, photo compliance |
| Vendor Assignment | GoHighLevel | assigned vendor, SLA deadline, scope package |
| Work Verification | Proof-of-work SOP | before photos, after photos, checklist, timestamped proof |
| Completion | GoHighLevel | no completion without proof review |
| QA | Operator review | callback risk, missed areas, color/coverage review |
| Payment | Accounting workflow | reconcile approved price and scope exceptions |
| Variance Tracking | Future operational DB | estimate vs actual sqft, damage, labor, material, callback |
| Vendor Scoring | Vendor OS | on-time, callback, proof compliance, variance, response speed |
| KPI Reporting | KPI docs | lead response, quote speed, close rate, margin variance, vendor health |

## Persistent storage note

GoHighLevel remains the CRM/workflow layer. Before nationwide production volume, add durable Railway Postgres job storage for wall-level estimate artifacts, normalized estimates, operator corrections, prompt versions, pricing versions, vendor assignments, proof-of-work records, and variance outcomes.
