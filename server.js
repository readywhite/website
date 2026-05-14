const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const ghlLeadHandler = require("./api/ghl-lead");

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
      leadEndpoint: "/api/ghl-lead",
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

app.get("/services", (_req, res) => {
  res.sendFile(path.join(__dirname, "services.html"));
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Ready White app running on port ${port}`);
});
