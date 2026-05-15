const fs = require("fs");
const path = require("path");
const { evaluateControlSnapshot } = require("../lib/control-system");

const root = path.resolve(__dirname, "..");
const snapshotPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "config", "ops-snapshot.example.json");
const failOnWarning = process.argv.includes("--fail-on-warning");

function readSnapshot(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const report = evaluateControlSnapshot(readSnapshot(snapshotPath));
console.log(JSON.stringify(report, null, 2));

if (report.summary.criticalCount > 0 || (failOnWarning && report.summary.warningCount > 0)) {
  process.exitCode = 1;
}
