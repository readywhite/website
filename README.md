# Ready White Website + Photo Estimate Flow

Ready White is an AI-native property-turnover operating platform. This repo supports the early production stack:

- **Squarespace / website layer:** customer-facing quote intake and wall-photo upload experience.
- **Railway orchestration layer:** secure Node/Express API routes for photo analysis, deterministic pricing, and GoHighLevel handoff.
- **GoHighLevel CRM layer:** contact creation, opportunity tracking, SMS/email automation, and pipeline management.
- **Vendor Ops layer:** standardized subcontractor fulfillment using package buy rates, photo proof, scorecards, and exception escalation.

> Never commit real API keys. OpenAI and GoHighLevel credentials must stay server-side in Railway environment variables.

## Production lead flow

1. Customer opens the quote form and enters contact/property details.
2. Customer uploads wall photos and chooses a paint option.
3. Browser posts photos to `POST /api/photo-estimate` as `multipart/form-data`.
4. Railway sends the images to OpenAI vision analysis using base64 image data URLs.
5. The API normalizes the AI output into:
   - wall dimension estimates,
   - total wall square footage,
   - confidence scores,
   - damage tier (`basic`, `standard`, `heavy`),
   - exception/manual-review flags.
6. The API calculates deterministic package pricing from `config/pricing-rules.json`.
7. Browser sends the lead, estimate, tags, and canonical job object to `POST /api/ghl-lead`.
8. GoHighLevel receives the contact/opportunity in the `Ready White Customer Jobs` pipeline.

## Photo policy

Require quote photos that reduce scope drift and protect margins:

- 1 wide photo of each room.
- 1 photo of the worst wall in each room.
- photos of ceilings, trim, stains, peeling paint, water damage, smoke damage, holes, and heavy prep areas.

The estimator marks `manualReviewRequired: true` when photos are missing, measurements have low confidence, or exception damage is visible.

## Damage tiers

| Tier | Use |
| --- | --- |
| `basic` | Minimal nail holes, light scuffs, small blemishes. |
| `standard` | Moderate patching, multiple holes, visible surface wear. |
| `heavy` | Significant damage, large repairs, texture issues, major prep work. |

Water damage, smoke/stain blocking, peeling paint, severe holes, texture repair, ceiling damage, trim damage, or low-confidence measurement should route to operator review before a firm quote.

## Pricing logic

Pricing is deterministic. OpenAI analyzes photos; the backend calculates pricing from repository configuration.

Primary config: `config/pricing-rules.json`

Pricing factors:

- AI/manual square footage.
- Customer-selected paint option.
- AI damage tier.
- size band mobilization cost.
- damage-tier labor/prep rules.
- paint material rates.
- target gross margin.
- minimum customer price.
- exception/manual-review flags.

The current target margin is `42%`. Any exception or low-confidence result stays in scope review until an operator confirms the package and margin.

## API: `POST /api/photo-estimate`

Content type: `multipart/form-data`

### Request fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `photos` | file[] | Preferred | JPEG, PNG, WEBP, or GIF. Max 12 files, 8 MB each. |
| `paintOption` | string | Yes | `ready_white_standard`, `warm_neutral`, or `premium_scrubbable`. |
| `manualSquareFeet` | number | Optional | Used as a fallback/hint when already measured. |
| `damageTier` | string | Optional | Optional operator/customer hint: `basic`, `standard`, `heavy`. |
| `propertyType` | string | Optional | Helps context but does not override pricing rules. |
| `notes` | string | Optional | Customer notes and known measurements. |

### Example request

```bash
curl -X POST http://localhost:3000/api/photo-estimate \
  -F "photos=@./sample-wall.jpg" \
  -F "paintOption=ready_white_standard" \
  -F "manualSquareFeet=420" \
  -F "notes=Vacant rental turnover, worst wall has nail holes"
```

### Example response

```json
{
  "ok": true,
  "photoPolicyStatus": "partial",
  "analysis": {
    "totalWallSquareFeet": 420,
    "damageTier": "standard",
    "measurementConfidence": 0.66,
    "damageConfidence": 0.82,
    "confidence": 0.66,
    "manualReviewRequired": true,
    "exceptionFlags": ["low_measurement_confidence"],
    "missingPhotoRequirements": [],
    "notes": ["No clear measurement reference visible."]
  },
  "pricing": {
    "pricingVersion": "2026-05-15",
    "squareFeet": 420,
    "paintOption": "ready_white_standard",
    "paintLabel": "Ready White Standard White",
    "damageTier": "standard",
    "conditionTier": "B",
    "repairTier": "moderate",
    "vendorPackage": "standard_turn",
    "priceToCustomerCents": 188000,
    "manualReviewRequired": true,
    "exceptionFlags": ["low_measurement_confidence"]
  },
  "quote": {
    "priceToCustomerCents": 188000,
    "manualReviewRequired": true,
    "customerMessage": "We received the photos and generated a preliminary estimate, but an operator must review the scope before this becomes a firm quote."
  }
}
```

