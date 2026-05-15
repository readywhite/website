# Ready White Website + Operational Estimate Flow

Ready White is an AI-native property-turnover operating platform. The repo supports the early production stack:

- **Squarespace / website layer:** customer-facing quote intake and wall-photo upload experience.
- **Railway orchestration layer:** secure Node/Express API routes for photo analysis, deterministic pricing, vendor routing helpers, and GoHighLevel handoff.
- **GoHighLevel CRM layer:** contact creation, opportunity tracking, SMS/email automation, and pipeline management.
- **Vendor Ops layer:** standardized subcontractor fulfillment using package buy rates, proof-of-work, scorecards, and exception escalation.

> Never commit real API keys. OpenAI and GoHighLevel credentials must stay server-side in Railway environment variables.

## Production lead flow

1. Customer enters contact, property, market, timeline, paint, occupancy, and notes.
2. Customer tapes one standard 8.5 x 11 inch sheet of paper flat in portrait orientation on each wall.
3. Customer uploads **one straight-on photo per wall**.
4. Browser posts photos to `POST /api/photo-estimate` as `multipart/form-data`.
5. Railway validates upload type, size, dimensions, rate limits, and content sniffing before OpenAI.
6. OpenAI vision estimates physical wall attributes only: wall dimensions, same-wall paper detection, damage tier, wall type, complexity, confidence, and review flags.
7. The API strictly normalizes the AI response as untrusted input.
8. `lib/pricing.js` calculates deterministic package pricing from versioned rules in `config/pricing-rules.json` using cents and basis points.
9. Browser sends the lead, estimate, tags, and canonical job object to `POST /api/ghl-lead`.
10. GoHighLevel receives the contact/opportunity in the `Ready White Customer Jobs` pipeline at `New Lead`.

## Operating principle: one wall = one estimate unit

Automated pricing is wall-based, not room-based.

```json
{
  "walls": [
    {
      "wallId": "wall_1",
      "photoId": "photo_1",
      "referenceSheetDetected": true,
      "estimatedWidthFeet": 12,
      "estimatedHeightFeet": 8,
      "estimatedSquareFeet": 96,
      "damageTier": "standard",
      "wallType": "standard_flat",
      "complexityScore": 0.34,
      "confidence": 0.88,
      "manualReviewRequired": false
    }
  ]
}
```

Worst wall damage tier drives aggregate pricing because one heavy wall changes prep time, scheduling risk, and vendor package selection.

## API: `POST /api/photo-estimate`

Content type: `multipart/form-data`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `photos` | file[] | Preferred | JPEG, PNG, WEBP, or GIF. Max 12 files, 8 MB each, total 48 MB. One photo per wall. |
| `paintOption` | string | Yes | `ready_white_standard`, `warm_neutral`, or `premium_scrubbable`. |
| `market` | string | Yes | `default`, `dallas`, `houston`, `atlanta`, `phoenix`, or `san_francisco`. |
| `manualSquareFeet` | number | Optional | Used as manual-review fallback/hint when already measured. |
| `damageTier` | string | Optional | Optional hint: `basic`, `standard`, `heavy`. Rules still normalize. |
| `propertyType` | string | Optional | Context only. Does not override pricing rules. |
| `notes` | string | Optional | Customer notes and known measurements. |

### Example request

```bash
curl -X POST http://localhost:3000/api/photo-estimate \
  -F "photos=@./wall-1.jpg" \
  -F "photos=@./wall-2.jpg" \
  -F "paintOption=ready_white_standard" \
  -F "market=dallas" \
  -F "notes=Vacant rental turnover; paper sheet taped on each wall"
```

### Example response

```json
{
  "ok": true,
  "photoPolicyStatus": "exception_review",
  "analysis": {
    "estimateUnit": "one_wall_one_estimate_unit",
    "totalWallSquareFeet": 206,
    "damageTier": "standard",
    "confidence": 0.74,
    "manualReviewRequired": true,
    "exceptionFlags": ["low_measurement_confidence"],
    "walls": [
      {
        "wallId": "wall_1",
        "photoId": "photo_1",
        "referenceSheetDetected": true,
        "estimatedSquareFeet": 96,
        "damageTier": "basic",
        "wallType": "standard_flat",
        "complexityScore": 0.22,
        "confidence": 0.86,
        "manualReviewRequired": false,
        "exceptionFlags": []
      },
      {
        "wallId": "wall_2",
        "photoId": "photo_2",
        "referenceSheetDetected": false,
        "estimatedSquareFeet": 110,
        "damageTier": "standard",
        "wallType": "trim_heavy",
        "complexityScore": 0.67,
        "confidence": 0.64,
        "manualReviewRequired": true,
        "exceptionFlags": ["paper_not_detected", "low_measurement_confidence"]
      }
    ]
  },
  "pricing": {
    "pricingRulesVersion": "2026-05-15.wall-v2",
    "squareFeet": 206,
    "market": "dallas",
    "damageTier": "standard",
    "vendorBuyRateCents": 68200,
    "priceToCustomerCents": 117587,
    "grossMarginCents": 49387,
    "grossMarginBps": 4200,
    "targetMarginBps": 4200,
    "manualReviewRequired": true,
    "exceptionFlags": ["paper_not_detected", "low_measurement_confidence"]
  },
  "audit": {
    "promptVersion": "ready-white-wall-estimate-v2",
    "pricingRulesVersion": "2026-05-15.wall-v2",
    "aiResponseStored": false
  },
  "quote": {
    "priceToCustomerCents": 117587,
    "manualReviewRequired": true
  }
}
```

