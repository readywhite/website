# Railway Deployment for Ready White

Use this when deploying `https://github.com/readywhite/website` to Railway.

## 1. Create the Railway project

1. Go to <https://railway.app>.
2. Click **New Project**.
3. Choose **Deploy from GitHub Repo**.
4. Select **readywhite/website**.

Railway detects `package.json` and starts the site with `npm start`, which runs `server.js`.

## 2. Add environment variables

In Railway, open **Project → Variables** and add:

```text
GHL_PRIVATE_INTEGRATION_TOKEN=YOUR_TOKEN
GHL_LOCATION_ID=wXwmRjNVCUq1DCIy4Lqc
GHL_PIPELINE_ID=wtwJBdMmtrUDQX0PU5Z7
```

Optional but recommended if you want the opportunity to land in a specific first stage immediately:

```text
GHL_PIPELINE_STAGE_ID=YOUR_NEW_LEAD_STAGE_ID
ALLOWED_ORIGIN=https://your-squarespace-domain.com
```

Never paste the private integration token into frontend code, Squarespace page code, or committed files.

## 3. Deploy

After the GitHub repo is connected and variables are saved, Railway will build and deploy automatically.

Your public URL will look similar to:

```text
https://readywhite-production.up.railway.app
```

## 4. Connect the Squarespace form

Point the Squarespace form submission/webhook to:

```text
https://YOUR-RAILWAY-URL/api/ghl-lead
```

The endpoint accepts either `application/json` or `application/x-www-form-urlencoded` with these field names:

| Field | Accepted names |
| --- | --- |
| Full name | `fullName`, `name`, `full_name` |
| First name | `firstName`, `first_name` |
| Last name | `lastName`, `last_name` |
| Phone | `phone` |
| Email | `email` |
| Company | `companyName`, `company_name` |
| Property address | `propertyAddress`, `property_address`, `address` |
| Property type | `propertyType`, `property_type` |
| Service needed | `serviceNeeded`, `service_needed`, `service` |
| Timeline | `timeline` |
| Vacant | `vacant`, `isVacant`, `is_vacant` |
| Photo links | `photoUrls`, `photo_urls`, `photos` |
| Project notes | `notes`, `projectNotes`, `project_notes` |

## 5. Test submission

Submit one test lead from Squarespace and confirm in GoHighLevel that:

- contact created
- opportunity created
- opportunity is in the **Ready White Customer Jobs** pipeline

## 6. Build GHL automation

In GoHighLevel, open **Automation → Workflows** and create **New Website Lead Workflow**.

Use:

- Trigger: **Opportunity Created**
- Condition: **Pipeline = Ready White Customer Jobs**
- Actions:
  - send SMS
  - send confirmation email
  - notify team
  - assign user
  - create tasks

## Final architecture

```text
Squarespace
    ↓
Railway Backend (/api/ghl-lead)
    ↓
GoHighLevel API
    ↓
CRM + Pipeline + Automations
```
