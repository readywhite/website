# Ready White Operations Documentation

This documentation tree is the operational memory scaffold for Ready White. It defines how the business should standardize fast-turn occupancy repainting, package-based quoting, AI-assisted estimating, GHL pipeline execution, vendor dispatch, and Railway-backed automation without adding application logic yet.

## Operating model

Ready White is a standardized property-turnover operating system using subcontractor fulfillment. The goal is to reduce vacancy turnover time for property managers, investors, and recurring accounts through repeatable scopes, fast quote cycles, and vendor-ready work packages.

Core operating principles:

- Speed-to-lead beats manual perfection.
- Standardized packages protect margin and close rate.
- Customer photos are required to prevent scope drift.
- GHL owns pipeline integrity and follow-up automation.
- Railway orchestrates backend API workflows and integrations.
- GitHub preserves operational memory, decisions, SOPs, and standards.
- Vendor workflows should use buy-rate packages, scorecards, SLAs, and proof photos.

## Documentation map

- [`pricing/`](pricing/README.md): standardized room pricing, package bands, add-ons, and margin controls.
- [`estimating/`](estimating/README.md): AI-assisted estimating workflow, customer photo requirements, exception detection, and quote review.
- [`workflows/`](workflows/README.md): lead-to-completion SOPs, GHL stage movement, daily checks, and operational handoffs.
- [`vendors/`](vendors/README.md): vendor dispatch, buy-rate policy, proof requirements, redundancy, and scorecards.
- [`automation/`](automation/README.md): GHL automation, Railway orchestration, audit jobs, recovery flows, and KPI reporting.
- [`sales/`](sales/README.md): property-manager targeting, speed-to-lead, follow-up sequences, review flywheel, and recurring account growth.
- [`architecture/`](architecture/README.md): stack boundaries for Squarespace, Railway, GoHighLevel, and GitHub.

## Required daily systems checks

Run operational systems checks at:

- 00:00 EST.
- 12:00 EST.
- 18:00 EST.

Each check should verify lead intake, GHL pipeline integrity, automation health, vendor assignment status, stale leads, missed-call recovery, quote follow-up, and completed-job review requests.
