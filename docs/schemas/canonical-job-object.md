# Canonical Job Object

The canonical job object is the standardized representation of every Ready White job. It must be used before adding AI estimation, dispatch automation, KPI reporting, or vendor scorecards.

## Purpose

A consistent job object makes pricing, dispatch, reporting, follow-up, vendor assignment, and future AI optimization deterministic. Every intake source should normalize into this structure before operational decisions are made.

## Required object

```json
{
  "job_id": "rw_job_20260515_001",
  "lead_source": "source:squarespace",
  "pipeline_name": "Ready White Customer Jobs",
  "pipeline_stage": "New Lead",
  "job_type": "occupancy_repaint",
  "property_type": "multifamily",
  "customer_vertical": "property-management",
  "occupancy_status": "vacant",
  "room_count": 3,
  "sqft": 950,
  "condition_tier": "B",
  "repair_tier": "minor",
  "timeline": "48_hours",
  "vendor_package": "standard_turn",
  "target_margin": 0.42,
  "photo_policy_status": "requested",
  "exception_flags": [],
  "estimate": {
    "labor_hours_estimated": 6,
    "materials_estimated_cents": 8000,
    "price_to_customer_cents": 145000,
    "vendor_buy_rate_cents": 84100
  },
  "actuals": {
    "labor_hours_actual": null,
    "materials_actual_cents": null,
    "callback_required": false
  }
}
```

## Field standards

| Field | Required | Standard values / notes |
| --- | --- | --- |
| `job_id` | Yes | Deterministic internal identifier. |
| `lead_source` | Yes | Use `source:squarespace` for website leads. |
| `pipeline_name` | Yes | Must be `Ready White Customer Jobs`. |
| `pipeline_stage` | Yes | Must match one approved GHL stage. |
| `job_type` | Yes | Start with `occupancy_repaint`, `touch_up`, `make_ready_refresh`, `exception_repair`. |
| `property_type` | Yes | `single_family`, `condo_townhouse`, `multifamily`, `commercial`, `student_housing`. |
| `customer_vertical` | Yes | `property-management`, `investor`, `agent`, `owner`, `commercial`. |
| `occupancy_status` | Yes | `vacant`, `occupied`, `unknown`. Vacant jobs should receive fastest dispatch priority. |
| `room_count` | Yes | Integer count used for package pricing. |
| `sqft` | Preferred | Integer square footage when available. |
| `condition_tier` | Yes | `A`, `B`, `C`, `D`; see estimate rules. |
| `repair_tier` | Yes | `none`, `minor`, `moderate`, `severe`, `exception`. |
| `timeline` | Yes | `same_day`, `24_hours`, `48_hours`, `standard`, `flexible`. |
| `vendor_package` | Yes | `basic_turn`, `standard_turn`, `heavy_turn`, `exception_review`. |
| `target_margin` | Yes | Default target is `0.42` unless overridden by approved package economics. |
| `photo_policy_status` | Yes | `requested`, `partial`, `complete`, `exception_review`. |
| `exception_flags` | Yes | Array of scope risks such as `water_damage`, `smoke_damage`, `heavy_prep`, `access_issue`. |

## Operational rule

No job should move from `Scope Review` to `Quote Sent` until the job object has enough data for deterministic pricing or has been marked as an approved exception.


## Photo estimate payload extension

Website leads may include an `estimate` object alongside the canonical job object:

```json
{
  "estimate": {
    "photos": [{ "id": "photo_1", "fileName": "living-room.jpg", "mimeType": "image/jpeg", "bytes": 384000 }],
    "analysis": {
      "totalWallSquareFeet": 420,
      "damageTier": "standard",
      "measurementConfidence": 0.66,
      "damageConfidence": 0.82,
      "manualReviewRequired": true,
      "exceptionFlags": ["low_measurement_confidence"]
    },
    "pricing": {
      "pricingVersion": "2026-05-15",
      "priceToCustomerCents": 188000,
      "vendorBuyRateCents": 109040,
      "targetMargin": 0.42,
      "manualReviewRequired": true
    }
  }
}
```

When `estimate.pricing.manualReviewRequired` is true, `canonicalJob.photo_policy_status` should be `exception_review` and the job must not proceed to firm quote without operator approval.
