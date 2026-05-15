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
  "docs/kpi/operational-kpis.md",
  "docs/outreach/property-manager-followup.yml",
  "docs/operations/system-checks.md",
  "docs/operations/photo-estimate-flow.md",
  "config/pricing-rules.json",
  "config/vendors.example.json",
  "api/photo-estimate.js",
  "lib/dispatch.js",
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

const proof = read("docs/operations/proof-of-work.md").toLowerCase();
assert(proof.includes("before photos") && proof.includes("after photos"), "proof-of-work SOP must require before and after photos");

const lifecycle = read("docs/operations/lifecycle-system.md");
assert(lifecycle.includes("Lead") && lifecycle.includes("Vendor Scoring") && lifecycle.includes("KPI Reporting"), "lifecycle SOP must encode full operational lifecycle");

const systemChecks = read("docs/operations/system-checks.md");
assert(systemChecks.includes("00:00, 12:00, and 18:00 Eastern Time"), "system checks must document required daily cadence");
assert(systemChecks.includes("does **not** create or activate a real scheduler"), "system checks must document schedule without activating it");

const stack = JSON.parse(read("ghl-stack.example.json"));
assert(stack.pipeline.name === "Ready White Customer Jobs", "GHL stack example has wrong pipeline name");
for (const stage of requiredGhlStages) {
  assert(stack.pipeline.stages.includes(stage), `GHL stack example missing stage: ${stage}`);
}

console.log("Operational audit passed");
