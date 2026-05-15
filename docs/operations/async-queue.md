# Async Operational Queueing

The request/response photo estimate path is acceptable for early intake, but national scale should move long-running operational work into queues.

## Target flow

```text
Upload
→ queue photo_estimation
→ image validation
→ AI estimation
→ normalization
→ deterministic pricing
→ review routing
→ CRM sync
→ vendor routing
→ proof review
→ variance recording
```

## Queue foundations

`operational_queue_jobs` in `db/schema.sql` and `lib/queue.js` define the initial queue contract. Future Railway workers or BullMQ workers should use the same queue names:

- `photo_estimation`,
- `crm_sync`,
- `vendor_dispatch`,
- `proof_review`,
- `control_snapshot`.

## Dead-letter rule

A job that exceeds `max_attempts` should move to `dead_letter`, append an immutable event, and alert operations. It should not silently disappear.

## ROI / operational impact / scalability / risk reduction

- **ROI impact:** retries recover leads that would otherwise fail during OpenAI/GHL/network issues.
- **Operational impact:** operators can see stuck jobs instead of guessing where a workflow failed.
- **Scalability impact:** workers smooth load as photo volume grows across markets.
- **Risk reduction:** dead-letter handling prevents silent workflow loss.
