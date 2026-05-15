# Customer Intake Workflow

The intake workflow must optimize for speed-to-lead, complete photo collection, clean GHL data, and fast quote generation.

## Canonical Flow

```txt
Website/Squarespace form
  -> Railway API
  -> GoHighLevel contact/opportunity
  -> Photos Requested or Photos Received
  -> Scope Review
  -> Quote Sent
  -> Follow-Up
  -> Approved
```

## Required Intake Fields

Collect:
- name
- email
- phone
- property address
- property type
- vacancy status
- desired timeline
- room count or area count
- scope notes
- photo file references or upload links

## Customer Photo Policy

Require:
- 1 wide photo of each room
- 1 photo of the worst wall in each room
- photos of ceilings, trim, stains, peeling paint, water damage, smoke damage, holes, and heavy prep areas when present

Use photos to:
- prevent scope drift
- protect margins
- detect exception jobs
- preserve quote speed

## Speed-to-Lead Standard

New leads should receive immediate confirmation and clear photo instructions. If photos are missing, the lead should move to `Photos Requested` and receive automated reminders until the request is completed or the lead becomes stale.

## GHL Routing

Default pipeline:
- Ready White Customer Jobs

Expected early stages:
- New Lead
- Photos Requested
- Photos Received
- Scope Review
- Quote Sent
- Follow-Up

Recommended tags:
- `source:squarespace`
- `lead:new`
- `vertical:property-management` when applicable
- `vertical:investor` when applicable
- `timeline:asap` when applicable
- `vacant:true` when applicable

## Stale Lead Recovery

Leads should be considered stale when they stop progressing through required photo collection, quote review, approval, or scheduling steps. Stale-lead recovery should prioritize SMS first, then email, then internal review for high-value property-manager or investor leads.
