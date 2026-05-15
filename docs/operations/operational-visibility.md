# Operational Visibility Dashboard Requirements

Operational visibility must move earlier than a polished software dashboard. The first version can be a deterministic snapshot/report as long as it centralizes market health, vendor health, and workflow bottlenecks.

## Minimum visibility surface

| Widget | Why it matters |
| --- | --- |
| Live market health | shows speed-to-lead, stale leads, manual-review rate, margin drift |
| Vendor performance heatmap | compares callbacks, proof compliance, on-time rate, variance |
| Pipeline bottlenecks | finds stuck `New Lead`, `Photos Requested`, `Quote Sent`, `Vendor Assignment`, `Photo Proof Review` jobs |
| Callback clustering | identifies vendor, market, wall type, paint, and damage-tier patterns |
| Margin drift | catches pricing config problems before market expansion |
| SLA tracking | protects recurring property-manager relationships |
| Throughput forecast | identifies capacity constraints before accepting too much work |

## Source of truth plan

- **Now:** deterministic sample snapshots and GoHighLevel pipeline audits.
- **Next:** Railway Postgres job storage for wall estimates, quote versions, corrections, proof-of-work, vendor assignments, and variance outcomes.
- **Later:** authenticated dashboard fed by GHL, Postgres, vendor scorecards, and alert history.

## Dashboard gating rules

A dashboard is not just reporting. It should eventually trigger gates:

- high manual-review rate → tighten photo instructions and QA sampling,
- margin drift → freeze automatic quotes in that market,
- callback spike → reduce vendor dispatch weighting,
- proof backlog → block completion movement,
- stale leads → run recovery workflows,
- market capacity shortage → slow lead scaling or activate overflow vendors.

## Early admin endpoint

`GET /api/ops-dashboard` returns the current deterministic visibility payload. Until `DATABASE_URL` is connected, it uses `config/ops-snapshot.example.json`; after durable storage is connected, this endpoint should read from Railway Postgres and GHL-derived snapshots.

Production access requires `ADMIN_API_TOKEN`.
