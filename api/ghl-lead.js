const HIGHLEVEL_API_BASE_URL = "https://services.leadconnectorhq.com";
const HIGHLEVEL_API_VERSION = "2021-07-28";
const DEFAULT_PIPELINE_NAME = "Ready White Customer Jobs";
const DEFAULT_PIPELINE_STAGE_NAME = "New Lead";
const resolvedStageCache = new Map();

function getEnv(name) {
  return process.env[name] && process.env[name].trim();
}

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  for (const key of ["pipelines", "stages", "pipelineStages", "data", "items", "results"]) {
    if (Array.isArray(value[key])) return value[key];
  }

  return [];
}

function pickName(item) {
  return item?.name || item?.title || item?.label || item?.stageName || "";
}

function pickId(item) {
  return item?.id || item?._id || item?.pipelineId || item?.stageId || null;
}

function buildContactPayload(lead, locationId) {
  const firstName = lead.firstName || lead.name || "Property";
  const packageInterest = lead.packageInterest || "Package fit review needed";

  return {
    locationId,
    firstName,
    name: firstName,
    email: lead.email,
    phone: lead.phone,
    address1: lead.propertyAddress,
    source: "Ready White Property Refresh OS",
    tags: lead.tags || [
      "source:squarespace",
      "lead:new",
    ],
    customFields: [
      { key: "property_type", field_value: lead.propertyType },
      { key: "occupied_status", field_value: lead.occupiedStatus },
      { key: "desired_timeline", field_value: lead.desiredTimeline },
      { key: "package_interest", field_value: packageInterest },
      { key: "pipeline_name", field_value: lead.pipelineName || DEFAULT_PIPELINE_NAME },
      { key: "workflow_status", field_value: lead.workflowStatus || "Photos Requested" },
      { key: "photo_file_names", field_value: (lead.photoFileNames || []).join(", ") },
      { key: "operational_notes", field_value: lead.notes || "" },
    ].filter((field) => field.field_value),
  };
}

function getContactId(contactResponse) {
  return (
    contactResponse?.contact?.id ||
    contactResponse?.id ||
    contactResponse?.contactId ||
    contactResponse?.data?.id ||
    null
  );
}

async function resolvePipelineStageId(locationId, pipelineId) {
  const configuredStageId = getEnv("GHL_PIPELINE_STAGE_ID");

  if (configuredStageId) return configuredStageId;
  if (!pipelineId) return null;

  const requiredStageName = getEnv("GHL_PIPELINE_STAGE_NAME") || DEFAULT_PIPELINE_STAGE_NAME;
  const cacheKey = `${locationId}:${pipelineId}:${requiredStageName}`;

  if (resolvedStageCache.has(cacheKey)) {
    return resolvedStageCache.get(cacheKey);
  }

  const pipelinesResponse = await callHighLevel("/opportunities/pipelines", {
    method: "GET",
    query: { locationId },
  });
  const pipelines = asArray(pipelinesResponse);
  const pipeline = pipelines.find((item) => pickId(item) === pipelineId || normalize(pickName(item)) === normalize(DEFAULT_PIPELINE_NAME));
  const stages = asArray(pipeline?.stages || pipeline?.pipelineStages || pipeline?.children);
  const stage = stages.find((item) => normalize(pickName(item)) === normalize(requiredStageName));

  if (!stage) {
    throw new Error(`Unable to resolve ${requiredStageName} stage for pipeline ${pipelineId}`);
  }

  const stageId = pickId(stage);

  if (!stageId) {
    throw new Error(`Resolved ${requiredStageName} stage did not include an ID`);
  }

  resolvedStageCache.set(cacheKey, stageId);
  return stageId;
}

async function buildOpportunityPayload(lead, contactId, locationId) {
  const pipelineId = getEnv("GHL_PIPELINE_ID");

  if (!pipelineId || !contactId) {
    return null;
  }

  const pipelineStageId = await resolvePipelineStageId(locationId, pipelineId);

  if (!pipelineStageId) {
    return null;
  }

  return {
    pipelineId,
    pipelineStageId,
    locationId,
    contactId,
    name: `${lead.firstName || lead.name || "Website lead"} - ${lead.packageInterest || "Property Refresh Review"}`,
    source: "Ready White Property Refresh OS",
    status: "open",
    monetaryValue: 0,
  };
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function validateLead(lead) {
  const requiredFields = ["firstName", "email", "phone", "propertyAddress", "propertyType", "occupiedStatus", "desiredTimeline"];
  const missingFields = requiredFields.filter((field) => !lead[field]);

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(", ")}`;
  }

  return null;
}

async function callHighLevel(path, options = {}) {
  const token = getEnv("GHL_PRIVATE_INTEGRATION_TOKEN");

  if (!token) {
    throw new Error("Missing GHL_PRIVATE_INTEGRATION_TOKEN environment variable");
  }

  const method = options.method || "POST";
  const query = options.query ? `?${new URLSearchParams(options.query).toString()}` : "";
  const requestOptions = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Version: HIGHLEVEL_API_VERSION,
    },
  };

  if (method !== "GET") {
    requestOptions.body = JSON.stringify(options.body || options);
  }

  const response = await fetch(`${HIGHLEVEL_API_BASE_URL}${path}${query}`, requestOptions);

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = responseBody.message || responseBody.error || "HighLevel API request failed";
    throw new Error(`${message} (${response.status})`);
  }

  return responseBody;
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const locationId = getEnv("GHL_LOCATION_ID");

  if (!locationId) {
    sendJson(res, 500, { error: "Missing GHL_LOCATION_ID environment variable" });
    return;
  }

  try {
    const lead = await readRequestBody(req);
    const validationError = validateLead(lead);

    if (validationError) {
      sendJson(res, 400, { error: validationError });
      return;
    }

    const contact = await callHighLevel("/contacts/upsert", { body: buildContactPayload(lead, locationId) });
    const contactId = getContactId(contact);
    const opportunityPayload = await buildOpportunityPayload(lead, contactId, locationId);
    const opportunity = opportunityPayload
      ? await callHighLevel("/opportunities/", { body: opportunityPayload })
      : null;

    sendJson(res, 200, {
      ok: true,
      contactId,
      opportunityCreated: Boolean(opportunity),
      opportunityId: opportunity?.opportunity?.id || opportunity?.id || null,
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 502, { error: "Unable to send lead to GoHighLevel" });
  }
};
