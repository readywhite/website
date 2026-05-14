const HIGHLEVEL_API_BASE_URL = "https://services.leadconnectorhq.com";
const HIGHLEVEL_API_VERSION = "2021-07-28";

function getEnv(name) {
  return process.env[name] && process.env[name].trim();
}

function parseName(fullName = "") {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function buildContactPayload(lead, locationId) {
  const { firstName, lastName } = parseName(lead.name);

  return {
    locationId,
    firstName,
    lastName,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    address1: lead.propertyAddress,
    source: "Ready White Website",
    tags: lead.tags || ["Website Lead", "Property Refresh", "Interior Estimate"],
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
    name: `${lead.name || "Website lead"} - Property Quote`,
    source: "Ready White Website",
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
  const requiredFields = ["name", "email", "phone", "propertyAddress", "propertyType"];
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