## Manual-review thresholds

| Condition | Manual review |
| --- | --- |
| confidence below 0.75 | yes |
| paper not detected on the same wall | yes |
| multiple walls visible | yes |
| wall edges unclear | yes |
| wall partially obstructed | yes |
| severe perspective angle | yes |
| poor lighting or glare/reflection | yes |
| high complexity score >= 0.75 | yes |
| total sqft > 1,200 | yes |
| AI parse failure, timeout, or missing `OPENAI_API_KEY` | yes |

## Pricing logic

- AI never invents prices, margins, labor, or vendor rates.
- Pricing rules are versioned in `config/pricing-rules.json`.
- Pricing uses integer cents and basis points: `priceToCustomerCents`, `vendorBuyRateCents`, `grossMarginCents`, `grossMarginBps`, `targetMarginBps`.
- Market differences are deterministic config values: labor/material/mobilization multipliers and target margin bps.
- Wall type can increase labor assumptions while still preserving package-based pricing.

## API: `POST /api/ghl-lead`

Content type: `application/json`

This endpoint validates required contact fields and the canonical job object before sending the lead to GoHighLevel.

### Example payload

```json
{
  "name": "Alex Manager",
  "email": "alex@example.com",
  "phone": "+15555550100",
  "propertyAddress": "123 Main St",
  "propertyType": "Rental turnover",
  "market": "dallas",
  "paintOption": "ready_white_standard",
  "tags": ["source:squarespace", "vertical:property-management", "lead:new", "estimate:ai-assisted", "market:dallas"],
  "pipelineName": "Ready White Customer Jobs",
  "pipelineStage": "New Lead",
  "canonicalJob": {
    "lead_source": "source:squarespace",
    "pipeline_name": "Ready White Customer Jobs",
    "pipeline_stage": "New Lead",
    "market": "dallas",
    "job_type": "make_ready_refresh",
    "property_type": "multifamily",
    "customer_vertical": "property-management",
    "occupancy_status": "vacant",
    "sqft": 206,
    "estimate_unit": "one_wall_one_estimate_unit",
    "walls": [
      {
        "wall_id": "wall_1",
        "photo_id": "photo_1",
        "sqft": 96,
        "damage_tier": "basic",
        "wall_type": "standard_flat",
        "complexity_score": 0.22,
        "confidence": 0.86
      }
    ],
    "photo_policy_status": "exception_review",
    "exception_flags": ["low_measurement_confidence"]
  }
}
```

## Vendor OS and proof-of-work

- `config/vendors.example.json` defines versioned vendor scorecard fields.
- `lib/dispatch.js` ranks vendors by market match, service match, score, on-time rate, callback rate, proof-photo compliance, variance, capacity, and response speed.
- `docs/operations/proof-of-work.md` defines before/after photos, timestamped checklist, wall IDs, and QA gates before `Completed`.
- `docs/operations/lifecycle-system.md` defines the full lifecycle from lead through KPI reporting.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Required for AI estimates | Server-side key for OpenAI vision analysis. |
| `OPENAI_VISION_MODEL` | Optional | Defaults to `gpt-4.1-mini`. |
| `GHL_PRIVATE_INTEGRATION_TOKEN` | Required for live GHL | Private Integration Token. |
| `GHL_LOCATION_ID` | Required for live GHL | HighLevel location ID. |
| `GHL_PIPELINE_ID` | Optional | Required if creating opportunities. |
| `GHL_PIPELINE_STAGE_ID` | Optional | Required if creating opportunities. |

If `OPENAI_API_KEY` is missing, `/api/photo-estimate` returns a manual-review fallback instead of failing customer intake.

## Local setup

```bash
npm install
npm start
```

Open <http://localhost:3000>.

## Operational checks

Run code and operations checks before deployment:

```bash
npm run check
npm run ops:check
```

Daily operational system checks must be documented for 00:00, 12:00, and 18:00 Eastern Time, but this repo intentionally does **not** activate a scheduler. See `docs/operations/system-checks.md` for Railway/GitHub/cron setup options to activate later.

## Production limitations and calibration notes

- Single-image wall measurement remains approximate and requires the same-wall paper reference.
- Low-confidence, high-complexity, high-dollar, or exception jobs always route to manual review.
- Railway ephemeral storage is not durable image storage; add Railway Postgres/object storage before storing artifacts at volume.
- Persist raw AI response, normalized estimate, prompt version, pricing version, operator corrections, and actual variance in durable storage before fully automated production rollout.
- Severe prep, water damage, smoke/stain blocking, custom repairs, and approved scope exceptions must route through exception review.

## Deployment checklist

1. Add Railway variables for OpenAI and GoHighLevel.
2. Confirm `/health` returns `{ "ok": true }`.
3. Submit a test estimate with one paper-referenced photo per wall.
4. Confirm the GHL contact gets `source:squarespace`, `lead:new`, vertical, market, confidence, damage, and manual-review tags.
5. Confirm the opportunity enters `Ready White Customer Jobs` at `New Lead`.
6. Run `npm run check` and `npm run ops:check` before merging workflow changes.
