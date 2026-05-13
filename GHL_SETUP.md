# Ready White GoHighLevel Setup

## Form

**Form name:** Ready White Quote Request

### Contact Info

- Full Name
- Phone
- Email
- Company Name

### Property Info

- Property Address
- Property Type
  - Rental
  - Apartment
  - Single Family
  - Condo
  - Commercial
  - Vacant Property

### Scope Info

- Service Needed
  - Vacant Turnover Painting
  - Rental Repainting
  - Investor Refresh
  - Move-Out Painting
  - Wall Repainting
  - Wall + Ceiling
  - Trim Repainting
  - Heavy Reset

### Timeline

- ASAP
- 3 Days
- 1 Week
- 2 Weeks
- Flexible

### Vacant?

- Yes
- No

### Upload Photos

Use a **File Upload Field** so property photos are attached to the contact/opportunity.

### Project Notes

Use a long text field.

### Button Text

Get Fast Quote

### After Submit

Redirect to `thank-you.html` or show this popup message:

> Thanks! Ready White will review your property photos and contact you shortly.

## Workflow Automation

Create a workflow named **New Website Lead Workflow**.

**Trigger:** Opportunity Created

**Condition:** Pipeline = Ready White Customer Jobs

### 1. Confirm Opportunity Routing

The Railway endpoint creates the opportunity directly in GoHighLevel using these Railway variables:

- Pipeline: Ready White Customer Jobs (`GHL_PIPELINE_ID`)
- Stage: New Lead (`GHL_PIPELINE_STAGE_ID`, optional but recommended)

### 2. Send Internal Notification

Send to:

- izzy@readywhite.com
- june@readywhite.com
- jason@readywhite.com

**Subject:** New Ready White Lead

Include the following in the body:

- Contact info
- Property address
- Service type
- Notes

### 3. Send Auto-Reply SMS

```text
Hi {{contact.first_name}},

Thanks for contacting Ready White.

We received your property refresh request and will review your photos shortly.

- Ready White
```

### 4. Send Auto-Reply Email

**Subject:** We Received Your Request

Use a simple, clean response confirming receipt and next steps.

## Pipeline

Create or confirm the pipeline named **Ready White Customer Jobs** with these stages:

1. New Lead
2. Photos Received
3. Quote Sent
4. Follow-Up
5. Approved
6. Scheduled
7. In Progress
8. Completed
9. Closed Won
10. Closed Lost

## Website and Railway Notes

- Do not use a raw standalone HTML form when using the GoHighLevel-hosted form embed.
- Do not paste a GHL Private Integration Token/API key into frontend code; Railway stores the token as `GHL_PRIVATE_INTEGRATION_TOKEN`.
- If this page uses the GoHighLevel Form Builder iframe, replace the `XXXXXXXX` placeholder in `index.html` with the live form ID.
- If Squarespace owns the public form, point its submission/webhook to `https://YOUR-RAILWAY-URL/api/ghl-lead`; `server.js` will upsert the contact and create the opportunity via the GoHighLevel API.
- If you have a GHL token locally, run `GHL_API_KEY="<token>" scripts/find-ghl-form-id.sh` to find the **Ready White Quote Request** form ID without committing the token.
- Use the uploaded kitchen image as `assets/kitchen-hero.jpg` for the hero/trust-building visual.
