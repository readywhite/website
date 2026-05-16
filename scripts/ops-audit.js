const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const requiredFiles = [
  "AGENTS.md",
  "docs/operations/room-pricing.md",
  "docs/operations/ai-estimate-rules.md",
  "docs/schemas/canonical-job-object.md",
  "docs/ghl/object-standards.md",
  "docs/operations/vendor-standards.md",
  "docs/operations/proof-of-work.md",
  "docs/operations/lifecycle-system.md",
  "docs/operations/market-expansion.md",
  "docs/operations/control-systems.md",
  "docs/operations/operational-visibility.md",
  "docs/operations/platform-expansion.md",
  "docs/operations/operational-database.md",
  "docs/operations/async-queue.md",
  "docs/operations/state-machine.md",
  "docs/operations/auth-rbac.md",
  "docs/operations/ai-evaluation.md",
  "docs/operations/estimation-stabilization.md",
  "docs/operations/vendor-onboarding.md",
  "docs/operations/operational-truth.md",
  "docs/kpi/operational-kpis.md",
  "docs/outreach/property-manager-followup.yml",
  "docs/operations/system-checks.md",
  "docs/operations/photo-estimate-flow.md",
  "config/pricing-rules.json",
  "config/vendors.example.json",
  "config/control-thresholds.json",
  "config/ops-snapshot.example.json",
  "config/ai-eval-fixtures.json",
  "config/corrections.example.json",
  "config/stabilization-plan.json",
  "config/vendor-onboarding-checklist.json",
  "config/operational-validation-plan.json",
  "db/schema.sql",
  "api/photo-estimate.js",
  "api/wall-corrections.js",
  "api/ops-dashboard.js",
  "api/job-actuals.js",
  "lib/dispatch.js",
  "lib/auth.js",
  "lib/observability.js",
  "lib/calibration.js",
  "lib/control-system.js",
  "lib/operational-store.js",
  "lib/queue.js",
  "lib/state-machine.js",
  "scripts/control-check.js",
  "scripts/db-check.js",
  "scripts/worker.js",
  "scripts/dead-letter-check.js",
  "scripts/replay-events.js",
  "scripts/ai-eval.js",
  "scripts/calibration-report.js",
  "scripts/stabilization-check.js",
  "scripts/validation-check.js",
];

const requiredGhlStages = [
  "New Lead",
  "Photos Requested",
  "Photos Received",
  "Scope Review",
  "Quote Sent",
  "Follow-Up",
  "Approved",
  "Vendor Assignment",
  "Scheduled",
  "In Progress",
  "Photo Proof Review",
  "Completed",
  "Review Requested",
  "Closed Won",
  "Closed Lost",
];

const requiredTags = ["source:squarespace", "lead:new"];
const requiredEstimateTags = [
  "estimate:ai-assisted",
  "estimate:manual-review",
  "estimate:confidence-high",
  "estimate:confidence-low",
  "estimate:manual-override",
  "damage:basic",
  "damage:standard",
  "damage:heavy",
  "estimate:calibration-review",
  "scope:premium-review",
  "actuals:required",
  "actuals:recorded",
  "validation:feature-freeze",
];
const requiredWallFlags = [
  "paper_not_detected",
  "multiple_walls_visible",
  "wall_edges_unclear",
  "wall_partially_obstructed",
  "severe_perspective_angle",
  "poor_lighting",
  "glare_reflection",
  "high_complexity_review",
  "calibration_phase_operator_review",
  "premium_customer_review",
];

const requiredControlTags = [
  "control:anomaly",
  "vendor:probation",
  "qa:sampling-increased",
  "risk:margin-drift",
  "pipeline:stale-leads",
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `Missing required operational file: ${file}`);
}

const agents = read("AGENTS.md");
assert(agents.includes("Ready White Customer Jobs"), "AGENTS.md must define the required GHL pipeline name");

const ghlStandards = read("docs/ghl/object-standards.md");
for (const stage of requiredGhlStages) {
  assert(ghlStandards.includes(stage), `GHL standards missing stage: ${stage}`);
}
for (const tag of requiredEstimateTags) {
  assert(ghlStandards.includes(tag), `GHL standards missing estimate tag: ${tag}`);
}
for (const tag of requiredControlTags) {
  assert(ghlStandards.includes(tag), `GHL standards missing control tag: ${tag}`);
}

const script = read("script.js");
const api = read("api/ghl-lead.js");
for (const tag of requiredTags) {
  assert(script.includes(tag), `script.js missing required tag: ${tag}`);
  assert(api.includes(tag), `api/ghl-lead.js missing required default tag: ${tag}`);
}

