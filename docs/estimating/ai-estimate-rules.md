# AI Estimate Rules

AI-assisted estimating exists to accelerate quote speed while preserving package standardization, margin protection, and operational reliability.

## Required Inputs

Every estimate request should collect:

- Customer name, phone, email, and property address.
- Property type and vacancy status.
- Timeline, especially `timeline:asap` jobs.
- Room list and requested surfaces.
- Photos meeting the Ready White photo policy.
- Notes on water damage, smoke damage, stains, holes, peeling paint, trim condition, ceiling condition, and access constraints.

## Customer Photo Policy

Require the customer or property manager to provide:

- 1 wide photo of each room.
- 1 photo of the worst wall in each room.
- Photos of ceilings when ceiling work is requested or damage is visible.
- Photos of trim when trim work is requested.
- Photos of stains, peeling paint, water damage, smoke damage, holes, and heavy prep areas.

Use photo evidence to prevent scope drift, protect package margins, detect exception jobs, and preserve quote speed.

## Estimate Decision Tree

1. Identify the room size band.
2. Select the closest package from `docs/pricing/room-pricing.md`.
3. Add standard add-ons only when photo evidence or intake confirms them.
4. Flag exceptions when damage, prep, access, or unknowns exceed package assumptions.
5. Route exception jobs to human review before quote delivery.
6. Produce a customer-facing quote summary and a vendor-facing scope summary from the same source of truth.

## AI Output Requirements

AI estimate output must include:

- Recommended package.
- Room size band.
- Included surfaces.
- Excluded surfaces.
- Required add-ons.
- Exception flags.
- Missing photo checklist.
- Confidence level: `high`, `medium`, or `review_required`.
- Suggested pipeline stage update.
- GHL tags to apply.

## GHL Tags

Use deterministic tags. Examples:

- `source:squarespace`
- `vertical:property-management`
- `vertical:investor`
- `timeline:asap`
- `vacant:true`
- `lead:new`
- `lead:quoted`
- `lead:won`

Do not invent one-off tags for each lead. If a new tag is needed, add it to the GHL object standards before using it in production automation.

## Exception Flags

Use these flags consistently:

| Flag | Meaning | Action |
| --- | --- | --- |
| `exception:severe-prep` | Prep exceeds normal patch/sand assumptions | Human review and potential change-order pricing. |
| `exception:water-damage` | Water staining, bubbling, soft drywall, or active moisture concern | Require review before quote. |
| `exception:smoke-stain` | Smoke, nicotine, or heavy stain blocking likely | Add stain-blocking scope or escalate. |
| `exception:custom-repair` | Repair scope cannot be standardized from photos | Human review. |
| `photos:missing` | Minimum photo policy not met | Move to Photos Requested and trigger reminder. |

## Guardrails

- Do not quote hourly labor as the default.
- Do not override vendor buy-rate standards without approved exception workflow.
- Do not send a quote when required photos are missing unless leadership explicitly approves.
- Do not let AI create new pipeline stages, custom fields, or GHL tags without updating standards docs.
