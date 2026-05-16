# Operational Database and Event Store

GoHighLevel remains the CRM and automation layer, but Ready White needs a Railway Postgres source of truth for operational memory. This prevents wall estimates, corrections, QA outcomes, proof artifacts, and vendor variance from being trapped in screenshots, notes, or founder memory.

## Railway Postgres scope

Apply `db/schema.sql` to a Railway Postgres database when durable storage is ready. The schema creates:

- `jobs` for operational job state and pricing/version metadata,
- `walls` for wall-level estimates and corrections,
- `ai_artifacts` for prompts, model versions, raw outputs, normalized outputs, and pricing version,
- `wall_corrections` for operator calibration data,
- `operational_events` for immutable audit/replay history,
- `proof_of_work_artifacts` for before/after/vendor proof uploads,
- `qa_reviews` for operator QA outcomes,
- `operational_queue_jobs` for future async processing.

## Immutable event rule

Every important operational action should append an event instead of overwriting history. Examples:

```json
{
  "event_type": "wall_estimate_corrected",
  "aggregate_type": "wall",
  "aggregate_id": "job_123:wall_1",
  "job_id": "job_123",
  "wall_id": "wall_1",
  "actor_id": "operator_7",
  "payload": {
    "old_damage_tier": "standard",
    "new_damage_tier": "heavy"
  }
}
```

This powers auditability, debugging, replay, retraining, accountability, and variance intelligence.

## Human correction persistence

`POST /api/wall-corrections` validates operator corrections and stores them when `DATABASE_URL` is configured. In local/dev mode without `DATABASE_URL`, it validates the correction and returns a non-persisted warning so tests can run without infrastructure.

Required correction fields:

- `job_id`,
- `wall_id`,
- `operator_id`,
- `reason`,
- `original_values`,
- `corrected_values`.

## Security

Production admin endpoints require `ADMIN_API_TOKEN` using `Authorization: Bearer <token>`. Do not expose correction, event, or dashboard endpoints publicly without authentication.

## ROI / operational impact / scalability / risk reduction

- **ROI impact:** correction history improves pricing calibration and quote confidence.
- **Operational impact:** operators can correct AI estimates without losing the original values.
- **Scalability impact:** wall, vendor, proof, QA, and pricing history become market-independent data assets.
- **Risk reduction:** immutable events make disputes, callbacks, margin drift, and workflow regressions traceable.

## Replay and artifact commands

```bash
npm run events:replay -- events.json
npm run ai:eval
npm run calibration:report
```

Replay tooling validates event shapes and state transitions from exported events. AI evaluation and calibration reporting are intentionally deterministic so they can run before production artifact storage is fully connected.

## Actuals capture

`job_actuals` stores actual labor, material, completion, callback, QA, repaint, satisfaction, and variance fields. This table is required before predictive dispatch, dynamic pricing, or market optimization should be trusted.

Use `POST /api/job-actuals` for structured actual capture once jobs complete.

## Estimate photo persistence

`operational_photo_uploads` stores validated estimate images with `photo_id`, `wall_id`, MIME type, byte size, dimensions, SHA-256 digest, metadata, and `BYTEA` image bytes. This gives manual review operators visual evidence instead of browser-supplied filenames and preserves auditability while Ready White is still on the early Railway orchestration layer. Returned `photoUrl` values point to the protected `/api/photo-upload?id=...` retrieval endpoint and require ops/read-only RBAC.