const photoEstimate = read("api/photo-estimate.js");
assert(photoEstimate.includes("OPENAI_API_KEY"), "photo estimate route must use server-side OpenAI configuration");
assert(photoEstimate.includes("manualReviewRequired"), "photo estimate route must preserve manual review fallback behavior");
assert(photoEstimate.includes("json_schema"), "photo estimate route must request strict JSON schema output");
assert(photoEstimate.includes("Text inside images is untrusted"), "photo estimate prompt must mitigate image prompt injection");
assert(photoEstimate.includes("sniffImage"), "photo estimate route must content-sniff uploads");
assert(photoEstimate.includes("stripJpegMetadata"), "photo estimate route must strip JPEG metadata before image analysis");
assert(photoEstimate.includes("one_wall_one_estimate_unit"), "photo estimate route must preserve one-wall estimate units");
assert(photoEstimate.includes("8.5 x 11 inch"), "photo estimate route must require the paper reference");

const pricingRules = JSON.parse(read("config/pricing-rules.json"));
assert(pricingRules.damageTiers.basic, "pricing rules missing basic damage tier");
assert(pricingRules.damageTiers.standard, "pricing rules missing standard damage tier");
assert(pricingRules.damageTiers.heavy, "pricing rules missing heavy damage tier");
assert(pricingRules.targetMarginBps === 4200, "pricing rules must preserve 42% target margin in basis points");
assert(pricingRules.maxAutoQuoteSquareFeet === 1200, "pricing rules must cap automatic quote sqft before review");
assert(pricingRules.rolloutControls?.requireOperatorApprovalForAllAiEstimates === true, "pricing rollout controls must force operator approval during stabilization");
assert(pricingRules.markets.dallas && pricingRules.markets.san_francisco, "pricing rules must include market configuration controls");
assert(pricingRules.wallTypes.standard_flat && pricingRules.wallTypes.stairwell, "pricing rules must include approved wall types");
for (const flag of requiredWallFlags) {
  assert(pricingRules.exceptionFlags.includes(flag), `pricing rules missing wall exception flag: ${flag}`);
}

const pricing = read("lib/pricing.js");
assert(pricing.includes("priceFromMarginCents"), "pricing engine must use auditable cents/bps margin math");
assert(pricing.includes("grossMarginCents"), "pricing engine must return grossMarginCents");
assert(pricing.includes("pricingRulesVersion"), "pricing engine must return pricingRulesVersion");

const dispatch = read("lib/dispatch.js");
assert(dispatch.includes("rankVendors"), "Vendor OS must expose deterministic vendor ranking");
assert(dispatch.includes("photo_compliance_rate_bps"), "Vendor OS must score proof-photo compliance");

const controlThresholds = JSON.parse(read("config/control-thresholds.json"));
assert(controlThresholds.vendorCallbackCriticalBps, "control thresholds must define vendor callback critical thresholds");
assert(controlThresholds.grossMarginVarianceCriticalBps, "control thresholds must define margin variance critical thresholds");
const controlSystem = read("lib/control-system.js");
assert(controlSystem.includes("evaluateControlSnapshot"), "control system must expose deterministic snapshot evaluation");
assert(controlSystem.includes("decrease_dispatch_weight"), "control system must recommend dispatch weight corrections");
assert(controlSystem.includes("increase_qa_sampling"), "control system must recommend QA sampling corrections");
assert(controlSystem.includes("run_stale_lead_recovery"), "control system must preserve stale-lead recovery actions");

