const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const ghlLeadHandler = require("./api/ghl-lead");
const vendorLeadHandler = require("./api/vendor-lead");

const app = express();
const port = process.env.PORT || 3000;

function hasEnv(name) {
  return Boolean(process.env[name] && process.env[name].trim());
}

function getReadinessPayload() {
  const required = {
    GHL_PRIVATE_INTEGRATION_TOKEN: hasEnv("GHL_PRIVATE_INTEGRATION_TOKEN"),
    GHL_LOCATION_ID: hasEnv("GHL_LOCATION_ID"),
  };
  const optional = {
    GHL_PIPELINE_ID: hasEnv("GHL_PIPELINE_ID"),
    GHL_PIPELINE_STAGE_ID: hasEnv("GHL_PIPELINE_STAGE_ID"),
    GHL_PIPELINE_STAGE_NAME: hasEnv("GHL_PIPELINE_STAGE_NAME"),
  };
  const missingRequired = Object.entries(required)
    .filter(([, configured]) => !configured)
    .map(([name]) => name);

  return {
    ok: missingRequired.length === 0,
    service: "readywhite-ghl",
    website: {
      homepage: true,
      servicesPage: true,
      locationsPage: true,
      galleryPage: true,
      getStartedPage: true,
      contactPage: true,
      vendorsPage: true,
      notFoundPage: true,
      leadEndpoint: "/api/ghl-lead",
      vendorEndpoint: "/api/vendor-lead",
    },
    railway: {
      required,
      optional,
      missingRequired,
    },
    nextSteps: missingRequired.length === 0
      ? ["Submit a live test lead and confirm contact/opportunity behavior in GoHighLevel."]
      : ["Add missing Railway variables, redeploy, then submit a live test lead."],
  };
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "readywhite-ghl" });
});

app.get("/readiness", (_req, res) => {
  const payload = getReadinessPayload();
  res.status(payload.ok ? 200 : 503).json(payload);
});

app.post("/api/ghl-lead", ghlLeadHandler);
app.post("/api/vendor-lead", vendorLeadHandler);

app.get("/services", (_req, res) => {
  res.sendFile(path.join(__dirname, "services.html"));
});

app.get("/locations", (_req, res) => {
  res.sendFile(path.join(__dirname, "locations.html"));
});

app.get("/gallery", (_req, res) => {
  res.sendFile(path.join(__dirname, "gallery.html"));
});

app.get("/get-started", (_req, res) => {
  res.sendFile(path.join(__dirname, "get-started.html"));
});

app.get("/contact", (_req, res) => {
  res.sendFile(path.join(__dirname, "contact.html"));
});

app.get("/vendors", (_req, res) => {
  res.sendFile(path.join(__dirname, "vendors.html"));
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

app.listen(port, () => {
  console.log(`Ready White app running on port ${port}`);
});
