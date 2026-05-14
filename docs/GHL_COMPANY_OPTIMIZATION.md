# Ready White GoHighLevel Company Optimization

## North Star

Ready White wins when every property lead gets a fast response, a clear quote path, and disciplined follow-up until the job is won, scheduled, completed, or intentionally closed.

**North Star metric:** qualified quote requests that become scheduled painting jobs.

Supporting metrics:

- speed to lead: first SMS/call attempt within 5 minutes during working hours
- quote speed: quote sent within 24 hours after enough photos/details are received
- pipeline hygiene: every open opportunity has an owner, stage, next task, and last activity
- follow-up discipline: no open lead sits untouched for more than 24 business hours
- close-loop reporting: every lost lead has a reason and every won job has completion notes

## Platform Roles

| Platform | Role | What belongs there | What does not belong there |
| --- | --- | --- | --- |
| Squarespace | Marketing layer and visual brand experience | landing pages, brand copy, public form UX, trust visuals | private tokens, CRM workflow logic, pipeline ownership |
| Railway | Secure backend integration layer | secrets, webhook intake, payload normalization, GoHighLevel API calls, audit scripts | visual page editing, CRM pipeline management |
| GoHighLevel | Operational CRM + automation system | contacts, opportunities, workflows, SMS/email, notifications, VA tasks, pipeline reporting | public secret storage, marketing page design |

## Recommended GHL Operating Structure

### Pipeline

Use one primary operations pipeline for sales and job flow:

**Ready White Customer Jobs**

Stages:

1. New Lead
2. Contact Attempted
3. Photos Needed
4. Photos Received
5. Quote In Progress
6. Quote Sent
7. Follow-Up
8. Approved
9. Scheduled
10. In Progress
11. Completed
12. Closed Won
13. Closed Lost

### Core Tags

Use tags to segment automations without creating too many pipelines:

- `Website Lead`
- `Property Refresh`
- `Interior Estimate`
- `ready-white`
- `source-squarespace`
- `timeline-asap`
- `timeline-3-days`
- `timeline-1-week`
- `vacant-yes`
- `vacant-no`
- `service-vacant-turnover-painting`
- `service-rental-repainting`
- `service-investor-refresh`
- `service-move-out-painting`
- `service-wall-repainting`
- `service-wall-ceiling`
- `service-trim-repainting`
- `service-heavy-reset`

### Required Custom Fields

Create these fields in GHL if they do not already exist:

- Property Address
- Property Type
- Service Needed
- Timeline
- Vacant
- Photo URLs
- Project Notes
- Lead Source
- UTM Source
- UTM Medium
- UTM Campaign
- Lost Reason
- Next Step

## Workflow Map

### 1. New Website Lead Workflow

Trigger:

```text
Opportunity Created
```

Condition:

```text
Pipeline = Ready White Customer Jobs
```

Actions:

1. Add tags: `Website Lead`, `Property Refresh`, `Interior Estimate`, `source-squarespace`.
2. Send internal notification to COO + SDR.
3. Create SDR task: call within 5 minutes.
4. Send auto-reply SMS.
5. Send auto-reply email.
6. If photos are missing, move to **Photos Needed** and trigger photo-request sequence.
7. If photos are present, move to **Photos Received** and create COO quote-review task.

### 2. Photos Needed Sequence

Trigger:

```text
Opportunity Stage Changed → Photos Needed
```

Actions:

1. SMS immediately requesting photos.
2. Email with photo checklist.
3. Task for SDR to follow up after 2 business hours.
4. If no reply after 24 hours, send reminder SMS.
5. If no reply after 72 hours, move to Follow-Up.

### 3. Quote Sent Follow-Up

Trigger:

```text
Opportunity Stage Changed → Quote Sent
```

Actions:

1. SMS quote confirmation.
2. Email quote confirmation.
3. SDR call task for next business day.
4. Reminder sequence on day 2, day 4, and day 7.
5. COO review task if no response after 7 days.

### 4. Approved to Scheduled

Trigger:

```text
Opportunity Stage Changed → Approved
```

Actions:

1. Notify COO.
2. Create scheduling task.
3. Send customer next-step confirmation.
4. Move to Scheduled after date is confirmed.

### 5. Completed Job Review Loop

Trigger:

```text
Opportunity Stage Changed → Completed
```

Actions:

1. Send thank-you message.
2. Request review/referral.
3. Create internal task to upload completion notes/photos.
4. Move to Closed Won after admin completion.

## COO Role

The COO owns operational quality and pipeline integrity.

Daily responsibilities:

- check every opportunity in New Lead, Photos Received, Quote In Progress, Quote Sent, and Approved
- make sure every active opportunity has a next task
- verify quote review within 24 hours of receiving photos
- review lost reasons weekly
- review SDR performance daily
- own job scheduling and completion notes

Weekly COO scorecard:

- total new leads
- response-time compliance
- quotes sent
- approved jobs
- scheduled jobs
- lost leads by reason
- pipeline stages with stale opportunities

## SDR Role

The SDR owns speed-to-lead and disciplined follow-up.

Daily responsibilities:

- call every new lead quickly
- send SMS/email follow-up when calls do not connect
- collect missing photos/details
- update stage and notes after every touch
- keep Follow-Up clean
- escalate high-intent leads to COO

Daily SDR scorecard:

- new leads touched
- calls made
- SMS replies
- photos collected
- quotes moved forward
- follow-ups completed
- stale leads remaining

## Broken-Connection Audit Checklist

Run this weekly:

```bash
GHL_PRIVATE_INTEGRATION_TOKEN="<token>" GHL_LOCATION_ID="<location>" npm run audit:ghl
```

Review for:

- missing required pipeline
- missing expected stages
- missing Ready White Quote Request form
- missing workflows
- inactive workflows
- form names that do not map to workflows
- opportunities outside expected stages
- missing environment variables
- stale open opportunities

## Best Next Moves

1. Confirm the Ready White Customer Jobs pipeline exists with the recommended stages.
2. Confirm New Website Lead Workflow is active and triggered by Opportunity Created.
3. Give the SDR a strict 5-minute response SLA.
4. Give the COO daily pipeline hygiene ownership.
5. Add one weekly 30-minute GHL cleanup meeting.
6. Run `npm run audit:ghl` before and after major GHL changes.
