# Room Pricing Rules

## Purpose
This document defines the operational pricing logic for Ready White room-level painting packages. It is the source of truth for AI quoting, estimate APIs, vendor payout logic, margin calculations, and package standardization.

Ready White prices should be fast, repeatable, margin-protected, and easy for vendors to fulfill. The goal is not to estimate every job like a custom painting contractor. The goal is to classify each room into a standardized size band, condition tier, and package scope, then escalate exceptions before margin is exposed.

## Pricing Principles
1. Protect minimum trip economics before optimizing per-room price.
2. Quote from packages, size bands, and condition tiers before custom line items.
3. Use photos to verify scope, not to create unlimited customization.
4. Keep customer-facing prices simple and vendor scopes precise.
5. Escalate exception jobs quickly instead of forcing them into standard pricing.
6. Use preset vendor buy rates rather than flat hourly labor.
7. Preserve gross margin after vendor payout, materials, travel, platform costs, and callback risk.

## Minimum Pricing
Minimum pricing applies before discounts, recurring-account adjustments, or bundled property-manager pricing.

| Scope Type | Customer Minimum | Operational Rule |
| --- | ---: | --- |
| Single room repaint | $350 | Applies when only one room is requested and no larger project minimum applies. |
| Small interior visit | $650 | Recommended minimum for any dispatched vendor visit with multiple small areas. |
| Turnover package | $1,200 | Recommended minimum for vacant unit turnover unless PM contract pricing exists. |
| Exception/restoration visit | Manual review | Water damage, smoke, heavy staining, peeling, texture repair, or major drywall repair requires escalation. |

Minimums exist to protect drive time, scheduling overhead, setup, cleanup, materials acquisition, QA, admin, payment processing, and callback risk.

## Target Pricing by Room Size
Use floor square footage as the primary sizing input when dimensions are available. When only photos are available, classify using visual size bands and request clarification if confidence is low.

| Room Size Band | Assumed Floor Area | Typical Wall Paintable Area | Target Customer Price | Notes |
| --- | ---: | ---: | ---: | --- |
| Small room | up to 120 sq ft | 300-420 sq ft | $350-$500 | Bedrooms, offices, small dining rooms. |
| Standard room | 121-200 sq ft | 420-600 sq ft | $500-$750 | Average bedrooms and living areas. |
| Large room | 201-320 sq ft | 600-850 sq ft | $750-$1,100 | Large living rooms, primary bedrooms, open areas. |
| Oversized/open area | 321+ sq ft | 850+ sq ft | Manual or package quote | Open-concept areas may require custom measurements. |

Target prices assume standard wall repaint, standard ceiling height, normal prep, two coats on walls, and no major repairs or restoration conditions.

## Square-Foot Assumptions
Default estimating assumptions:
- Standard ceiling height: 8-9 ft.
- Standard wall paintable area: room perimeter multiplied by wall height, less normal openings.
- Default wall area estimate when dimensions are incomplete: floor area multiplied by 2.8 to 3.2.
- High ceilings, stairwells, vaulted ceilings, and open-concept transitions require adjustment or manual review.
- Closets, hallways, bathrooms, and laundry areas should use separate package logic when material enough to affect labor.

## Labor Assumptions
Standard room pricing assumes:
- Basic protection of floors and fixed surfaces.
- Minor nail-hole patching.
- Light sanding of patched areas.
- Standard roller/brush application.
- Two wall coats using a production-friendly color.
- Normal cleanup and completion photos.

Standard room pricing does not assume:
- Major drywall repair.
- Skim coating.
- Wallpaper removal.
- Popcorn ceiling removal.
- Smoke remediation.
- Water-damage restoration.
- Extensive caulking.
- Lead-paint procedures.
- Moving heavy furniture or packed contents.
- Specialty finishes.

## Material Assumptions
Standard pricing should include a controlled material allowance for:
- Standard interior wall paint.
- Standard patching compound for minor nail holes and small dings.
- Tape, plastic, masking, roller covers, and sundries.

Material assumptions:
- One gallon typically covers 300-400 sq ft per coat depending on surface and color change.
- Two coats are assumed for standard repaint packages.
- Primer is not included unless specified by tier, add-on, or exception approval.
- Premium paint, specialty colors, deep-base colors, stain-blocking primer, odor-blocking primer, and high-adhesion primer are add-ons or exception items.

## Condition Tiers
Classify every room into one of four operational tiers.

| Tier | Name | Description | Pricing Impact |
| --- | --- | --- | --- |
| Tier 1 | Rent-ready refresh | Clean walls, minor scuffs, nail holes only, no stains, no peeling, easy access. | Base package. |
| Tier 2 | Standard turnover | Moderate scuffs, several nail holes, small dings, light prep, normal rental wear. | Add 15%-25%. |
| Tier 3 | Heavy turnover | Heavy scuffs, many holes, visible patches, minor stains, rough trim lines, more masking. | Add 30%-60% or use heavy-prep package. |
| Tier 4 | Exception/restoration | Water damage, smoke, peeling paint, major drywall damage, texture work, odor, contamination, or uncertain substrate. | Manual review/change order. |

