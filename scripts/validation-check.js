const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const validation = JSON.parse(fs.readFileSync(path.join(root, "config", "operational-validation-plan.json"), "utf8"));
const stabilization = JSON.parse(fs.readFileSync(path.join(root, "config", "stabilization-plan.json"), "utf8"));
const pricing = JSON.parse(fs.readFileSync(path.join(root, "config", "pricing-rules.json"), "utf8"));
const schema = fs.readFileSync(path.join(root, "db", "schema.sql"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(validation.featureFreeze.enabled === true, "Feature freeze must remain enabled during operational validation");
assert(validation.operationalTruthTargets.minimumWallPhotos >= 1000, "Operational truth plan must target at least 1000 real wall photos");
assert(validation.operationalTruthTargets.minimumActualsCoverageBps >= 9000, "Actuals coverage target must be at least 90%");
assert(stabilization.automationPolicy.firmAutoQuotesEnabled === false, "Firm auto-quotes must remain disabled during validation");
assert(pricing.rolloutControls.requireOperatorApprovalForAllAiEstimates === true, "Operator approval must remain required for AI estimates");
assert(schema.includes("CREATE TABLE IF NOT EXISTS job_actuals"), "Database schema must include job_actuals table");
for (const field of validation.requiredActualFields) {
  assert(schema.includes(field), `job_actuals schema must include ${field}`);
}
for (const blocked of validation.doNotExpand) {
  assert(validation.doNotExpand.includes(blocked), `Validation plan missing blocked expansion: ${blocked}`);
}

console.log("Operational validation discipline check passed");
