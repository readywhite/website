# Operational KPIs

Track KPIs that improve cash flow, close rate, automation, recurring revenue, and operational leverage.

## Core KPI loop

| KPI | Target behavior |
| --- | --- |
| speed-to-lead | Contact every new lead immediately through GHL automation. |
| photo completion rate | Increase complete photo submissions before scope review. |
| AI estimate confidence | Increase percentage of estimates above confidence threshold through better photo instructions. |
| manual review rate | Keep exception reviews focused on true scope risk, not missing intake fields. |
| quote cycle time | Reduce time from photos received to quote sent. |
| quote approval rate | Identify pricing or follow-up issues. |
| stale lead count | Trigger recovery before pipeline decay. |
| vendor response time | Protect dispatch speed. |
| on-time completion rate | Protect recurring PM relationships. |
| estimate labor variance | Improve pricing and scope classification. |
| estimate materials variance | Improve package cost assumptions. |
| gross margin by package | Protect target margin and package economics. |
| callback rate | Identify vendor quality and scope issues. |
| review request completion | Build review flywheel after successful jobs. |

## Daily system checks

Run documented operational system checks at 00:00, 12:00, and 18:00 Eastern Time. At each check, review Railway health, OpenAI photo estimate fallback rate, GHL pipeline integrity, stale leads, failed webhooks, unassigned approved jobs, overdue photo proof, and missed-call text-back status.

## Nationwide operating KPIs

- Speed-to-lead by market and source.
- Photo estimate completion rate and manual-review rate.
- Wall-level estimate variance: estimated sqft vs corrected/actual sqft.
- Damage-tier variance: AI tier vs operator/vendor actual tier.
- Vendor response SLA by market.
- Vendor proof-photo compliance rate.
- Callback rate by vendor, market, wall type, and damage tier.
- Gross margin variance by market and pricing rules version.
- Stale-lead recovery rate for `New Lead`, `Photos Requested`, `Quote Sent`, and `Follow-Up`.

## Control-system KPIs

These metrics should feed `npm run ops:control` snapshots and future dashboards:

- Median speed-to-lead by market and source.
- Stale lead counts by GHL stage.
- Photo-estimate manual-review rate by market.
- Gross margin variance by market and pricing rules version.
- Proof-review backlog in `Photo Proof Review`.
- Vendor assignment backlog by market.
- Vendor callback rate, on-time rate, proof-photo compliance, and estimate variance.
- QA sampling rate after anomaly detection.
- Dispatch-weight reductions triggered by control rules.
- Vendor probation count and correction-window outcomes.
