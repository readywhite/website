# GHL Audit Rules

These are the checks Ready White should run against GoHighLevel weekly.

## Required Objects

- Pipeline: Ready White Customer Jobs
- Form: Ready White Quote Request
- Workflow: New Website Lead Workflow
- Workflow: Missed Lead Rescue
- Workflow: Stale Pipeline Detection
- Workflow: Photo Reminder Automation
- Workflow: Quote Follow-Up Sequence

## Required Pipeline Stages

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

## Required Tags

- source:squarespace
- source:facebook
- timeline:asap
- service:rental-repaint
- vacant:true
- lead:new
- lead:quoted
- lead:won

## Required Custom Fields

- property_address
- property_type
- timeline
- vacant
- service_needed
- lead_source

## Warning Conditions

- no matching pipeline found
- missing expected stage
- no matching form found
- no matching workflow found
- workflow appears inactive
- open opportunities without recent update
- contacts missing phone and email
- duplicate contacts with same email or phone
- webhook secret not configured in Railway

## Manual Checks

The public HighLevel API can audit many objects, but some workflow internals may still require manual review in the GHL UI. Manually verify:

- workflow trigger is Opportunity Created
- workflow condition is Pipeline = Ready White Customer Jobs
- internal notifications go to the right users
- SDR and COO tasks are assigned correctly
- SMS/email senders are connected and compliant
- unsubscribe language and phone registration requirements are satisfied
