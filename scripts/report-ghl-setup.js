const fs = require("fs");
const path = require("path");

const HIGHLEVEL_API_BASE_URL = "https://services.leadconnectorhq.com";
const HIGHLEVEL_API_VERSION = "2021-07-28";

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
const REQUIRED_WORKFLOW_SIGNALS = [
  "photos requested",
  "photos received",
  "scope review",
  "quote sent",
  "follow-up",
  "approved",
  "vendor assignment",
  "scheduled",
  "photo proof",
  "completed",
  "review requested",
];
const REQUIRED_AUTOMATION_SIGNALS = [
  "speed to lead",
  "missed call text back",
  "stale lead recovery",
  "internal notification",
  "stage movement",
  "package fit",
  "photo policy",
  "exception escalation",
  "vendor scorecard",
  "callback tracking",
  "review flywheel",
  "property manager nurture",
];

function getEnv(name) {
  return process.env[name] && process.env[name].trim();
}

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

function canonical(value = "") {
  return normalize(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  for (const key of ["pipelines", "tags", "workflows", "data", "items", "results"]) {
    if (Array.isArray(value[key])) return value[key];
  }

  return [];
}

function pickName(item) {
  return item?.name || item?.title || item?.label || item?.tag || item?.tagName || item?.workflowName || "Unnamed";
}

function pickStages(pipeline) {
  return asArray(pipeline?.stages || pipeline?.pipelineStages || pipeline?.children).map(pickName);
}

function compactValue(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  if (value === undefined || value === null || value === "") return "unknown";
  return String(value);
}

function isActiveRecord(record) {
  if (record?.archived === true || record?.deleted === true || record?.isDeleted === true) return false;

  const status = normalize(record?.status || record?.state || record?.isActive || record?.publishedStatus);

  if (["inactive", "draft", "disabled", "archived", "deleted", "false"].includes(status)) return false;
  if (["active", "published", "enabled", "live", "true"].includes(status)) return true;

  return record?.isActive === true || record?.published === true || record?.active === true || status === "";
}

function summarizePipeline(pipeline) {
  const stages = pickStages(pipeline);

  return {
    name: pickName(pipeline),
    id: pipeline?.id || pipeline?._id || "unknown",
    active: isActiveRecord(pipeline),
    status: compactValue(pipeline?.status || pipeline?.state || pipeline?.isActive || pipeline?.publishedStatus),
    stages,
  };
}

function summarizeWorkflow(workflow) {
  return {
    name: pickName(workflow),
    id: workflow?.id || workflow?._id || "unknown",
    active: isActiveRecord(workflow),
    status: compactValue(workflow?.status || workflow?.state || workflow?.isActive || workflow?.publishedStatus || workflow?.published),
  };
}

async function callHighLevel(pathname) {
  const token = getEnv("GHL_PRIVATE_INTEGRATION_TOKEN");

  if (!token) {
    throw new Error("Missing GHL_PRIVATE_INTEGRATION_TOKEN environment variable");
  }

  const response = await fetch(`${HIGHLEVEL_API_BASE_URL}${pathname}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      Version: HIGHLEVEL_API_VERSION,
    },
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body.message || body.error || `HighLevel request failed for ${pathname}`;
    throw new Error(`${message} (${response.status})`);
  }

  return body;
}

async function fetchSection(name, pathnames) {
  const candidates = Array.isArray(pathnames) ? pathnames : [pathnames];
  const errors = [];

  for (const pathname of candidates) {
    try {
      const body = await callHighLevel(pathname);
      return { name, ok: true, pathname, body, items: asArray(body) };
    } catch (error) {
      errors.push(`${pathname}: ${error.message}`);
    }
  }

  return { name, ok: false, pathname: candidates.join(" | "), error: errors.join("; "), items: [] };
}

function analyzePipelines(pipelines) {
  const pipelineSummaries = pipelines.map(summarizePipeline);
  const activePipelines = pipelineSummaries.filter((pipeline) => pipeline.active);
  const pipelineNames = activePipelines.map((pipeline) => pipeline.name);
  const readyWhitePipeline = pipelineSummaries.find((pipeline) => normalize(pipeline.name) === normalize(REQUIRED_PIPELINE));
  const stages = readyWhitePipeline ? readyWhitePipeline.stages : [];
  const missingStages = REQUIRED_STAGES.filter((stage) => !stages.some((existing) => normalize(existing) === normalize(stage)));
  const extraStages = stages.filter((stage) => !REQUIRED_STAGES.some((required) => normalize(required) === normalize(stage)));
  const stageOrderIssues = REQUIRED_STAGES
    .map((stage, index) => ({ stage, expectedPosition: index + 1, actualPosition: stages.findIndex((existing) => normalize(existing) === normalize(stage)) + 1 }))
    .filter((entry) => entry.actualPosition > 0 && entry.actualPosition !== entry.expectedPosition);

  return {
    pipelineNames,
    pipelineSummaries,
    activePipelines,
    readyWhitePipelineFound: Boolean(readyWhitePipeline),
    readyWhitePipelineActive: Boolean(readyWhitePipeline?.active),
    stages,
    missingStages,
    extraStages,
    stageOrderIssues,
  };
}

function analyzeTags(tags) {
  const tagNames = tags.map(pickName);
  const missingTags = REQUIRED_TAGS.filter((tag) => !tagNames.some((existing) => normalize(existing) === normalize(tag)));

  return { tagNames, missingTags };
}

function analyzeWorkflows(workflows) {
  const workflowSummaries = workflows.map(summarizeWorkflow);
  const activeWorkflows = workflowSummaries.filter((workflow) => workflow.active);
  const workflowNames = workflowSummaries.map((workflow) => workflow.name);
  const searchableNames = workflowNames.map(canonical);
  const missingSignals = REQUIRED_WORKFLOW_SIGNALS.filter((signal) => !searchableNames.some((name) => name.includes(canonical(signal))));
  const automationSignals = REQUIRED_AUTOMATION_SIGNALS.map((signal) => ({
    signal,
    covered: searchableNames.some((name) => name.includes(canonical(signal))),
  }));
  const missingAutomationSignals = automationSignals.filter((signal) => !signal.covered).map((signal) => signal.signal);

  return {
    workflowNames,
    workflowSummaries,
    activeWorkflowNames: activeWorkflows.map((workflow) => workflow.name),
    missingSignals,
    automationSignals,
    missingAutomationSignals,
  };
}

function buildRecommendations(pipelineAnalysis, tagAnalysis, workflowAnalysis, fetchResults) {
  const recommendations = [];

  if (!pipelineAnalysis.readyWhitePipelineFound) {
    recommendations.push("Create the Ready White Customer Jobs pipeline exactly as defined in ghl-stack.example.json.");
  }

  if (pipelineAnalysis.missingStages.length > 0) {
    recommendations.push(`Add missing pipeline stages: ${pipelineAnalysis.missingStages.join(", ")}.`);
  }

  if (pipelineAnalysis.extraStages.length > 0) {
    recommendations.push(`Review non-standard pipeline stages for drift: ${pipelineAnalysis.extraStages.join(", ")}.`);
  }

  if (pipelineAnalysis.stageOrderIssues.length > 0) {
    recommendations.push(`Reorder Ready White Customer Jobs stages to preserve deterministic handoffs: ${pipelineAnalysis.stageOrderIssues.map((issue) => `${issue.stage} should be #${issue.expectedPosition}, currently #${issue.actualPosition}`).join("; ")}.`);
  }

  if (pipelineAnalysis.readyWhitePipelineFound && !pipelineAnalysis.readyWhitePipelineActive) {
    recommendations.push("Reactivate or replace the Ready White Customer Jobs pipeline; inactive CRM lanes break speed-to-lead and pipeline integrity.");
  }

  if (tagAnalysis.missingTags.length > 0) {
    recommendations.push(`Create or standardize missing tags: ${tagAnalysis.missingTags.join(", ")}.`);
  }

  if (workflowAnalysis.missingSignals.length > 0) {
    recommendations.push(`Add or rename workflows/actions for stage coverage: ${workflowAnalysis.missingSignals.join(", ")}.`);
  }

  if (workflowAnalysis.missingAutomationSignals.length > 0) {
    recommendations.push(`Add standardized automation coverage for: ${workflowAnalysis.missingAutomationSignals.join(", ")}.`);
  }

  for (const result of fetchResults.filter((item) => !item.ok)) {
    recommendations.push(`Resolve API access for ${result.name}: ${result.error}.`);
  }

  recommendations.push("Confirm customer photo policy is represented in the Photos Requested workflow message.");
  recommendations.push("Confirm missed-call text-back and stale-lead recovery automations exist for speed-to-lead and close-rate protection.");
  recommendations.push("Confirm vendor assignment enforces preset package buy rates, response SLAs, photo proof, callback tracking, and exception escalation.");

  return recommendations;
}

function markdownList(items, fallback = "None found") {
  if (!items.length) return `- ${fallback}`;
  return items.map((item) => `- ${item}`).join("\n");
}

function pipelineList(pipelines) {
  if (!pipelines.length) return "- No active pipelines returned by API";

  return pipelines
    .map((pipeline) => [
      `- ${pipeline.name} (${pipeline.stages.length} stages, status: ${pipeline.status}, id: ${pipeline.id})`,
      ...pipeline.stages.map((stage, index) => `  ${index + 1}. ${stage}`),
    ].join("\n"))
    .join("\n");
}

function workflowList(workflows) {
  if (!workflows.length) return "- No workflows returned by API";

  return workflows
    .map((workflow) => `- ${workflow.name} (active: ${workflow.active ? "yes" : "no"}, status: ${workflow.status}, id: ${workflow.id})`)
    .join("\n");
}

function renderReport({ locationId, generatedAt, fetchResults, pipelineAnalysis, tagAnalysis, workflowAnalysis, recommendations }) {
  return `# Ready White GoHighLevel Setup Report

Generated: ${generatedAt}
Location ID: ${locationId}

## API collection status

${fetchResults.map((result) => `- ${result.name}: ${result.ok ? `OK (${result.items.length} records)` : `FAILED — ${result.error}`}`).join("\n")}

## Active pipelines and stages

### Active pipelines and stages returned by API

${pipelineList(pipelineAnalysis.activePipelines)}

### Required pipeline

- Required name: ${REQUIRED_PIPELINE}
- Found: ${pipelineAnalysis.readyWhitePipelineFound ? "yes" : "no"}
- Active: ${pipelineAnalysis.readyWhitePipelineActive ? "yes" : "no"}

### Required stages

${markdownList(REQUIRED_STAGES)}

### Current Ready White stages

${markdownList(pipelineAnalysis.stages, "Ready White Customer Jobs pipeline not found or has no stages returned")}

### Missing stages

${markdownList(pipelineAnalysis.missingStages, "No missing required stages")}

### Non-standard stages to review

${markdownList(pipelineAnalysis.extraStages, "No non-standard stages detected")}

### Stage order inconsistencies

${markdownList(pipelineAnalysis.stageOrderIssues.map((issue) => `${issue.stage}: expected #${issue.expectedPosition}, actual #${issue.actualPosition}`), "No stage order inconsistencies detected")}

## Tags

### Current tags returned by API

${markdownList(tagAnalysis.tagNames, "No tags returned by API")}

### Required standardized tags

${markdownList(REQUIRED_TAGS)}

### Missing tags

${markdownList(tagAnalysis.missingTags, "No missing required tags")}

## Workflows and automations

### Workflows returned by API

${workflowList(workflowAnalysis.workflowSummaries)}

### Active/published workflows inferred from API metadata

${markdownList(workflowAnalysis.activeWorkflowNames, "No active/published workflows inferred from API metadata")}

### Missing workflow signals

${markdownList(workflowAnalysis.missingSignals, "No missing workflow signals inferred from workflow names")}

### Automation coverage checklist

${workflowAnalysis.automationSignals.map((signal) => `- ${signal.covered ? "OK" : "MISSING"}: ${signal.signal}`).join("\n")}

> Note: HighLevel workflow API metadata may not expose every internal action/branch. Confirm SMS, email, internal notifications, stage moves, stale-lead recovery, missed-call text-back, and review request steps directly inside GHL.

## Recommended changes

${markdownList(recommendations)}

## Disciplined standardized workflow model

1. New Lead
2. Photos Requested
3. Photos Received
4. Scope Review
5. Quote Sent
6. Follow-Up
7. Approved
8. Vendor Assignment
9. Scheduled
10. In Progress
11. Photo Proof Review
12. Completed
13. Review Requested
14. Closed Won
15. Closed Lost

## Operational impact

- ROI: reduces leakage by enforcing follow-up, quote approval, review request, and stale-lead recovery.
- Operational impact: improves handoff clarity from intake to vendor assignment and completion proof.
- Scalability impact: preserves package-based quoting, standard size bands, and repeatable PM/investor workflows.
- Risk reduction: prevents scope drift through photo policy, exception escalation, callback tracking, and deterministic daily systems checks at 00:00, 12:00, and 18:00 EST.
`;
}

async function main() {
  const locationId = getEnv("GHL_LOCATION_ID");

  if (!locationId) {
    throw new Error("Missing GHL_LOCATION_ID environment variable");
  }

  const query = `locationId=${encodeURIComponent(locationId)}`;
  const fetchResults = await Promise.all([
    fetchSection("Pipelines", [`/opportunities/pipelines?${query}`, "/opportunities/pipelines"]),
    fetchSection("Tags", `/locations/${encodeURIComponent(locationId)}/tags`),
    fetchSection("Workflows", [`/workflows/?${query}`, "/workflows/"]),
  ]);

  const pipelines = fetchResults.find((result) => result.name === "Pipelines")?.items || [];
  const tags = fetchResults.find((result) => result.name === "Tags")?.items || [];
  const workflows = fetchResults.find((result) => result.name === "Workflows")?.items || [];
  const pipelineAnalysis = analyzePipelines(pipelines);
  const tagAnalysis = analyzeTags(tags);
  const workflowAnalysis = analyzeWorkflows(workflows);
  const recommendations = buildRecommendations(pipelineAnalysis, tagAnalysis, workflowAnalysis, fetchResults);
  const report = renderReport({
    locationId,
    generatedAt: new Date().toISOString(),
    fetchResults,
    pipelineAnalysis,
    tagAnalysis,
    workflowAnalysis,
    recommendations,
  });

  const outputPath = getEnv("GHL_REPORT_OUTPUT");

  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
    console.log(`Report written to ${outputPath}`);
  } else {
    console.log(report);
  }
}

main().catch((error) => {
  console.error(`Failed to generate GHL setup report: ${error.message}`);
  process.exit(1);
});
