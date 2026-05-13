#!/usr/bin/env bash
set -euo pipefail

FORM_NAME="${1:-Ready White Quote Request}"
API_BASE="${GHL_API_BASE:-https://services.leadconnectorhq.com}"
API_VERSION="${GHL_API_VERSION:-2023-02-21}"

if [[ -z "${GHL_API_KEY:-}" ]]; then
  cat >&2 <<'MSG'
Missing GHL_API_KEY.

Set it for this command only, for example:
  GHL_API_KEY="<private-integration-token>" scripts/find-ghl-form-id.sh

Do not paste the token into index.html and do not commit it.
MSG
  exit 1
fi

response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

status_code="$(curl -sS \
  -o "$response_file" \
  -w '%{http_code}' \
  -H "Authorization: Bearer ${GHL_API_KEY}" \
  -H "Version: ${API_VERSION}" \
  -H 'Accept: application/json' \
  "${API_BASE%/}/forms/")"

if [[ "$status_code" -lt 200 || "$status_code" -gt 299 ]]; then
  echo "GHL forms request failed with HTTP ${status_code}." >&2
  echo "Response body:" >&2
  cat "$response_file" >&2
  exit 1
fi

python3 - "$response_file" "$FORM_NAME" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
needle = sys.argv[2].strip().casefold()
payload = json.loads(path.read_text())

matches = []

def walk(value):
    if isinstance(value, dict):
        name = str(value.get("name") or value.get("title") or value.get("formName") or "").strip()
        form_id = value.get("id") or value.get("_id") or value.get("formId")
        if form_id and name.casefold() == needle:
            matches.append((str(form_id), name))
        for child in value.values():
            walk(child)
    elif isinstance(value, list):
        for child in value:
            walk(child)

walk(payload)

if not matches:
    print(f'No exact form match found for "{sys.argv[2]}".')
    print('Open GHL Form Builder, confirm the form exists, or pass the exact form name as the first argument.')
    sys.exit(2)

for form_id, name in matches:
    print(f'Found form: {name}')
    print(f'Form ID: {form_id}')
    print('Use these replacements in index.html:')
    print(f'  src="https://api.leadconnectorhq.com/widget/form/{form_id}"')
    print(f'  id="inline-{form_id}"')
PY
