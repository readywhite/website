# Daily System Checks

Ready White should run operational system checks at **00:00, 12:00, and 18:00 Eastern Time daily**.

This repository documents the schedule and the check procedure, but it intentionally does **not** create or activate a real scheduler yet. Activate scheduling only when Railway/GitHub/GHL credentials and alert ownership are confirmed.

## Manual check command

Run these before deployment and during manual operating checks:

```bash
npm run check
npm run ops:check
curl https://YOUR-RAILWAY-DOMAIN/health
```

## Checks to perform at each daily checkpoint

1. Railway app health: `/health` returns `ok: true`.
2. Website intake loads and can reach `/api/photo-estimate`.
3. OpenAI photo estimate path returns either an estimate or a manual-review fallback.
4. GoHighLevel contact/opportunity creation has no failed webhook/API events.
5. `Ready White Customer Jobs` pipeline stages still match the object standards.
6. Stale `New Lead`, `Photos Requested`, and `Quote Sent` opportunities are queued for recovery.
7. Approved jobs without vendor assignment are escalated.
8. In-progress jobs missing photo proof are escalated.
9. Missed-call text-back workflow is active in GHL.
10. Review request workflow is active for completed jobs.

## Recommended future scheduling options

Do not activate until the operator confirms alert routing.

### Railway cron-style service

Create a small scheduled worker that runs at 00:00, 12:00, and 18:00 America/New_York and calls a future authenticated health/audit endpoint.

### GitHub Actions schedule

Use cron in UTC after accounting for Eastern daylight/standard time. Because UTC offsets shift seasonally, prefer an external scheduler with timezone support if exact Eastern wall-clock time is required.

### External monitor

Use a production monitor such as Better Stack, Cronitor, or UptimeRobot to call `/health` and alert the operator. Add authenticated checks for GHL/OpenAI only after secrets and alert ownership are configured.

## Alert thresholds

- Any `/health` failure: immediate operator alert.
- Any photo estimate hard failure: alert and route new submissions to manual review.
- Any GHL API failure: alert and preserve payload logs without exposing secrets.
- Any stale lead over SOP threshold: trigger recovery sequence.
- OpenAI timeout/quota spike or malformed-response spike: route estimates to manual review and notify operator.
- Manual-review rate above baseline: inspect wall photo quality, market mix, and prompt/schema drift.
- Vendor assignment backlog: run Vendor OS ranking and escalate markets with insufficient capacity.
- Proof-of-work backlog in `Photo Proof Review`: alert operations before moving jobs to `Completed`.
- Market margin variance above threshold: freeze automatic quoting for that market until pricing config is reviewed.
