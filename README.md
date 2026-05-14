# Ready White Website

> **Important:** Do not paste a real GoHighLevel Private Integration Token into frontend code, commits, or public settings. This repo now includes a server-side API route that reads the token from environment variables and sends leads to GoHighLevel without exposing the token in the browser.

A lightweight static landing page for the Ready White property-refresh funnel. The page is designed as a premium frontend that can send branded quote requests into GoHighLevel workflows instead of relying on an embedded form.

## Funnel stack

- **Website frontend:** premium operational brand, a dedicated `/services` page, standardized package cards, workflow visuals, who-we-serve cards, FAQ, testimonials placeholders, and property refresh intake.
- **GoHighLevel backend:** lead capture, contact upsert, photo requests, photo receipt, scope review, quote sent, follow-up, approval, vendor assignment, scheduling, in-progress tracking, photo proof review, completion, review requests, and closeout management.
- **Custom integration:** form submissions post to `api/ghl-lead.js`, which uses a GoHighLevel Private Integration Token from server-side environment variables.

## Core positioning

Ready White is not positioned as a traditional painting contractor. The website presents Ready White as a standardized property refresh operating system for rentals, resales, investors, agents, flippers, and property managers.

The page emphasizes speed, standardization, consistency, package selection, operational reliability, subcontractor-led fulfillment, and reduced estimate chaos.

## Standardized package architecture

The website uses four fixed-scope package lanes instead of generic custom estimate language:

1. **Basic Turn White** — light-prep rerent white repaint for entry-level turnover work.
2. **Standard Market Ready** — moderate prep and clean market presentation for the core offer.
3. **Premium Listing Ready** — stronger prep and finish quality for higher-end resale presentation.
4. **Heavy Turn Reset** — damage-heavy, high-prep exception work requiring scope verification.

## Recommended lead flow

1. Visitor clicks **Get My Property Quote** or **Upload Property Photos**.
2. The form collects first name, email, phone, property address, property type, occupied/vacant status, desired timeline, likely package, notes, and uploaded photo names.
3. The payload applies standardized operational tags such as `source:squarespace`, `vertical:property-management`, `vertical:investor`, `timeline:asap`, `vacant:true`, and `lead:new`.
4. The lead starts in the `New Lead` pipeline stage for photo requests, photo receipt, scope review, quote sent, follow-up, approval, vendor assignment, scheduling, in-progress tracking, photo proof review, completion, review request, and closeout.

## What is configured here

This repo configures the public website experience, the browser-side operational lead payload, and a server-side API route for sending contacts to GoHighLevel. It does **not** create GHL pipelines, stage IDs, workflow automations, calendars, or message senders on its own.

| Area | Included in this repo | Must be configured in GoHighLevel |
| --- | --- | --- |
| Website pages | Homepage plus `/services` package-detail page with package matrix, lifecycle categories, add-ons, operational handoff, and CTAs | Domain/Railway publishing |
| Lead payload | First name, contact details, property details, occupancy status, timeline, package interest, tags, workflow status, photo file names | Production file storage if actual photo uploads are required |
| Contact sync | `api/ghl-lead.js` calls `/contacts/upsert` with the server-side token | `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID` deployment variables |
| Automations | Operational SMS/email language for photo requests, scope review, quote follow-up, vendor assignment, scheduling, photo proof review, and review requests | Actual GHL workflow steps, senders, notifications, timing, and pipeline movement |
| Pipeline | Optional opportunity creation when pipeline env vars are set | Real pipeline ID, stage ID, assignee rules, and workflow automations |
| Packages | Basic Turn White, Standard Market Ready, Premium Listing Ready, Heavy Turn Reset | Any matching GHL custom fields, forms, or workflow branches |


## Paint material cost template

Use the deterministic paint material estimator to calculate required gallons and estimated Sherwin-Williams material cost from room size or known wall square footage:

```bash
npm run estimate:paint -- --length=12 --width=10 --height=8 --coats=2 --product=property_solution_interior_flat --format=markdown
```

Pricing assumptions live in `config/material-pricing.json` and should be updated with current Ready White Sherwin-Williams account pricing before production quote locks. The calculator keeps package quoting standardized by estimating material exposure only; severe prep, water damage, smoke/stain blocking, holes, and custom repairs still require approved exception workflows.

## Connect GoHighLevel

Add your GoHighLevel credentials as deployment environment variables. The private token belongs on the server only; never put it in `script.js` or `index.html`.

```bash
GHL_PRIVATE_INTEGRATION_TOKEN=pit_your_private_integration_token_here
GHL_LOCATION_ID=your_highlevel_location_id
GHL_PIPELINE_ID=your_ready_white_pipeline_id          # optional
GHL_PIPELINE_STAGE_ID=your_new_lead_stage_id          # optional
```

The browser posts property refresh review requests to `/api/ghl-lead`. That route uses the token to call HighLevel's `/contacts/upsert` endpoint and, when both pipeline variables are present, creates an opportunity through `/opportunities/`.

With no deployed backend, local preview submissions run in demo mode and log the operational lead payload in the browser console.

