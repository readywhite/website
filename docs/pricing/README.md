# Pricing Documentation

This folder defines Ready White's standardized pricing system for fast-turn occupancy repainting. Pricing should support package-based quoting, protect margins, and reduce estimate cycle time.

## Pricing goals

- Quote quickly from standardized room and unit packages.
- Keep customer-facing pricing simple and repeatable.
- Keep vendor buy rates separate from customer sell prices.
- Preserve margin through size bands, add-ons, and exception escalation.
- Support recurring property-management relationships with consistent package logic.

## Standard pricing model

Use standardized room pricing and package bands rather than custom hourly pricing.

Recommended scaffold:

| Package area | Standard basis | Notes |
| --- | --- | --- |
| Room repaint | Room size band | Walls only unless add-ons apply. |
| Full unit repaint | Unit size / bedroom count | Designed for vacant turnover speed. |
| Ceiling add-on | Room or unit add-on | Triggered by photos or customer scope. |
| Trim add-on | Room or unit add-on | Baseboards, doors, frames, and casing as defined. |
| Heavy prep | Exception add-on | Requires photo proof and approval. |
| Stain blocking | Exception add-on | Water, smoke, tannin, or heavy discoloration. |
| Repairs | Exception add-on | Holes, failed patches, peeling paint, or custom repairs. |

## Margin controls

- Maintain separate customer sell prices and vendor buy rates.
- Do not expose vendor rates in customer-facing quotes.
- Use standard size bands to prevent one-off estimating drift.
- Require photo verification for exception add-ons.
- Escalate jobs with water damage, smoke damage, severe prep, heavy staining, or custom repairs before issuing a final quote.

## Future documents

- `room-price-bands.md`
- `unit-packages.md`
- `customer-sell-prices.md`
- `vendor-buy-rates.md`
- `add-ons.md`
- `exception-pricing.md`
