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
2. Photos Requested
3. Photos Received
4. Quote Sent
5. Follow-Up
6. Approved
7. Scheduled
8. In Progress
9. Completed
10. Closed Won
11. Closed Lost

### Core Tags

Use tags to segment automations without creating too many pipelines:

- `source:squarespace`
- `source:facebook`
- `timeline:asap`
- `service:rental-repaint`
- `vacant:true`
- `lead:new`
- `lead:quoted`
- `lead:won`

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

1. Add tags: `source:squarespace`, `lead:new`, `service:rental-repaint`.
2. Send internal notification to COO + SDR.
3. Create SDR task: call within 5 minutes.
4. Send auto-reply SMS.
5. Send auto-reply email.
6. If photos are missing, move to **Photos Requested** and trigger Photo Reminder Automation.
7. If photos are present, move to **Photos Received** and create COO quote-review task.

### 2. Missed Lead Rescue

Trigger:

```text
Opportunity Created and no outbound call/SMS activity within 5 minutes
```

Actions:

1. Notify COO.
2. Notify SDR.
3. Create urgent SDR task.
4. Send escalation SMS if appropriate.

### 3. Stale Pipeline Detection

Trigger:

```text
Open opportunity idle for more than 48 hours
```

Actions:

1. Create COO recovery task.
2. Alert SDR if opportunity is in New Lead, Photos Requested, Quote Sent, or Follow-Up.
3. Add note: stale pipeline recovery needed.

### 4. Photo Reminder Automation

Trigger:

```text
Opportunity Stage Changed → Photos Requested
```

Actions:

1. SMS immediately requesting photos.
2. Email with photo checklist.
3. Task for SDR to follow up after 2 business hours.
4. If no reply after 24 hours, send reminder SMS.
5. If no reply after 72 hours, move to Follow-Up.

### 5. Quote Follow-Up Sequence

Trigger:

```text
Opportunity Stage Changed → Quote Sent
```

Actions:

1. Day 1: SMS + call task.
2. Day 3: SMS + email.
3. Day 7: call + voicemail + SMS.
4. Day 14: final follow-up and COO review.
5. If approved, move to Approved.
6. If unresponsive after review, close lost with reason.

## COO Role

The COO owns operational quality and pipeline integrity.

Daily responsibilities:

- check every opportunity in New Lead, Photos Requested, Photos Received, Quote Sent, Follow-Up, and Approved
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
