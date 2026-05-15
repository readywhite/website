# GoHighLevel Object Standards

## Pipeline

Name: `Ready White Customer Jobs`

## Stages

1. `New Lead`
2. `Photos Requested`
3. `Photos Received`
4. `Scope Review`
5. `Quote Sent`
6. `Follow-Up`
7. `Approved`
8. `Vendor Assignment`
9. `Scheduled`
10. `In Progress`
11. `Photo Proof Review`
12. `Completed`
13. `Review Requested`
14. `Closed Won`
15. `Closed Lost`

## Standard tags

| Tag | Use |
| --- | --- |
| `source:squarespace` | Website/Squarespace lead source. |
| `vertical:property-management` | Property manager lead. |
| `vertical:investor` | Investor lead. |
| `timeline:asap` | Urgent lead requiring speed-to-lead priority. |
| `vacant:true` | Vacant unit/property. |
| `lead:new` | New unquoted lead. |
| `lead:quoted` | Quote has been sent. |
| `lead:won` | Job closed won. |

## Stage movement rules

- `New Lead` to `Photos Requested`: send instant SMS/email with photo policy.
- `Photos Requested` to `Photos Received`: only after photo evidence is logged.
- `Photos Received` to `Scope Review`: normalize intake into canonical job object.
- `Scope Review` to `Quote Sent`: only after package, add-ons, margin, and exception status are resolved.
- `Approved` to `Vendor Assignment`: only after customer approval and target schedule are known.
- `In Progress` to `Photo Proof Review`: only after vendor submits required completion photos.
- `Completed` to `Review Requested`: only after proof review passes.

## Workflow ROI

These standards improve speed-to-lead, reduce stale opportunities, protect margin, enable package pricing, and preserve reporting integrity across GHL and Railway.