Use `ghl-stack.example.json` as the implementation checklist for the real GoHighLevel setup: standardized packages, tags, pipeline stages, workflow messages, notification expectations, and future enhancements.

## API references

- HighLevel Contacts API: <https://marketplace.gohighlevel.com/docs/ghl/contacts/contacts-api/index.html>
- Upsert Contact endpoint: <https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact/index.html>
- Create Opportunity endpoint: <https://marketplace.gohighlevel.com/docs/ghl/opportunities/create-opportunity/>
- Get Pipelines endpoint: <https://marketplace.gohighlevel.com/docs/ghl/opportunities/get-pipelines/>
- Get Tags endpoint: <https://marketplace.gohighlevel.com/docs/ghl/locations/get-location-tags/>
- Get Workflow endpoint: <https://marketplace.gohighlevel.com/docs/ghl/workflows/get-workflow/>

## GoHighLevel email domain DNS records

These DNS records are for the GoHighLevel / LeadConnector Mailgun sending subdomain shown in GHL. Add them at the DNS provider for the Ready White domain, not in Railway.

| Type | Host | Required value | Priority |
| --- | --- | --- | --- |
| TXT | `lc` | `v=spf1 include:spf.leadconnectorhq.com include:mailgun.org ~all` | n/a |
| TXT | `pic._domainkey.lc` | `k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDnYtVvDEpd1ZbyrmOjnzZ4TItFudyR3Skrh4bDOdT57Xzr2H+NO2711sd/iHlu8e3CuOwX4VGYfqVt4dfbXnMhLWuysygCc4khWZTMOvrfXGLzuu1n4LGntD51ng2sdZka/4l4agLaBO1bPm7jIcu/vlyKL/kvIldlUclr4EKYawIDAQAB` | n/a |
| CNAME | `email.lc` | `mailgun.org` | n/a |
| MX | `lc` | `mxa.mailgun.org` | `10` if your DNS host asks |
| MX | `lc` | `mxb.mailgun.org` | `10` if your DNS host asks |

Notes:

- Some DNS providers automatically append the root domain, so enter hosts exactly as `lc`, `pic._domainkey.lc`, and `email.lc` unless your provider asks for fully-qualified names.
- Keep the DKIM TXT value on one logical line. If the DNS UI wraps the text visually, that is usually fine.
- DNS propagation can take several minutes to 24 hours. After adding the records, return to GoHighLevel and click the domain verification/check button.
- `ghl-email-dns.example.zone` contains the same records in a zone-file style format for reference.

## Operations handoff

Use `operations-handoff.md` as the working checklist for Jason and June. It separates repo/Railway/DNS ownership from GHL pipeline and customer workflow automation ownership.

Use `systems-check.md` to prove the stack is operational end-to-end. It includes GitHub → Railway, Railway → website, Railway → GHL, GHL setup reporting, GHL workflow, Squarespace → backend, and final green-light tests. The scheduled GitHub Actions systems check runs at 00:00, 12:00, and 18:00 EST daily (`0 5,17,23 * * *` UTC).

Use `docs/sops/photo-intake-policy.md`, `docs/sops/vendor-policy.md`, `config/outreach.yaml`, `config/kpi-reporting.yaml`, and `npm run audit:ops` to preserve operational standards as workflows change.

Generate a live GoHighLevel setup report with:

```bash
GHL_PRIVATE_INTEGRATION_TOKEN=your_token \
GHL_LOCATION_ID=your_location_id \
GHL_REPORT_OUTPUT=reports/ghl-setup-report.md \
npm run report:ghl
```

The report checks active pipelines, stage order, tags, workflow status, automation coverage, missing objects, and recommendations against the Ready White Customer Jobs standard.

- Jason owns GitHub, Railway variables, public domain checks, DNS records, and live website test submissions.
- June owns GHL pipeline stages, tags, customer workflow automation, SMS/email language, internal notifications, and package alignment.

For live smoke tests, set `READYWHITE_RAILWAY_BASE_URL` to the Railway backend domain. `https://www.readywhite.com/` is the Squarespace marketing layer unless it proxies `/health`, `/readiness`, and `/api/ghl-lead` to Railway.

The app also exposes `/readiness` to show whether required Railway variables are present. Use it after deployment:

```bash
curl https://YOUR-RAILWAY-DOMAIN/readiness
```

## GoHighLevel setup checklist

Before this form can drive live CRM automation, configure these items in GoHighLevel or in your middleware/integration layer:

1. Create standardized tags including `source:squarespace`, `vertical:property-management`, `vertical:investor`, `timeline:asap`, `vacant:true`, `lead:new`, `lead:quoted`, and `lead:won`.
2. Create a Ready White pipeline with `New Lead`, `Photos Requested`, `Photos Received`, `Scope Review`, `Quote Sent`, `Follow-Up`, `Approved`, `Vendor Assignment`, `Scheduled`, `In Progress`, `Photo Proof Review`, `Completed`, `Review Requested`, `Closed Won`, and `Closed Lost` stages.
3. Deploy the included `/api/ghl-lead` route with `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID` set.
4. Add `GHL_PIPELINE_ID` and `GHL_PIPELINE_STAGE_ID` if the route should create opportunities after contact upsert.
5. Add workflow actions for photos requested, photos received, scope review, quote sent, follow-up, approval, vendor assignment, scheduled, in progress, photo proof review, completed, review requested, confirmation SMS, confirmation email, and internal notification.
6. Add production photo upload handling if actual image files need to be stored, reviewed, or attached to opportunities.

