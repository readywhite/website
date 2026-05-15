#!/usr/bin/env bash
set -euo pipefail

# Ready White operational system check.
# Schedule at 00:00, 12:00, and 18:00 America/New_York daily.

missing=0

check_url() {
  local name="$1"
  local url="$2"

  if [[ -z "$url" ]]; then
    echo "WARN $name URL is not configured"
    return 0
  fi

  local status
  status=$(curl --silent --show-error --location --max-time 10 --output /dev/null --write-out "%{http_code}" "$url")

  if [[ "$status" =~ ^[23] ]]; then
    echo "OK $name returned HTTP $status"
  else
    echo "FAIL $name returned HTTP $status"
    missing=1
  fi
}

require_env() {
  local name="$1"

  if [[ -z "${!name:-}" ]]; then
    echo "WARN missing environment variable: $name"
    missing=1
  else
    echo "OK environment variable set: $name"
  fi
}

echo "Ready White operational system check started at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

check_url "Railway health" "${RAILWAY_HEALTH_URL:-http://127.0.0.1:${PORT:-3000}/health}"
check_url "Squarespace form" "${SQUARESPACE_FORM_URL:-}"

require_env "GHL_PRIVATE_INTEGRATION_TOKEN"
require_env "GHL_LOCATION_ID"
require_env "GHL_PIPELINE_ID"
require_env "GHL_PIPELINE_STAGE_ID"

echo "Verify GoHighLevel pipeline manually or through the GHL admin API: Ready White Customer Jobs"
echo "Expected stages: New Lead | Photos Requested | Photos Received | Scope Review | Quote Sent | Follow-Up | Approved | Vendor Assignment | Scheduled | In Progress | Photo Proof Review | Completed | Review Requested | Closed Won | Closed Lost"

if [[ "$missing" -eq 0 ]]; then
  echo "Ready White operational system check passed"
else
  echo "Ready White operational system check completed with warnings/failures"
fi

exit "$missing"
