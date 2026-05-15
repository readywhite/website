# AI Estimate Rules

Build rules before AI. AI may assist with classification, summarization, and anomaly detection only after deterministic pricing and workflow constraints are documented.

## Approved AI uses

AI can assist with:

- summarizing customer notes
- checking whether required photos are missing
- suggesting condition tier from structured photo review notes
- identifying exception flags for human review
- drafting quote explanations from approved package logic
- comparing estimated vs. actual labor/material variance

## Restricted AI uses

AI must not independently:

- invent pricing outside package rules
- override vendor buy rates
- skip photo policy requirements
- move exception jobs directly to quote
- assign vendors without dispatch constraints
- mark jobs complete without photo proof review

## Deterministic gates

| Gate | Required before automation proceeds |
| --- | --- |
| Lead intake | Required contact fields and source tag. |
| Photos requested | Customer has received photo requirements. |
| Photos received | Files or explicit photo evidence logged. |
| Scope review | Canonical job object populated. |
| Quote sent | Package, add-ons, margin, and exception flags resolved. |
| Vendor assignment | Vendor package, SLA, availability, and scorecard check. |
| Completion | Photo proof submitted and reviewed. |

## Exception escalation

Escalate to operator review when any of these are present:

- water damage
- smoke damage
- stain blocking
- peeling paint
- severe holes
- custom repairs
- occupied-unit access risk
- unrealistic timeline
- missing required photos
- quote margin below target

## AI readiness rule

A workflow is AI-ready only when it has stable field names, deterministic statuses, package rules, exception paths, and audit checks.
