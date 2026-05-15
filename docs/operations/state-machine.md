# Operational State Machine

Ready White should increasingly think in transitions, gates, and immutable progression rather than pages or one-off API calls.

## Canonical states

```text
NEW_LEAD
→ PHOTO_CAPTURED
→ AI_ANALYZED
→ REVIEW_REQUIRED
→ QUOTED
→ APPROVED
→ DISPATCHED
→ IN_PROGRESS
→ PROOF_SUBMITTED
→ QA_REVIEW
→ COMPLETE
→ VARIANCE_RECORDED
→ CLOSED_WON / CLOSED_LOST
```

`lib/state-machine.js` defines allowed transitions and maps states back to the approved GoHighLevel stages. Invalid transitions should fail closed and append no completion/progression event.

## Gate examples

- `AI_ANALYZED → QUOTED` only when confidence and exception flags pass deterministic rules.
- `APPROVED → DISPATCHED` only when vendor ranking and capacity are available.
- `IN_PROGRESS → PROOF_SUBMITTED` only when required proof artifacts exist.
- `QA_REVIEW → COMPLETE` only when proof review passes.
- `COMPLETE → VARIANCE_RECORDED` only when actual labor/material/callback fields are captured.

## ROI / operational impact / scalability / risk reduction

- **ROI impact:** fewer jobs leak revenue by skipping quote, follow-up, or proof gates.
- **Operational impact:** managers know exactly which gate is blocking a job.
- **Scalability impact:** markets follow the same lifecycle, reducing regional drift.
- **Risk reduction:** invalid progression is constrained before customer experience or margin is harmed.
