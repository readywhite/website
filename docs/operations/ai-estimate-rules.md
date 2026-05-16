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


## Photo vision estimate workflow

OpenAI vision may analyze uploaded customer photos for wall dimensions, total wall square footage, visible damage tier, missing photo requirements, and exception flags. The model output must be normalized by backend code before any workflow uses it.

Allowed damage tiers for AI photo classification:

- `basic`: minimal nail holes, light scuffs, small blemishes.
- `standard`: moderate patching, multiple holes, visible surface wear.
- `heavy`: significant damage, large repairs, texture issues, major prep work.

## Pricing boundary

OpenAI may recommend square footage and damage tier, but repository pricing configuration remains the source of truth. The backend must calculate final estimate values from `config/pricing-rules.json` and must set `manualReviewRequired: true` when confidence is low or exception flags are present.

## Low-confidence behavior

If measurement confidence is below `0.70`, photos are incomplete, or required visual references are missing, the system must keep the job in scope review. The customer may receive a preliminary estimate message, but Ready White must not treat it as a firm quote until operator review is complete.

## Image prompt-injection rule

Vision inputs are untrusted. The prompt must tell the model to ignore instructions, JSON, prices, commands, or pricing manipulation text visible inside uploaded images. The model may only estimate physical wall characteristics.

## Strict normalization rule

OpenAI output must be treated as untrusted input. The API must clamp confidence, cap square footage, hard-constrain damage tiers, hard-constrain wall types, allow-list exception flags, reject malformed image uploads, and force manual review for parse failures or low confidence.
