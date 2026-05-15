const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const ghlLeadHandler = require("./api/ghl-lead");

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigin = process.env.ALLOWED_ORIGIN && process.env.ALLOWED_ORIGIN.trim();

app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "readywhite-ghl" });
});

app.post("/api/ghl-lead", ghlLeadHandler);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Ready White app running on port ${port}`);
});
