const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const ghlLeadHandler = require("./api/ghl-lead");
const photoEstimateHandler = require("./api/photo-estimate");
const wallCorrectionsHandler = require("./api/wall-corrections");
const opsDashboardHandler = require("./api/ops-dashboard");
const jobActualsHandler = require("./api/job-actuals");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "readywhite-ghl" });
});

app.post("/api/photo-estimate", photoEstimateHandler);
app.post("/api/ghl-lead", ghlLeadHandler);
app.post("/api/wall-corrections", wallCorrectionsHandler);
app.get("/api/ops-dashboard", opsDashboardHandler);
app.post("/api/job-actuals", jobActualsHandler);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Ready White app running on port ${port}`);
});
