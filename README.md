# Ready White Website

Static landing page for Ready White's property refresh painting offer.

## Launch Checklist

1. Upload the kitchen hero image to `assets/kitchen-hero.jpg`.
2. Build the GoHighLevel form named **Ready White Quote Request** using `GHL_SETUP.md`.
3. Keep the GHL Private Integration Token/API key out of the website code and out of git.
4. To look up the live form ID locally, run `GHL_API_KEY="<token>" scripts/find-ghl-form-id.sh`.
5. Replace the `XXXXXXXX` placeholder in the embedded GoHighLevel iframe in `index.html` with the live form ID.
6. Set the form redirect to `thank-you.html` or use the approved popup message.
7. Publish the site and test a full lead submission.

## Local Preview

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.
