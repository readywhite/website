const fs = require("fs");
const path = require("path");
const { evaluateControlSnapshot } = require("../lib/control-system");
const { requireRole } = require("../lib/auth");

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
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

  const auth = requireRole(req, res, ["read_only", "ops", "admin"]);
  if (!auth) return;

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
