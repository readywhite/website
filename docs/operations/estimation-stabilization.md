# 60-Day Estimation Stabilization Plan

Ready White is now an operational infrastructure company, but the immediate mission is not more surface area. The next 60 days must stabilize the one-wall estimate pipeline with real usage, human calibration, and confidence-threshold discipline.

## Stabilization rule

Firm automated quotes are disabled during calibration. AI-assisted estimates may produce preliminary pricing, but every quote requires operator approval while `config/stabilization-plan.json` and `config/pricing-rules.json` keep `requireOperatorApprovalForAllAiEstimates` enabled.

## Real customer usage targets

Collect real wall photos from:

- apartments,
- student housing,
- turnovers,
- investors,
- multifamily units,
- different lighting conditions,
- different phone cameras,
- occupied and vacant units.

Minimum calibration targets before relaxing quote automation:

| Target | Minimum |
| --- | ---: |
| Real wall photos | 250 |
| Completed jobs | 40 |
| Corrected wall coverage | 90% |
| Vendor proof compliance | 95% |
| Confidence threshold for future automation | 0.85 |

## Human calibration loop

For every reviewed estimate, preserve:

| AI value | Human/vendor actual |
| --- | --- |
| estimated sqft | actual sqft |
| estimated damage | actual damage |
| estimated complexity | actual labor difficulty |
| predicted labor | actual labor |
| expected prep | actual prep |
| expected proof quality | actual proof/QA result |

Every correction must include `operator_id`, `variance_reason`, timestamp, and wall ID. This is the future calibration intelligence engine.

## Confidence threshold discipline

Manual review is mandatory for:

- low confidence,
- paper not detected,
- bad lighting,
- multiple walls visible,
- unclear wall edges,
- high complexity,
- large scopes,
- severe damage,
- luxury properties,
- premium customers,
- water/smoke/stain-blocking exceptions.

Knowing when **not** to automate protects margins and recurring property-manager trust.

## ROI / operational impact / scalability / risk reduction

- **ROI impact:** prevents underpriced jobs while calibration data accumulates.
- **Operational impact:** operators focus on high-variance estimates instead of trusting unproven automation.
- **Scalability impact:** future automation is based on measured wall-level data, not assumptions.
- **Risk reduction:** large, luxury, low-confidence, and exception jobs cannot silently become firm automated quotes.
