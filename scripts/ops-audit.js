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
  "docs/kpi/operational-kpis.md",
  "docs/outreach/property-manager-followup.yml",
  "docs/operations/system-checks.md",
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

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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

const script = read("script.js");
const api = read("api/ghl-lead.js");
for (const tag of requiredTags) {
  assert(script.includes(tag), `script.js missing required tag: ${tag}`);
  assert(api.includes(tag), `api/ghl-lead.js missing required default tag: ${tag}`);
}

const stack = JSON.parse(read("ghl-stack.example.json"));
assert(stack.pipeline.name === "Ready White Customer Jobs", "GHL stack example has wrong pipeline name");
for (const stage of requiredGhlStages) {
  assert(stack.pipeline.stages.includes(stage), `GHL stack example missing stage: ${stage}`);
}

console.log("Operational audit passed");
