# Photo Estimate Flow SOP

## Operating rule: one wall = one estimate unit

Automated photo pricing is constrained to one wall per uploaded image. Every uploaded image must include one standard 8.5 x 11 inch sheet of paper taped flat in portrait orientation on the same wall. The paper is the primary scale anchor. A room-level or apartment-level image set is not eligible for automated firm pricing.

Customer capture steps:

1. Tape one 8.5 x 11 inch sheet of paper flat on the wall in portrait orientation.
2. Take one straight-on photo of the full wall with floor and ceiling visible when possible.
3. Repeat for each wall: `wall_1`, `wall_2`, `wall_3`.
4. Upload each wall photo individually in the same intake.

## Manual-review triggers

| Trigger | Reason |
| --- | --- |
| `paper_not_detected` | no same-wall scale anchor |
| `multiple_walls_visible` | ambiguous geometry |
| `wall_edges_unclear` | dimensions unreliable |
| `wall_partially_obstructed` | incomplete estimate |
| `severe_perspective_angle` | distorted scaling |
| `poor_lighting` | damage unreliable |
| `glare_reflection` | surface ambiguity |
| confidence below 0.75 | low reliability |
| total sqft above 1,200 | high-dollar/large-scope review |
| high complexity score >= 0.75 | labor complexity review |
| heavy damage or exception prep | margin protection |

## AI role vs rules engine role

AI extracts physical attributes only: wall dimensions, paper-reference detection, wall type, damage tier, complexity score, quality flags, and confidence. The deterministic repository pricing engine sets customer price, vendor buy rate, gross margin, market multipliers, and package routing.

## ROI / operational impact / scalability / risk reduction

- **ROI impact:** faster photo-based lead response without exposing margin logic to AI.
- **Operational impact:** operators review wall-level exceptions instead of ambiguous room photos.
- **Scalability impact:** every market receives the same intake geometry and pricing inputs.
- **Risk reduction:** low-confidence, complex, high-dollar, or exception jobs fall into manual review before a firm quote.

## Mobile guided capture guidance

The current form now tells mobile users to keep one wall only in frame, include the full paper reference, avoid glare, and retake dark photos. Future guided capture should add overlays for wall boundary alignment, paper detection, lighting warnings, and one-wall-only enforcement.

## Calibration-phase automation hold

During the 60-day stabilization phase, AI estimates remain preliminary and must be operator-approved before becoming firm quotes. The system applies `calibration_phase_operator_review` while real wall photos, correction coverage, vendor proof compliance, and variance data mature.

## Production hardening requirements added before merge

- The photo-estimate endpoint must parse Responses API output from `output[].content[].type === "output_text"`; SDK-only `output_text` fields are not a source of truth for raw REST responses.
- Rate limiting must run before multipart buffering so repeated large image uploads are rejected before Multer stores image buffers.
- Unsafe upload failures are hard validation errors, not manual-review fallbacks. Spoofed MIME types, unverifiable dimensions, oversized images, and animated GIFs return 4xx responses.
- Uploaded estimate photos must be durably persisted before lead submission. Railway Postgres can act as the initial database blob store via `operational_photo_uploads`; future S3/R2 storage can replace it behind the same `photoUrl` contract.
- `/api/photo-estimate` returns `estimateId`, `photoUrls`, `signedEstimatePayload`, and `estimateSignature`. `/api/ghl-lead` must trust only verified signed estimate pricing when creating opportunity values.
- Manual square footage without photos is always operator-review only and carries missing-photo requirements until the required wide-room, worst-wall, ceiling/trim/damage photos are received.
- Heavy damage is deterministically escalated with `heavy_damage_operator_review`; the model may identify damage, but it cannot decide to bypass operator review for heavy scope.
