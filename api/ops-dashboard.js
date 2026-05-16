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

function loadLiveSnapshot() {
  if (process.env.OPS_SNAPSHOT_JSON?.trim()) {
    return JSON.parse(process.env.OPS_SNAPSHOT_JSON);
  }
  if (process.env.OPS_SNAPSHOT_PATH?.trim()) {
    return JSON.parse(fs.readFileSync(process.env.OPS_SNAPSHOT_PATH, "utf8"));
  }
  if (process.env.ALLOW_EXAMPLE_OPS_DASHBOARD === "true") {
    return loadExampleSnapshot();
  }
  return null;
}

module.exports = function opsDashboardHandler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = requireRole(req, res, ["read_only", "ops", "admin"]);
  if (!auth) return;

  const snapshot = loadLiveSnapshot();
  if (!snapshot) {
    sendJson(res, 503, {
      error: "Live ops snapshot is not configured",
      mode: "snapshot_required",
      requiredConfiguration: ["OPS_SNAPSHOT_JSON or OPS_SNAPSHOT_PATH", "ALLOW_EXAMPLE_OPS_DASHBOARD=true only for local demos"],
    });
    return;
  }

  const controlReport = evaluateControlSnapshot(snapshot);
  sendJson(res, 200, {
    ok: true,
    mode: process.env.ALLOW_EXAMPLE_OPS_DASHBOARD === "true" ? "example_snapshot_demo" : "live_snapshot",
    controlReport,
    visibility: {
      market: controlReport.market,
      criticalCount: controlReport.summary.criticalCount,
      warningCount: controlReport.summary.warningCount,
      recommendedActions: controlReport.recommendedActions,
    },
  });
};
