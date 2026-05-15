# Ready White Company Context Repository

This `docs/` directory is Ready White's structured organizational memory. It gives Codex and future operators stable source material for workflows, business rules, pricing, vendor standards, GHL processes, and Railway/GitHub architecture.

## Documentation Map

| Area | File | Purpose |
| --- | --- | --- |
| Operations | `operations/operating-principles.md` | Company-wide operating model, KPIs, and daily system-check standard. |
| Pricing | `pricing/room-pricing.md` | Package pricing baseline, margin logic, and exception pricing guardrails. |
| Estimating | `estimating/ai-estimate-rules.md` | Photo-based estimating rules, scope verification, and exception detection. |
| Workflows | `workflows/customer-intake.md` | Website-to-GHL intake flow and speed-to-lead requirements. |
| Workflows | `workflows/vendor-dispatch.md` | Vendor assignment, scheduling, SLA, and proof requirements. |
| Vendors | `vendors/vendor-standards.md` | Vendor fulfillment rules, scorecards, and quality controls. |
| Sales | `sales/value-proposition.md` | Ready White positioning for property managers, investors, and turnover buyers. |
| Automation | `automation/ghl-workflows.md` | GHL pipeline, stages, tags, automations, and recovery workflows. |
| Architecture | `architecture/railway-github-ghl.md` | Production stack boundaries and integration responsibilities. |

## How Codex Should Use These Docs

Before changing workflow, automation, pricing, lead routing, or CRM behavior, review the relevant markdown files in this directory and the repo-root `AGENTS.md` file. Treat these documents as the default source of truth unless a newer explicit user instruction overrides them.

When operational behavior changes, update the matching document in the same commit so the repository remains operational memory rather than just application code.
