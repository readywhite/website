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

const DEFAULT_CONTACT_TAGS = ["source:squarespace", "lead:new"];

function compact(value) {
  return Array.isArray(value) ? value.filter(Boolean) : value;
}

function firstPresent(source, keys) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return source[key];
    }
  }

  return "";
}

function parseBooleanLike(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "yes", "1", "vacant"].includes(value.trim().toLowerCase());
  }

  return false;
}

function parseList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getDefaultTags() {
  const configuredTags = parseList(getEnv("GHL_CONTACT_TAGS"));
  return configuredTags.length > 0 ? configuredTags : DEFAULT_CONTACT_TAGS;
}

function normalizeLead(rawLead) {
  const fullName = firstPresent(rawLead, ["name", "fullName", "full_name"]);
  const firstName = firstPresent(rawLead, ["firstName", "first_name"]);
  const lastName = firstPresent(rawLead, ["lastName", "last_name"]);
  const name = fullName || compact([firstName, lastName]).join(" ");
  const vacant = parseBooleanLike(firstPresent(rawLead, ["vacant", "isVacant", "is_vacant"]));
  const timeline = firstPresent(rawLead, ["timeline"]);
  const rawTags = parseList(rawLead.tags);
  const tags = Array.from(
    new Set([
      ...getDefaultTags(),
      ...rawTags,
      timeline && timeline.toLowerCase() === "asap" ? "timeline:asap" : "",
      vacant ? "vacant:true" : "",
    ].filter(Boolean))
  );

  return {
    ...rawLead,
    name,
    email: firstPresent(rawLead, ["email"]),
    phone: firstPresent(rawLead, ["phone"]),
    companyName: firstPresent(rawLead, ["companyName", "company_name"]),
    propertyAddress: firstPresent(rawLead, ["propertyAddress", "property_address", "address"]),
    propertyType: firstPresent(rawLead, ["propertyType", "property_type"]),
    serviceNeeded: firstPresent(rawLead, ["serviceNeeded", "service_needed", "service"]),
    timeline,
    vacant,
    notes: firstPresent(rawLead, ["notes", "projectNotes", "project_notes"]),
    photoFileNames: parseList(firstPresent(rawLead, ["photoFileNames", "photo_file_names"])),
    photoUrls: parseList(firstPresent(rawLead, ["photoUrls", "photo_urls", "photos"])),
    tags,
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
    companyName: lead.companyName || undefined,
    source: "Ready White Website",
    tags: lead.tags,
    customFields: [
      { key: "property_type", field_value: lead.propertyType },
      { key: "service_needed", field_value: lead.serviceNeeded },
      { key: "timeline", field_value: lead.timeline },
      { key: "vacant", field_value: lead.vacant ? "true" : "false" },
      { key: "project_notes", field_value: lead.notes },
      { key: "photo_file_names", field_value: lead.photoFileNames.join(", ") },
      { key: "photo_urls", field_value: lead.photoUrls.join(", ") },
    ].filter((field) => field.field_value !== undefined && field.field_value !== ""),
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
    const lead = normalizeLead(await readRequestBody(req));
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
