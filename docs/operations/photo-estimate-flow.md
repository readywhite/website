# Photo Estimate Flow SOP

## Purpose

Use uploaded wall photos to accelerate quote intake while protecting Ready White from scope drift, margin leakage, and unmanaged vendor exceptions.

## Operating sequence

1. Customer submits contact, property, paint, timeline, occupancy, room count, notes, and wall photos.
2. `/api/photo-estimate` validates image type/size and sends images to OpenAI vision analysis.
3. OpenAI returns structured wall square footage, wall dimensions, damage tier, confidence, missing-photo requirements, and exception flags.
4. Backend calculates price with `config/pricing-rules.json`.
5. Browser submits the standardized lead, canonical job object, estimate, and GHL tags to `/api/ghl-lead`.
6. GoHighLevel automation starts in `Ready White Customer Jobs` / `New Lead`.
7. Low-confidence or exception jobs remain in `Scope Review` until operator approval.

## Photo intake requirements

- 1 wide photo of each room.
- 1 photo of the worst wall in each room.
- Photos of ceilings, trim, stains, peeling paint, water damage, smoke damage, holes, and heavy prep areas.

## Damage tiers

| Tier | Definition | Package intent |
| --- | --- | --- |
| `basic` | Minimal nail holes, light scuffs, small blemishes. | `basic_turn` |
| `standard` | Moderate patching, multiple holes, visible surface wear. | `standard_turn` |
| `heavy` | Significant damage, large repairs, texture issues, major prep. | `heavy_turn` or exception review |

## Manual review triggers

- Measurement confidence below `0.70`.
- Missing required photos.
- Water damage, smoke damage, stain blocking, peeling paint, large holes, texture repair, ceiling damage, or trim damage.
- Quote below target margin.
- Customer notes conflict with AI image assessment.
- Any occupied-unit access risk or rush timeline with insufficient scope evidence.

## ROI impact

- Faster speed-to-lead by producing a preliminary package estimate immediately.
- Better close rate because property managers get quick, structured next steps.
- Stronger margins because exceptions are flagged before vendor dispatch.

## Operational impact

- Standardizes intake fields and damage tiers before GHL handoff.
- Keeps deterministic pricing in repo config instead of ad hoc founder judgment.
- Creates structured variance data for future pricing improvements.

## Scalability impact

- Makes photo review repeatable across leads and future intake channels.
- Creates stable payloads for CRM automation, KPI reporting, and vendor scorecards.

## Risk reduction

- AI can assist, but cannot bypass confidence gates or invent pricing.
- Low-confidence measurements route to manual review instead of firm quotes.
- Severe prep and damage remain exception workflows.