## Wall Repair Pricing
Use wall repair pricing only when repairs exceed minor nail-hole patching included in standard packages.

| Repair Type | Customer Price Guideline | Vendor Logic | Notes |
| --- | ---: | --- | --- |
| Minor nail holes | Included | Included in package buy rate | Normal rental wear only. |
| Small dings/chips | $10-$25 each or included in Tier 2 | Add-on if numerous | Must be photo-visible or scope-confirmed. |
| Small holes under 2 in | $35-$75 each | Preset add-on | Includes patch, sand, spot prime where needed. |
| Medium holes 2-6 in | $75-$150 each | Preset add-on or manual | Requires photo and count. |
| Large holes over 6 in | Manual review | Custom buy rate | May require drywall patch, texture, drying time. |
| Texture matching | Manual review | Custom buy rate | Escalate due to callback risk. |
| Skim coat areas | Manual review | Custom buy rate | Not standard room pricing. |

Repair counts must be captured before quote approval when visible. Unknown repair quantities create margin risk and should trigger a photo request or scope review.

## Ceiling Pricing
Ceilings should be priced separately unless included in a defined turnover package.

| Ceiling Scope | Target Customer Price | Notes |
| --- | ---: | --- |
| Small room ceiling | $150-$250 | Standard flat ceiling, no stains. |
| Standard room ceiling | $200-$350 | Normal 8-9 ft height. |
| Large room ceiling | $350-$600 | May need manual review based on access. |
| Stain-blocking primer | $75-$200+ | Required for water stains, smoke, or bleed-through risk. |
| Popcorn ceiling | Manual review | Removal, repair, or repaint is not standard. |
| Vaulted/high ceiling | Manual review | Access and safety impact vendor payout. |

Ceiling stains, peeling, cracks, or water damage require photo review before pricing.

## Trim Pricing
Trim is a separate scope unless the package explicitly includes it.

| Trim Scope | Target Customer Price | Notes |
| --- | ---: | --- |
| Baseboards only, small room | $125-$200 | Light prep, standard enamel/trim paint. |
| Baseboards only, standard room | $175-$300 | Add for heavy scuffs or caulking. |
| Baseboards only, large room | $250-$450 | Depends on linear footage. |
| Door and casing, per side | $75-$150 | More for paneled/damaged doors. |
| Window casing, each | $50-$125 | Depends on detail and condition. |
| Heavy trim prep | Manual review | Peeling, adhesion issues, oil-based conversion, or extensive caulking. |

Trim pricing must account for masking, drying time, enamel handling, surface condition, and callback risk.

## Upsells and Add-Ons
Standard upsells:
- Ceiling repaint.
- Trim repaint.
- Door repaint.
- Closet interiors.
- Accent wall.
- Stain-blocking primer.
- Odor-blocking primer.
- Small drywall repairs.
- Color change from dark to light.
- Same-day or rush scheduling.
- Recurring PM turnover bundle.
- Before/after photo documentation package for remote owners or PMs.

Upsells should be offered when they improve customer outcome, reduce vacancy time, or protect the finished appearance. Avoid upsells that introduce operational complexity without margin.

## Exclusions
Standard room pricing excludes:
- Lead paint or hazardous material procedures.
- Mold remediation.
- Active leaks or unresolved moisture.
- Smoke remediation beyond approved stain/odor-blocking primer.
- Wallpaper removal.
- Popcorn removal.
- Cabinet painting.
- Epoxy floors.
- Exterior work.
- Major drywall replacement.
- Moving heavy furniture, appliances, or packed belongings.
- Cleaning, junk removal, or unit trash-out unless separately scoped.
- Work requiring permits, licensed trades, or remediation specialists.

## Vendor Buy-Rate Logic
Vendor payouts should use package buy rates by size band, condition tier, and approved add-ons. Do not default to hourly payouts.

Recommended buy-rate structure:
- Base room buy rate by size band.
- Tier multiplier for prep difficulty.
- Add-on buy rates for ceiling, trim, doors, and repairs.
- Exception buy rates for approved custom work.
- Completion-photo requirement before payout approval.
- Callback tracking tied to vendor scorecard.

## Margin Guardrails
Quote should be escalated or adjusted when:
- Estimated gross margin falls below target after materials and vendor payout.
- Photos show Tier 4 conditions.
- Dimensions are uncertain and the room appears oversized.
- Customer requests rush work with uncertain scope.
- Unit is occupied or access appears constrained.
- Vendor availability requires premium payout.
- Required photos are missing for damage, ceilings, trim, stains, or peeling paint.

## Decision Rule
If the room fits a standard size band, standard condition tier, and standard scope, quote it quickly. If it creates uncertainty, classify the uncertainty, request the missing photo or dimension, and escalate only the exception instead of slowing the entire quote.
