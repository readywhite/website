const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const plan = JSON.parse(fs.readFileSync(path.join(root, "config", "stabilization-plan.json"), "utf8"));
const pricing = JSON.parse(fs.readFileSync(path.join(root, "config", "pricing-rules.json"), "utf8"));
const corrections = JSON.parse(fs.readFileSync(path.join(root, "config", "corrections.example.json"), "utf8"));
const vendorChecklist = JSON.parse(fs.readFileSync(path.join(root, "config", "vendor-onboarding-checklist.json"), "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(plan.automationPolicy.firmAutoQuotesEnabled === false, "Stabilization phase must keep firm auto-quotes disabled");
assert(pricing.rolloutControls.requireOperatorApprovalForAllAiEstimates === true, "Pricing rollout controls must force operator approval during calibration");
assert(pricing.exceptionFlags.includes(plan.automationPolicy.manualReviewFlag), "Pricing flags must include calibration manual-review flag");
assert(plan.realWorldSampleTargets.minimumWallPhotos >= 250, "Real-world sample target must require at least 250 wall photos");
assert(plan.correctionCoverageTargets.requiredFields.includes("actual_labor"), "Correction targets must capture actual labor");
assert(plan.manualReviewDiscipline.alwaysReviewFlags.includes("premium_customer_review"), "Premium customers must force manual review");
assert(vendorChecklist.requiredBeforeActivation.includes("photo_proof_training_completed"), "Vendor onboarding must require photo proof training");
assert(vendorChecklist.scorecardFields.includes("customer_satisfaction_bps"), "Vendor scorecard must track customer satisfaction");
assert(Array.isArray(corrections.corrections), "Corrections example must preserve structured correction array");

console.log("Stabilization discipline check passed");