## Railway deployment

Railway detects this as a Node.js app from `package.json` and runs the start command:

```bash
npm start
```

The Express server in `server.js` serves the static website files and mounts the GoHighLevel lead endpoint at `/api/ghl-lead`.

### Railway new-project screen

On Railway's **New project** screen, choose **GitHub Repository**. Do **not** choose **Empty Project**, because an empty project has no GitHub code for Railway to build.

Use this sequence:

1. Click **GitHub Repository**.
2. Authorize Railway to access GitHub if prompted.
3. Select the Ready White repository that contains `package.json`, `server.js`, `index.html`, `services.html`, `script.js`, `style.css`, and `api/ghl-lead.js`.
4. Let Railway deploy from the selected branch.
5. Open the generated Railway domain and verify `/health` returns an `ok` response.
6. Add the GoHighLevel variables below in the Railway service settings.
7. Redeploy, then submit a test lead from the live Railway URL and confirm the contact appears in GoHighLevel.

Add these Railway variables after the first deploy succeeds:

```bash
GHL_PRIVATE_INTEGRATION_TOKEN=pit_your_private_integration_token_here
GHL_LOCATION_ID=your_highlevel_location_id
GHL_PIPELINE_ID=your_ready_white_pipeline_id          # optional
GHL_PIPELINE_STAGE_ID=your_new_lead_stage_id          # optional
```

If the Ready White repo does not appear in Railway's GitHub Repository list, the app files have not been pushed to GitHub yet or Railway has not been granted access to that repository. Push the files first, then refresh Railway's repository picker.

### Railway production service settings

For the production service settings screen, use these values:

| Railway setting | Value | Notes |
| --- | --- | --- |
| Source Repo | Ready White GitHub repo | Must contain `package.json` at the selected root directory. |
| Branch connected to production | `main` | Pushes to `main` trigger production deploys. |
| Root Directory | leave blank | Use blank unless the app lives inside a subfolder. |
| Builder | Railpack default | Railway will detect Node from `package.json`. |
| Custom Build Command | leave blank | `npm install` is handled by Railway. |
| Start Command | `npm start` | Also declared in `railway.json`. |
| Healthcheck Path | `/health` | `server.js` returns `{ "ok": true }` here. |
| Public Networking | Generate Domain | Required before testing the live form URL. |

This repo includes `railway.json` so Railway can read the production start command, healthcheck path, and restart policy from code. If you use Railway's UI instead, the values above should match the config file.

After generating a public domain, test these URLs:

```bash
curl https://YOUR-RAILWAY-DOMAIN/health
curl -I https://YOUR-RAILWAY-DOMAIN/
```

Then add the GoHighLevel variables in Railway's **Variables** tab and redeploy production.

## Local preview

Install dependencies once:

```bash
npm install
```

Run the same server Railway uses:

```bash
npm start
```

Then open <http://localhost:3000>. Localhost form submissions intentionally stay in demo mode so a private token is never needed in the browser.

You can also run a static-only preview with `python3 -m http.server 4173`, but Railway should use the Node server.

## Crostini / GitHub push troubleshooting

If `git` works but `git add`, `git commit`, or `git push` says `fatal: not a git repository`, you are not inside the cloned project folder. Run these checks first:

```bash
pwd
ls -la
git status
```

If your home folder is empty, clone the GitHub repo before running commit commands. Replace the URL with the real Ready White repository URL shown in GitHub:

```bash
cd ~
git clone https://github.com/YOUR-GITHUB-USER/YOUR-READYWHITE-REPO.git
cd YOUR-READYWHITE-REPO
git status
```

If GitHub prompts for a username/password over HTTPS, use one of these authentication options:

1. Use GitHub CLI:

   ```bash
   sudo apt install gh -y
   gh auth login
   git clone https://github.com/YOUR-GITHUB-USER/YOUR-READYWHITE-REPO.git
   ```

2. Use SSH keys and clone with an SSH URL:

   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   cat ~/.ssh/id_ed25519.pub
   git clone git@github.com:YOUR-GITHUB-USER/YOUR-READYWHITE-REPO.git
   ```

3. Use a GitHub personal access token when Git asks for the HTTPS password.

After you are inside the cloned repo and the Ready White files exist, push the app:

```bash
git add .
git commit -m "Deploy Ready White app"
git push
```

Do not type `readywhite` by itself; it is a folder name, not a command. Use `cd readywhite` to enter it. If you see paste characters like `^[[200~cd`, type the command manually instead of pasting with bracketed-paste artifacts.
