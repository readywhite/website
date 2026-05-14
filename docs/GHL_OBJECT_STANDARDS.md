# Ready White GHL Object Standards

Use these exact names. Do not rename pipeline stages, tags, or custom fields casually. Codex-assisted automation depends on stable object names.

## Pipeline

```text
Ready White Customer Jobs
```

## Stages

```text
New Lead
Photos Requested
Photos Received
Quote Sent
Follow-Up
Approved
Scheduled
In Progress
Completed
Closed Won
Closed Lost
```

## Tags

```text
source:squarespace
source:facebook
timeline:asap
service:rental-repaint
vacant:true
lead:new
lead:quoted
lead:won
```

## Custom Fields

```text
property_address
property_type
timeline
vacant
service_needed
lead_source
```

## Assignment Standards

- SDR owns New Lead, Photos Requested, Quote Sent, and Follow-Up activity.
- COO owns Photos Received, Approved, Scheduled, In Progress, Completed, and stalled opportunity recovery.
- Closed Won and Closed Lost must include a clear note.

## Drift Rule

If a live GHL object does not match this file, update GHL or update this file in the same PR. Do not allow silent naming drift.
