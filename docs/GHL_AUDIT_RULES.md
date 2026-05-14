# GHL Audit Rules

These are the checks Ready White should run against GoHighLevel weekly.

## Required Objects

- Pipeline: Ready White Customer Jobs
- Form: Ready White Quote Request
- Workflow: New Website Lead Workflow
- Workflow: Photos Needed Sequence
- Workflow: Quote Sent Follow-Up
- Workflow: Approved to Scheduled
- Workflow: Completed Job Review Loop

## Required Pipeline Stages

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

## Required Tags

- Website Lead
- Property Refresh
- Interior Estimate
- ready-white
- source-squarespace

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
