# GoHighLevel Workflow Standards

GoHighLevel is the CRM and automation system for Ready White. Preserve stable naming conventions, deterministic stage transitions, and standardized object names.

## Required Pipeline

Pipeline name:
- Ready White Customer Jobs

## Required Stages

Use these stages exactly unless a deliberate migration updates all code, docs, automations, and audit checks together:

1. New Lead
2. Photos Requested
3. Photos Received
4. Scope Review
5. Quote Sent
6. Follow-Up
7. Approved
8. Vendor Assignment
9. Scheduled
10. In Progress
11. Photo Proof Review
12. Completed
13. Review Requested
14. Closed Won
15. Closed Lost

## Standard Tags

Examples:
- `source:squarespace`
- `vertical:property-management`
- `vertical:investor`
- `timeline:asap`
- `vacant:true`
- `lead:new`
- `lead:quoted`
- `lead:won`

## Core Automations

Recommended workflows:
- instant new-lead confirmation
- photo request sequence
- photos received internal notification
- scope review task creation
- quote sent follow-up
- stale quote recovery
- approval confirmation
- vendor assignment notification
- schedule confirmation
- in-progress monitoring
- photo proof review task
- completion confirmation
- review request
- closed-lost reason capture

## Missed-Call Text-Back

Missed calls should trigger immediate SMS response with a concise quote CTA and photo instructions. High-intent or property-manager leads should create an internal follow-up task.

## KPI Reporting

Track:
- lead response time
- photo completion rate
- time from lead to quote
- quote close rate
- approval to scheduled time
- scheduled to completed time
- callback rate
- review request completion
- stale lead count by stage
- property-manager repeat lead rate

## Workflow Change Rule

Any automation change should document ROI impact, operational impact, scalability impact, and risk reduction. Update this file when stages, tags, automations, or lifecycle assumptions change.
