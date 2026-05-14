# Ready White Paint Material Cost Estimating Template

This template estimates paint material cost by square footage while preserving Ready White package discipline. It is for internal material planning and margin protection, not for replacing package-based customer quoting.

## Pricing source policy

- Use Sherwin-Williams product lines already aligned to Ready White turnover work.
- Sherwin-Williams pro product pages require sign-in to confirm current account pricing and availability, so `config/material-pricing.json` stores editable Ready White estimating allowances.
- Review account pricing with the Ready White Sherwin-Williams rep before production quote locks, during systems checks, or when product costs change.
- The default coverage uses 350 sq ft per gallon, the conservative low end of Sherwin-Williams published 350-400 sq ft per gallon coverage for ProMar 200 Zero VOC interior latex, to protect margin.

## Standard formula

```text
gross wall sq ft = 2 × (room length + room width) × wall height
net wall sq ft = gross wall sq ft - openings sq ft
ceiling sq ft = room length × room width, only when ceiling is included
paintable sq ft = net wall sq ft + ceiling sq ft
adjusted sq ft = paintable sq ft × coats × (1 + waste percentage)
raw gallons = adjusted sq ft ÷ coverage sq ft per gallon
required gallons = round raw gallons up to the next whole gallon
material cost = optimized 5-gallon pails + 1-gallon cans using configured Sherwin-Williams pricing
```

## CLI usage

Estimate a 12 ft × 10 ft room with 8 ft walls, 2 coats, and no ceiling:

```bash
npm run estimate:paint -- --length=12 --width=10 --height=8 --coats=2 --product=property_solution_interior_flat --format=markdown
```

Estimate by direct wall square footage when photos or takeoff already provide surface area:

```bash
npm run estimate:paint -- --wall-area=520 --openings=40 --coats=2 --product=promar_200_zero_voc_eg_shel
```

Include ceiling paint in the estimate:

```bash
npm run estimate:paint -- --length=12 --width=10 --height=8 --include-ceiling --coats=2
```

Override the price for the current Sherwin-Williams account quote without changing the config file:

```bash
npm run estimate:paint -- --length=12 --width=10 --height=8 --price-per-gallon=64.75 --five-gallon-price=305
```

## Output fields

- `paintableSqFt`: net wall area plus optional ceiling area.
- `adjustedSqFt`: paintable area multiplied by coats and waste factor.
- `rawGallons`: mathematical gallons before purchase rounding.
- `gallonsRequired`: whole gallons required for execution planning.
- `fiveGallonPails` and `oneGallonCans`: lowest-cost purchase mix from configured prices.
- `totalMaterialCost`: estimated Sherwin-Williams material cost before tax, sundries, and approved exception add-ons.

## Operational controls

- Keep package quoting standardized; do not turn this calculator into hourly/custom estimating logic.
- Use photo policy to verify walls, ceilings, trim, stains, peeling paint, water damage, smoke damage, holes, and heavy prep areas before locking material assumptions.
- Escalate stain blocking, severe prep, water damage, smoke damage, custom repairs, and other non-standard conditions into approved exception workflows.
- Feed recurring actual material usage back into KPI review to improve package buy rates and reduce vacancy turnover time.

## Source references

- Sherwin-Williams Builders Solution page: pro pricing requires account sign-in to confirm pricing and availability.
- Sherwin-Williams ProMar 200 Zero VOC product data: published coverage is 350-400 sq ft per gallon.
- Sherwin-Williams Property Solution Interior Latex Flat page: product line reference for turnover/property refresh estimating.