## API: `POST /api/ghl-lead`

Content type: `application/json`

This endpoint validates the required contact fields and canonical job object before sending the lead to GoHighLevel.

### Example payload

```json
{
  "name": "Alex Manager",
  "email": "alex@example.com",
  "phone": "+15555550100",
  "propertyAddress": "123 Main St",
  "propertyType": "Rental turnover",
  "paintOption": "ready_white_standard",
  "tags": ["source:squarespace", "vertical:property-management", "lead:new", "damage:standard"],
  "pipelineName": "Ready White Customer Jobs",
  "pipelineStage": "New Lead",
  "canonicalJob": {
    "lead_source": "source:squarespace",
    "pipeline_name": "Ready White Customer Jobs",
    "pipeline_stage": "New Lead",
    "job_type": "make_ready_refresh",
    "property_type": "multifamily",
    "customer_vertical": "property-management",
    "occupancy_status": "vacant",
    "room_count": 3,
    "sqft": 420,
    "condition_tier": "B",
    "repair_tier": "moderate",
    "timeline": "48_hours",
    "vendor_package": "standard_turn",
    "target_margin": 0.42,
    "photo_policy_status": "exception_review",
    "exception_flags": ["low_measurement_confidence"]
  },
  "estimate": {
    "analysis": { "totalWallSquareFeet": 420, "damageTier": "standard" },
    "pricing": { "priceToCustomerCents": 188000, "damageTier": "standard" },
    "quote": { "manualReviewRequired": true }
  }
}
```

## Environment variables

Copy `.env.example` locally or add these values in Railway:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Required for AI estimates | Server-side key for OpenAI vision analysis. |
| `OPENAI_VISION_MODEL` | Optional | Defaults to `gpt-4.1-mini`. |
| `GHL_PRIVATE_INTEGRATION_TOKEN` | Required for live GHL | Private Integration Token. |
| `GHL_LOCATION_ID` | Required for live GHL | HighLevel location ID. |
| `GHL_PIPELINE_ID` | Optional | Required if creating opportunities. |
| `GHL_PIPELINE_STAGE_ID` | Optional | Required if creating opportunities. |

If `OPENAI_API_KEY` is missing, `/api/photo-estimate` returns a manual-review fallback instead of failing the customer intake.

## Local setup

```bash
npm install
npm start
```

Open <http://localhost:3000>.

Localhost lead submission logs the GHL payload in the browser console rather than posting to GoHighLevel. Photo estimates still call the local `/api/photo-estimate` route, which can either use `OPENAI_API_KEY` or return manual review fallback.

## Operational checks

Run code and operations checks before deployment:

```bash
npm run check
npm run ops:check
```

Daily operational system checks must be documented for 00:00, 12:00, and 18:00 Eastern Time, but this repo intentionally does **not** activate a scheduler. See `docs/operations/system-checks.md` for the Railway/GitHub/cron setup options to activate later.

## Production limitations and calibration notes

- Single-photo wall measurement is approximate unless the image contains reliable references or the customer provides known dimensions.
- Low measurement confidence always triggers manual review.
- AI does not invent pricing. Repository pricing config remains the source of truth.
- Railway ephemeral storage is not treated as durable image storage; photos are processed in memory and passed to OpenAI for analysis.
- Before relying on fully automatic quotes, calibrate `config/pricing-rules.json` against completed-job variance data and vendor scorecards.
- Severe prep, water damage, smoke/stain blocking, custom repairs, and approved scope exceptions must stay outside flat hourly quoting and route through exception review.

## Deployment checklist

1. Add Railway variables for OpenAI and GoHighLevel.
2. Confirm `/health` returns `{ "ok": true }`.
3. Submit a test estimate with at least two photos.
4. Confirm the GHL contact gets `source:squarespace`, `lead:new`, vertical, and damage/manual-review tags.
5. Confirm the opportunity enters `Ready White Customer Jobs` at `New Lead`.
6. Run `npm run check` and `npm run ops:check` before merging workflow changes.
