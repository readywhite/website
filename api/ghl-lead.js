const HIGHLEVEL_API_BASE_URL = "https://services.leadconnectorhq.com";
const HIGHLEVEL_API_VERSION = "2021-07-28";

function getEnv(name) {
  return process.env[name] && process.env[name].trim();
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
      "Website Lead",
      "Property Refresh",
      "Ready White OS",
      "Photo Review",
      "Package Confirmation",
    ],
    customFields: [
      { key: "property_type", field_value: lead.propertyType },
      { key: "occupied_status", field_value: lead.occupiedStatus },
      { key: "desired_timeline", field_value: lead.desiredTimeline },
      { key: "package_interest", field_value: packageInterest },
      { key: "workflow_status", field_value: lead.workflowStatus || "Scope Verification in Progress" },
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

function buildOpportunityPayload(lead, contactId, locationId) {
  const pipelineId = getEnv("GHL_PIPELINE_ID");
  const pipelineStageId = getEnv("GHL_PIPELINE_STAGE_ID");

  if (!pipelineId || !pipelineStageId || !contactId) {
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

async function callHighLevel(path, body) {
  const token = getEnv("GHL_PRIVATE_INTEGRATION_TOKEN");

  if (!token) {
    throw new Error("Missing GHL_PRIVATE_INTEGRATION_TOKEN environment variable");
  }

  const response = await fetch(`${HIGHLEVEL_API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Version: HIGHLEVEL_API_VERSION,
    },
    body: JSON.stringify(body),
  });

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

    const contact = await callHighLevel("/contacts/upsert", buildContactPayload(lead, locationId));
    const contactId = getContactId(contact);
    const opportunityPayload = buildOpportunityPayload(lead, contactId, locationId);
    const opportunity = opportunityPayload
      ? await callHighLevel("/opportunities/", opportunityPayload)
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
