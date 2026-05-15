# Operational System Checks

Run checks daily at 00:00, 12:00, and 18:00 Eastern Time.

## Checklist

1. Confirm Railway `/health` returns `ok`.
2. Confirm `/api/ghl-lead` is deployed and rejects non-POST requests safely.
3. Review GoHighLevel pipeline stages for naming drift.
4. Review new leads older than 15 minutes without first response.
5. Review `Photos Requested` leads older than 24 hours.
6. Review `Quote Sent` leads older than 48 hours without follow-up.
7. Review approved jobs without vendor assignment.
8. Review in-progress jobs missing photo proof.
9. Review completed jobs missing review request.
10. Review estimate-vs-actual variance for recently completed jobs.

## Escalation logic

- Any failed Railway health check is production-critical.
- Any stale high-intent property-manager lead is revenue-critical.
- Any approved job without a vendor is operations-critical.
- Any completed job without photo proof is quality-critical.
