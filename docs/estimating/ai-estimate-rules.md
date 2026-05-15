# AI Estimate Rules

## Purpose
This document defines how Ready White classifies room condition, estimates dimensions, interprets customer photos, and decides whether a room can be quoted as a standard repaint, heavy turnover, or exception/restoration scope.

The goal is fast, standardized, margin-protected estimating. AI should support operational decisions, not invent custom scopes. When confidence is low, request targeted clarification instead of producing fragile precision.

## Core Estimate Flow
1. Identify the customer type, property type, vacancy status, timeline, and requested rooms.
2. Confirm whether the lead is residential, investor, property-management, or other recurring account potential.
3. Request required photos if missing.
4. Classify each room by size band, condition tier, occupancy/access status, and scope components.
5. Detect exception conditions before pricing.
6. Apply room pricing rules and add-ons.
7. Route the lead to the correct GHL stage.
8. Generate a quote, photo request, manual-review task, or exception escalation.

## Required Customer Photos
Require:
- 1 wide photo of each room.
- 1 photo of the worst wall in each room.
- Photos of ceilings when ceiling work or stains are present.
- Photos of trim when trim work or damage is present.
- Closeups of stains, peeling paint, water damage, smoke damage, holes, heavy prep, texture issues, and access constraints.

If photos are incomplete, AI should identify the missing decision-critical photo rather than asking for every possible photo again.

## Room Condition Classification
Classify every room into one condition tier. Use the highest visible condition that materially affects labor, materials, risk, or vendor payout.

### Tier 1: Rent-Ready Refresh
Use when:
- Walls are mostly clean.
- Only minor scuffs or nail holes are visible.
- No visible stains, peeling, moisture, smoke, or major repairs.
- The room appears empty or easy to access.
- Standard repaint assumptions are safe.

Operational action: quote base package.

### Tier 2: Standard Turnover
Use when:
- Moderate scuffs or normal rental wear are visible.
- Several nail holes or small dings are present.
- Minor patching is needed but repairs remain predictable.
- No major stains, peeling, water damage, or substrate concerns are visible.

Operational action: quote standard turnover tier or add 15%-25% to base room price.

### Tier 3: Heavy Turnover
Use when:
- Heavy scuffs, dirty walls, numerous holes, visible patches, rough previous paint lines, or minor staining are present.
- Prep time is clearly above normal but still controllable.
- Repairs are countable and do not require restoration methods.
- Customer photos are sufficient to define add-ons.

Operational action: quote heavy turnover tier, add repair line items, or route to scope review if repair count is unclear.

### Tier 4: Exception/Restoration
Use when:
- Water damage, active moisture, smoke damage, odor, peeling paint, bubbling, adhesion failure, suspected mold, major drywall damage, texture matching, or contamination is visible.
- High ceilings, stairwells, vaulted spaces, or access hazards are present.
- The surface may require primer systems, remediation, or multiple trades.
- The job cannot be safely fulfilled by standard package assumptions.

Operational action: do not auto-quote as a standard room. Route to manual review, request targeted photos, or issue an exception/change-order workflow.

## Dimensions Logic
Use dimensions in this priority order:
1. Customer-provided room dimensions.
2. Floor plan or listing data.
3. Known property/unit template from prior PM work.
4. AI visual estimate from photos.
5. Default size band with confidence score and clarification request.

Default size bands:
- Small: up to 120 sq ft.
- Standard: 121-200 sq ft.
- Large: 201-320 sq ft.
- Oversized/open area: 321+ sq ft or unclear open-concept scope.

When only images are available:
- Estimate relative scale using doors, windows, outlets, baseboards, ceiling height, and furniture.
- Avoid false precision. Classify into a size band rather than exact square footage when uncertainty is high.
- Ask for dimensions if the room appears near a pricing threshold or open-concept boundary.

## Image-Based Estimating Assumptions
AI may infer:
- Approximate room size band.
- Wall condition tier.
- Whether ceiling, trim, door, or repairs are visible.
- Whether the room appears vacant, occupied, cluttered, or access-constrained.
- Whether stains, peeling, holes, smoke, water damage, or heavy prep require escalation.

