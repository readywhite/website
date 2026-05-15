# Ready White Operational Docs

This directory stores Ready White's operational memory: the reusable business logic, workflow language, pricing rules, automation assumptions, and architecture references that future software and AI agents should use.

## Documentation Areas
- `docs/pricing`: Package pricing, room pricing, add-ons, exclusions, vendor buy-rate logic, and margin guardrails.
- `docs/estimating`: AI and human estimating rules, photo interpretation, scope classification, and exception thresholds.
- `docs/workflows`: Customer intake, quote approval, vendor dispatch, completion verification, and payment workflows.
- `docs/vendors`: Vendor standards, scorecards, SLAs, buy rates, redundancy, proof requirements, and callback tracking.
- `docs/automation`: Scheduled checks, GHL automations, Railway orchestration, stale-lead recovery, and KPI reporting.
- `docs/architecture`: System maps, data flow, service boundaries, integration contracts, and production-safety assumptions.
- `docs/sales`: Property-manager outreach, lead qualification, quote language, follow-up scripts, and recurring-account playbooks.

## Operating Rule
When a workflow, automation, quote rule, vendor policy, or integration behavior changes, update the relevant documentation in the same pull request so Ready White's operational memory stays cumulative instead of conversational.
