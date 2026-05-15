const fs = require("fs");
const path = require("path");
const { evaluateControlSnapshot } = require("../lib/control-system");

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function isAuthorized(req) {
  const token = process.env.ADMIN_API_TOKEN && process.env.ADMIN_API_TOKEN.trim();
  if (!token && process.env.NODE_ENV !== "production") return true;
  return req.headers.authorization === `Bearer ${token}`;
}

function loadExampleSnapshot() {
  const snapshotPath = path.join(__dirname, "..", "config", "ops-snapshot.example.json");
  return JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
}

module.exports = function opsDashboardHandler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: "Unauthorized" });
    return;
  }

  const controlReport = evaluateControlSnapshot(loadExampleSnapshot());
  sendJson(res, 200, {
    ok: true,
    mode: process.env.DATABASE_URL ? "database_ready" : "example_snapshot",
    controlReport,
    visibility: {
      market: controlReport.market,
      criticalCount: controlReport.summary.criticalCount,
      warningCount: controlReport.summary.warningCount,
      recommendedActions: controlReport.recommendedActions,
    },
  });
};