AI must not assume:
- Active leaks are resolved.
- Stains will not bleed through.
- Smoke odor is cosmetic only.
- Texture matching is simple.
- Furniture will be moved by the customer.
- Missing walls are in the same condition as visible walls.
- Ceiling or trim is included unless requested or clearly scoped.

## Occupancy and Access Assumptions
Classify access as:
- **Vacant/easy access**: no furniture or minimal obstruction; standard package assumptions apply.
- **Lightly occupied**: some furniture or belongings; add protection/moving assumptions or request confirmation.
- **Occupied/constrained**: significant belongings, pets, tenants, restricted hours, or access coordination; quote may require surcharge or manual review.
- **Unknown**: request occupancy confirmation before dispatch.

Occupied units increase scheduling risk, protection labor, callback risk, and vendor friction. Escalate if occupancy undermines package standardization.

## Repair Thresholds
Use these thresholds for estimating decisions:
- Minor nail holes: included in Tier 1 or Tier 2.
- Numerous nail holes or small dings: Tier 2 or Tier 3 depending on density.
- Small holes under 2 inches: add repair line items when countable.
- Medium holes 2-6 inches: add line items and request closeups if not clear.
- Large holes over 6 inches: manual review.
- Texture matching, skim coating, bubbling, peeling, or recurring cracks: manual review.
- Water stains or smoke stains: primer add-on or exception review depending on severity.

If repair count is unknown, AI should request a worst-wall photo or closeups before final quote.

## Repaint vs Restoration Logic
Classify as **standard repaint** when:
- Surface is sound.
- Prep is predictable.
- No primer system is required except routine spot priming.
- Standard two-coat application should produce an acceptable finish.

Classify as **heavy repaint/turnover** when:
- More prep is needed but the substrate is stable.
- Repairs are countable.
- Stains are minor and can be spot-primed.
- No active damage source is suspected.

Classify as **restoration/exception** when:
- Damage source may be unresolved.
- Odor, smoke, water, mold, adhesion failure, or peeling is present.
- Full primer systems or specialty products are required.
- Drywall replacement, texture matching, or multi-visit drying time may be required.
- Scope cannot be standardized from photos.

## Quote Confidence Levels
Use confidence levels to guide automation.

| Confidence | Criteria | Action |
| --- | --- | --- |
| High | Required photos present, size band clear, condition Tier 1-2, no exceptions. | Auto-generate package quote. |
| Medium | Minor missing detail, Tier 2-3, repair count mostly clear. | Generate quote with assumptions or request targeted clarification. |
| Low | Missing critical photos, unclear dimensions, possible Tier 4, occupied constraints. | Route to scope review before quote. |
| Exception | Visible restoration condition or non-standard access/surface risk. | Manual review/change-order workflow. |

## GHL Stage Mapping
- New incomplete lead: New Lead.
- Photos missing: Photos Requested.
- Photos submitted: Photos Received.
- Human or AI review required: Scope Review.
- Quote generated: Quote Sent.
- Quote not approved within follow-up window: Follow-Up.
- Quote accepted or deposit paid: Approved.
- Vendor selection started: Vendor Assignment.
- Job date confirmed: Scheduled.
- Vendor onsite: In Progress.
- Completion photos submitted: Photo Proof Review.
- Scope verified: Completed.
- Review automation triggered: Review Requested.
- Revenue finalized: Closed Won.
- Lost, unqualified, or declined: Closed Lost.

## Exception Detection Checklist
Escalate when any of the following appear or are reported:
- Water stain, wet drywall, bubbling, or active leak concern.
- Smoke staining or odor.
- Peeling or adhesion failure.
- Mold or suspected biological growth.
- Large holes or drywall replacement.
- Texture matching.
- Wallpaper removal.
- Popcorn ceiling removal or repair.
- High/vaulted ceiling or stairwell.
- Heavy furniture, hoarding, or unsafe access.
- Lead paint concern.
- Customer requests specialty finish, cabinets, exterior, or non-standard work.

## Operational Decision Rule
AI should maximize speed without hiding uncertainty. If the scope is standard, quote quickly. If the scope is uncertain, isolate the uncertainty, request the smallest missing input, and keep the lead moving through the pipeline.
