# Ready White Website

> **Important:** Do not paste a real GoHighLevel Private Integration Token into frontend code, commits, or public settings. This repo now includes a server-side API route that reads the token from environment variables and sends leads to GoHighLevel without exposing the token in the browser.

A lightweight static landing page for the Ready White property-refresh funnel. The page is designed as a premium frontend that can send branded quote requests into GoHighLevel workflows instead of relying on an embedded form. This repo also stores Ready White operational memory in `AGENTS.md` and `docs/` so Codex can reference pricing rules, workflows, vendor standards, estimating rules, GHL processes, and Railway/GitHub architecture before making changes.

## Funnel stack

- **Website frontend:** hero, service packages, before/after gallery, CTA buttons, and lead form.
- **GoHighLevel backend:** lead capture, CRM, automations, SMS/email follow-up, pipeline management, quote workflows, and appointment booking.
- **Custom integration:** form submissions post to `api/ghl-lead.js`, which uses a GoHighLevel Private Integration Token from server-side environment variables.

## Recommended lead flow

1. Visitor clicks **Get My Property Quote**.
2. The form collects name, email, phone, property address, property type, notes, and uploaded photo names.
3. The payload includes standardized tags such as `source:squarespace` and `lead:new`.
4. The lead starts in the `New Lead` pipeline stage for follow-up workflows.
5. Missing or incomplete property photos should move the opportunity to `Photos Requested`; complete photo submissions should support `Photos Received` and `Scope Review`.

## What is configured here

This repo configures the public website experience, the browser-side lead payload, and a server-side API route for sending contacts to GoHighLevel. It does **not** create GHL pipelines, stage IDs, workflow automations, calendars, or message senders on its own.

| Area | Included in this repo | Must be configured in GoHighLevel |
| --- | --- | --- |
| Landing page | Hero, CTAs, packages, gallery placeholders, intake form | Domain/Squarespace publishing if hosted outside this repo |
| Lead payload | Contact details, tags, pipeline stage, photo file names | Production file storage if actual photo uploads are required |
| Contact sync | `api/ghl-lead.js` calls `/contacts/upsert` with the server-side token | `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID` deployment variables |
| Automations | Recommended SMS/email copy shown on the page | Actual workflow steps, senders, notifications, and timing |
| Pipeline | Optional opportunity creation when pipeline env vars are set | Real pipeline ID, stage ID, assignee rules, and workflow automations |
| Photos | File names included in JSON demo payload | File hosting/upload handling before sending production payloads |

## Company context repository

Ready White operational intelligence lives in structured markdown so Codex and operators can reference stable business rules instead of chat history. Review these files before changing workflow, automation, pricing, lead routing, CRM, estimating, or vendor behavior:

- `AGENTS.md` — repository-wide Ready White operating rules for Codex.
- `docs/README.md` — documentation map and source-of-truth usage standard.
- `docs/pricing/room-pricing.md` — package pricing baseline and margin guardrails.
- `docs/estimating/ai-estimate-rules.md` — photo-based estimating and exception detection.
- `docs/workflows/customer-intake.md` — website-to-GHL intake workflow.
- `docs/workflows/vendor-dispatch.md` — approved-job dispatch workflow.
- `docs/vendors/vendor-standards.md` — subcontractor fulfillment standards and scorecards.
- `docs/automation/ghl-workflows.md` — required GHL pipeline stages, tags, automations, and KPIs.
- `docs/architecture/railway-github-ghl.md` — stack boundaries and environment-variable security.

## Connect GoHighLevel

Add your GoHighLevel credentials as deployment environment variables. The private token belongs on the server only; never put it in `script.js` or `index.html`.

```bash
GHL_PRIVATE_INTEGRATION_TOKEN=pit_your_private_integration_token_here
GHL_LOCATION_ID=your_highlevel_location_id
GHL_PIPELINE_ID=your_ready_white_pipeline_id          # optional
GHL_PIPELINE_STAGE_ID=your_new_lead_stage_id          # optional
```

The browser posts quote requests to `/api/ghl-lead`. That route uses the token to call HighLevel's `/contacts/upsert` endpoint and, when both pipeline variables are present, creates an opportunity through `/opportunities/`.

With no deployed backend, local preview submissions run in demo mode and log the lead payload in the browser console.

Use `ghl-stack.example.json` as the implementation checklist for the real GoHighLevel setup: tags, pipeline stages, workflow messages, notification expectations, and future enhancements. Use `docs/` as the structured company context repository for operational rules and workflow design.


## API references

- HighLevel Contacts API: <https://marketplace.gohighlevel.com/docs/ghl/contacts/contacts-api/index.html>
- Upsert Contact endpoint: <https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact/index.html>
- Create Opportunity endpoint: <https://marketplace.gohighlevel.com/docs/ghl/opportunities/create-opportunity/>

## GoHighLevel setup checklist

Before this form can drive live CRM automation, configure these items in GoHighLevel or in your middleware/integration layer:

1. Create standardized tags such as `source:squarespace`, `lead:new`, `vertical:property-management`, `vertical:investor`, `timeline:asap`, `vacant:true`, `lead:quoted`, and `lead:won`.
2. Create the `Ready White Customer Jobs` pipeline with the canonical stages documented in `docs/automation/ghl-workflows.md`.
3. Deploy the included `/api/ghl-lead` route with `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID` set.
4. Add `GHL_PIPELINE_ID` and `GHL_PIPELINE_STAGE_ID` if the route should create opportunities after contact upsert.
5. Add workflow actions for confirmation SMS, confirmation email, and internal notification.
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
3. Select the Ready White repository that contains `package.json`, `server.js`, `index.html`, `script.js`, `styles.css`, and `api/ghl-lead.js`.
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