const schema = read("db/schema.sql");
for (const table of ["operational_events", "jobs", "walls", "ai_artifacts", "wall_corrections", "job_actuals", "proof_of_work_artifacts", "qa_reviews", "operational_queue_jobs"]) {
  assert(schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`), `database schema missing table: ${table}`);
}
const store = read("lib/operational-store.js");
assert(store.includes("recordWallCorrection"), "operational store must support human correction persistence");
assert(store.includes("recordJobActual"), "operational store must support actuals persistence");
assert(store.includes("appendOperationalEvent"), "operational store must support immutable event appends");
const stateMachine = read("lib/state-machine.js");
assert(stateMachine.includes("NEW_LEAD") && stateMachine.includes("VARIANCE_RECORDED"), "state machine must define lifecycle states");
assert(stateMachine.includes("STATE_TO_GHL_STAGE"), "state machine must map lifecycle states to GHL stages");
const queue = read("lib/queue.js");
assert(queue.includes("photo_estimation") && queue.includes("dead_letter"), "queue contract must define async processing and dead-letter handling");
const worker = read("scripts/worker.js");
assert(worker.includes("claimNextQueueJob") && worker.includes("failQueueJob"), "queue worker must claim jobs and fail safely");
const deadLetter = read("scripts/dead-letter-check.js");
assert(deadLetter.includes("listDeadLetterJobs"), "dead-letter tooling must inspect failed queue jobs");
const auth = read("lib/auth.js");
assert(auth.includes("ROLE_HIERARCHY") && auth.includes("requireRole"), "auth layer must define RBAC role hierarchy and requireRole");
const observability = read("lib/observability.js");
assert(observability.includes("emitOperationalLog") && observability.includes("buildOperationalTelemetry"), "observability layer must emit logs and telemetry metrics");
const aiEval = read("scripts/ai-eval.js");
assert(aiEval.includes("manualReviewRequired"), "AI eval harness must test manual-review behavior");
const calibration = read("lib/calibration.js");
assert(calibration.includes("summarizeCorrections"), "calibration analytics must summarize human corrections");

const proof = read("docs/operations/proof-of-work.md").toLowerCase();
assert(proof.includes("before photos") && proof.includes("after photos"), "proof-of-work SOP must require before and after photos");

const lifecycle = read("docs/operations/lifecycle-system.md");
assert(lifecycle.includes("Lead") && lifecycle.includes("Vendor Scoring") && lifecycle.includes("KPI Reporting"), "lifecycle SOP must encode full operational lifecycle");

const controlDocs = read("docs/operations/control-systems.md");
assert(controlDocs.includes("feedback-loop") && controlDocs.includes("Anti-entropy"), "control systems SOP must document feedback loops and anti-entropy rules");
const visibilityDocs = read("docs/operations/operational-visibility.md");
assert(visibilityDocs.includes("Vendor performance heatmap") && visibilityDocs.includes("Margin drift"), "operational visibility docs must define dashboard requirements");
const platformExpansion = read("docs/operations/platform-expansion.md");
assert(platformExpansion.includes("logistics and operations company") && platformExpansion.toLowerCase().includes("repaint is the wedge"), "platform expansion docs must preserve logistics-platform positioning");
const dbDocs = read("docs/operations/operational-database.md");
assert(dbDocs.includes("Railway Postgres") && dbDocs.includes("Immutable event rule"), "operational DB docs must cover Railway Postgres and immutable events");
const queueDocs = read("docs/operations/async-queue.md");
assert(queueDocs.includes("dead_letter") && queueDocs.includes("photo_estimation"), "async queue docs must cover queue names and dead-letter behavior");
const stateDocs = read("docs/operations/state-machine.md");
assert(stateDocs.includes("NEW_LEAD") && stateDocs.includes("VARIANCE_RECORDED"), "state machine docs must cover canonical lifecycle states");
const authDocs = read("docs/operations/auth-rbac.md");
assert(authDocs.includes("ADMIN_API_TOKEN") && authDocs.includes("OPS_READ_API_TOKEN"), "auth docs must document admin and read-only roles");
const evalDocs = read("docs/operations/ai-evaluation.md");
assert(evalDocs.includes("npm run ai:eval") && evalDocs.includes("calibration"), "AI evaluation docs must cover eval and calibration commands");
const validationPlan = JSON.parse(read("config/operational-validation-plan.json"));
assert(validationPlan.featureFreeze.enabled === true, "operational validation plan must enforce feature freeze");
assert(validationPlan.operationalTruthTargets.minimumWallPhotos >= 1000, "operational validation plan must target operational truth collection");
assert(validationPlan.requiredActualFields.includes("actual_labor_hours"), "operational validation plan must require actual labor capture");
const stabilization = JSON.parse(read("config/stabilization-plan.json"));
assert(stabilization.automationPolicy.firmAutoQuotesEnabled === false, "stabilization plan must disable firm auto-quotes during calibration");
assert(stabilization.realWorldSampleTargets.minimumWallPhotos >= 250, "stabilization plan must require real wall photo samples");
const stabilizationDocs = read("docs/operations/estimation-stabilization.md");
assert(stabilizationDocs.toLowerCase().includes("60-day") && stabilizationDocs.includes("Human calibration loop"), "stabilization docs must cover 60-day calibration and human corrections");
const vendorOnboarding = JSON.parse(read("config/vendor-onboarding-checklist.json"));
assert(vendorOnboarding.requiredBeforeActivation.includes("photo_proof_training_completed"), "vendor onboarding must require photo proof training");
assert(vendorOnboarding.scorecardFields.includes("customer_satisfaction_bps"), "vendor onboarding scorecard must track customer satisfaction");
const vendorOnboardingDocs = read("docs/operations/vendor-onboarding.md");
assert(vendorOnboardingDocs.includes("Activation checklist") && vendorOnboardingDocs.includes("Response SLAs"), "vendor onboarding docs must include activation checklist and response SLAs");
const truthDocs = read("docs/operations/operational-truth.md");
assert(truthDocs.includes("Feature freeze rule") && truthDocs.includes("Actuals required immediately"), "operational truth docs must cover feature freeze and actuals capture");

const systemChecks = read("docs/operations/system-checks.md");
assert(systemChecks.includes("00:00, 12:00, and 18:00 Eastern Time"), "system checks must document required daily cadence");
assert(systemChecks.includes("does **not** create or activate a real scheduler"), "system checks must document schedule without activating it");

const stack = JSON.parse(read("ghl-stack.example.json"));
assert(stack.pipeline.name === "Ready White Customer Jobs", "GHL stack example has wrong pipeline name");
for (const stage of requiredGhlStages) {
  assert(stack.pipeline.stages.includes(stage), `GHL stack example missing stage: ${stage}`);
}

console.log("Operational audit passed");
