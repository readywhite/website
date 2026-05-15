const { readFileSync } = require("fs");
const { spawnSync } = require("child_process");

const REQUIRED_PIPELINE = "Ready White Customer Jobs";
const REQUIRED_STAGES = [
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
const REQUIRED_TAGS = [
  "source:squarespace",
  "vertical:property-management",
  "vertical:investor",
  "timeline:asap",
  "vacant:true",
  "lead:new",
  "lead:quoted",
  "lead:won",
];
const PHOTO_POLICY_TERMS = [
  "one wide photo of each room",
  "one photo of the worst wall in each room",
  "ceilings",
  "trim",
  "stains",
  "peeling paint",
  "water damage",
  "smoke damage",
  "holes",
  "heavy prep areas",
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function read(path) {
  return readFileSync(path, "utf8");
}

function assertIncludes(fileText, expected, label) {
  if (fileText.includes(expected)) {
    pass(label);
  } else {
    fail(`${label} is missing '${expected}'`);
  }
}

function runSyntaxChecks() {
  const result = spawnSync(
    process.execPath,
    ["--check", "server.js"],
    { encoding: "utf8" }
  );

  if (result.status === 0) {
    pass("server.js syntax check");
  } else {
    fail(result.stderr || "server.js syntax check failed");
  }

  for (const file of ["script.js", "api/ghl-lead.js", "scripts/audit-operational-stack.js"]) {
    const check = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (check.status === 0) {
      pass(`${file} syntax check`);
    } else {
      fail(check.stderr || `${file} syntax check failed`);
    }
  }
}

async function checkRailwayHealth() {
  const healthUrl = process.env.RAILWAY_HEALTH_URL;

  if (!healthUrl) {
    console.warn("WARN: RAILWAY_HEALTH_URL not set; skipping live Railway health endpoint check.");
    return;
  }

  const response = await fetch(healthUrl, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    fail(`Railway health endpoint returned HTTP ${response.status}`);
    return;
  }

  const body = await response.json().catch(() => ({}));

  if (body.ok === true) {
    pass("Railway health endpoint returned ok=true");
  } else {
    fail("Railway health endpoint did not return ok=true");
  }
}

function checkEnvironment() {
  for (const name of ["GHL_PRIVATE_INTEGRATION_TOKEN", "GHL_LOCATION_ID"]) {
    if (process.env[name]) {
      pass(`${name} is configured`);
    } else {
      console.warn(`WARN: ${name} not set; live GHL submissions will not work in this environment.`);
    }
  }

  const hasPipeline = Boolean(process.env.GHL_PIPELINE_ID);
  const hasStage = Boolean(process.env.GHL_PIPELINE_STAGE_ID);

  if (hasPipeline && hasStage) {
    pass("GHL opportunity environment variables are configured");
  } else {
    console.warn("WARN: GHL_PIPELINE_ID and GHL_PIPELINE_STAGE_ID should both be set to create opportunities.");
  }
}

async function main() {
  const operations = read("config/ready-white-operations.yaml");
  const ghlStack = read("ghl-stack.example.json");
  const outreach = read("config/outreach.yaml");
  const docs = read("docs/OPERATIONS.md");

  assertIncludes(operations, REQUIRED_PIPELINE, "operations pipeline standard");
  assertIncludes(ghlStack, REQUIRED_PIPELINE, "GHL stack pipeline standard");

  for (const stage of REQUIRED_STAGES) {
    assertIncludes(operations, stage, `operations stage '${stage}'`);
    assertIncludes(ghlStack, stage, `GHL stack stage '${stage}'`);
  }

  for (const tag of REQUIRED_TAGS) {
    assertIncludes(operations, tag, `operations tag '${tag}'`);
    assertIncludes(ghlStack, tag, `GHL stack tag '${tag}'`);
  }

  for (const term of PHOTO_POLICY_TERMS) {
    assertIncludes(operations, term, `photo policy term '${term}'`);
    assertIncludes(docs, term, `operations doc photo policy term '${term}'`);
  }

  assertIncludes(outreach, "stale-lead recovery", "outreach stale-lead recovery action");
  assertIncludes(outreach, "review request after completion", "outreach review flywheel action");

  checkEnvironment();
  runSyntaxChecks();
  await checkRailwayHealth();

  if (process.exitCode) {
    process.exit(process.exitCode);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
