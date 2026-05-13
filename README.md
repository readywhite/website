# Ready White Website

Landing page and Railway API bridge for Ready White's property refresh painting offer.

## Launch Checklist

1. Upload the kitchen hero image to `assets/kitchen-hero.jpg`.
2. Build the GoHighLevel form named **Ready White Quote Request** using `GHL_SETUP.md` if you are using the embedded GHL form on this page.
3. Keep the GHL Private Integration Token/API key out of frontend code and out of git.
4. Deploy this repo to Railway using `RAILWAY_DEPLOYMENT.md`.
5. In Railway variables, set `GHL_PRIVATE_INTEGRATION_TOKEN`, `GHL_LOCATION_ID`, and `GHL_PIPELINE_ID`.
6. Point the Squarespace form/webhook to `https://YOUR-RAILWAY-URL/api/ghl-lead`.
7. Submit a test lead and confirm the contact and opportunity appear in GoHighLevel.

## API Endpoint

`POST /api/ghl-lead` accepts JSON or URL-encoded form submissions from Squarespace, creates a GoHighLevel contact, then creates an opportunity in the configured pipeline.

Required environment variables:

- `GHL_PRIVATE_INTEGRATION_TOKEN`
- `GHL_LOCATION_ID`
- `GHL_PIPELINE_ID`

Optional environment variables:

- `GHL_PIPELINE_STAGE_ID`
- `ALLOWED_ORIGIN`
- `GHL_API_VERSION`
- `GHL_API_BASE`

## GoHighLevel Form ID Helper

To look up the live form ID locally, run:

```bash
GHL_API_KEY="<token>" scripts/find-ghl-form-id.sh
```

Then replace the `XXXXXXXX` placeholder in the embedded GoHighLevel iframe in `index.html` with the live form ID.

## Local Preview

```bash
npm start
```

Then open <http://localhost:3000>.

For a static-only preview, you can still run:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.
