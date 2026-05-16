# Room Pricing Rules

Ready White pricing must be package-based first and exception-based second. This protects speed-to-lead, margin consistency, and vendor scalability.

## Pricing order of operations

1. Identify customer vertical and property type.
2. Confirm occupancy status and desired timeline.
3. Collect required photos.
4. Assign condition tier and repair tier.
5. Select a vendor package buy rate.
6. Apply standard room/size band pricing.
7. Add deterministic add-ons.
8. Escalate only true exception work.
9. Track estimate variance after completion.

## Condition tiers

| Tier | Description | Pricing impact |
| --- | --- | --- |
| `A` | Clean walls, minimal scuffs, no repairs, normal color reset. | Standard package. |
| `B` | Typical turnover scuffs, nail holes, light patching, normal prep. | Standard package plus minor prep allowance. |
| `C` | Heavy scuffs, multiple patches, stained walls, trim/ceiling concerns. | Heavy-turn package or add-ons. |
| `D` | Water damage, smoke damage, peeling paint, major holes, severe prep. | Exception review before quote. |

## Repair tiers

| Tier | Allowed use |
| --- | --- |
| `none` | Paint-only or touch-up scope. |
| `minor` | Small patches, nail holes, standard turnover prep. |
| `moderate` | Multiple wall repairs or trim/ceiling prep requiring add-ons. |
| `severe` | Major repairs that must be priced as exception work. |
| `exception` | Water damage, smoke/stain blocking, peeling paint, access risk, or custom repairs. |

## Package logic

| Package | Best for | Operational rule |
| --- | --- | --- |
| `basic_turn` | Tier A, vacant, small unit, paint-only refresh. | Fastest quote path. |
| `standard_turn` | Tier A/B common turnover work. | Default Ready White package. |
| `heavy_turn` | Tier C with visible prep but no severe exception flag. | Requires photo proof before vendor assignment. |
| `exception_review` | Tier D or repair tier severe/exception. | Founder/operator approval required before quote. |

## Standard add-ons

Use deterministic add-ons instead of hourly labor whenever possible:

- ceiling repaint
- trim refresh
- door repaint
- accent wall reset
- smoke/stain blocking
- water-damage prep
- heavy patching
- after-hours access
- rush timeline

## Margin rule

Default target margin is 42%. Any quote below target margin must document the reason, such as strategic property-manager acquisition, guaranteed recurring volume, or approved exception recovery.

## Estimate variance loop

Capture these fields on every completed job:

- estimated labor hours
- actual labor hours
- estimated materials cost
- actual materials cost
- vendor team
- property type
- condition tier
- repair tier
- callback status

Variance data is the future pricing intelligence engine. It improves scope accuracy, vendor scoring, margin forecasting, and AI estimation quality.


## Current pricing configuration

The executable pricing source is `config/pricing-rules.json`. Update that file when Ready White changes package economics, paint/material costs, damage-tier labor assumptions, size bands, minimum price, confidence threshold, or target margin.

## Photo-estimate pricing formula

1. Normalize AI/manual square footage.
2. Normalize selected paint option.
3. Normalize AI damage tier into `basic`, `standard`, or `heavy`.
4. Calculate labor/prep from damage-tier rate and prep add-on.
5. Calculate materials from paint option base cost and rate per square foot.
6. Add size-band mobilization cost.
7. Convert vendor buy rate into customer price using target margin.
8. Apply minimum customer price.
9. Flag manual review for low confidence or exceptions.

AI may classify the scope, but deterministic code calculates the customer estimate.
