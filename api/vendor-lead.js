const HIGHLEVEL_API_BASE_URL = "https://services.leadconnectorhq.com";
const HIGHLEVEL_API_VERSION = "2021-07-28";

function getEnv(name) {
  return process.env[name] && process.env[name].trim();
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function validateVendor(vendor) {
  const requiredFields = ["name", "email", "phone"];
  const missingFields = requiredFields.filter((field) => !vendor[field]);
  return missingFields.length ? `Missing required fields: ${missingFields.join(", ")}` : null;
}

function buildVendorContactPayload(vendor, locationId) {
  return {
    locationId,
    firstName: vendor.name,
    name: vendor.companyName ? `${vendor.name} - ${vendor.companyName}` : vendor.name,
    email: vendor.email,
    phone: vendor.phone,
    source: "Ready White Vendor Network",
    tags: vendor.tags || ["source:squarespace", "source:vendor-page", "vendor:new", "service:interior-only"],
    customFields: [
      { key: "vendor_company_name", field_value: vendor.companyName },
      { key: "vendor_service_areas", field_value: vendor.serviceAreas },
      { key: "vendor_crew_size", field_value: vendor.crewSize },
      { key: "vendor_years_experience", field_value: vendor.yearsExperience },
      { key: "vendor_insurance_status", field_value: vendor.insuranceStatus },
      { key: "vendor_availability", field_value: vendor.availability },
      { key: "vendor_work_photo_names", field_value: (vendor.workPhotoFileNames || []).join(", ") },
      { key: "workflow_status", field_value: vendor.workflowStatus || "Vendor Application Received" },
    ].filter((field) => field.field_value),
  };
}

async function callHighLevel(path, body) {
  const token = getEnv("GHL_PRIVATE_INTEGRATION_TOKEN");
  if (!token) throw new Error("Missing GHL_PRIVATE_INTEGRATION_TOKEN environment variable");

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

function getContactId(contactResponse) {
  return contactResponse?.contact?.id || contactResponse?.id || contactResponse?.contactId || contactResponse?.data?.id || null;
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
    const vendor = await readRequestBody(req);
    const validationError = validateVendor(vendor);
    if (validationError) {
      sendJson(res, 400, { error: validationError });
      return;
    }

    const contact = await callHighLevel("/contacts/upsert", buildVendorContactPayload(vendor, locationId));
    sendJson(res, 200, {
      ok: true,
      contactId: getContactId(contact),
      workflowStatus: vendor.workflowStatus || "Vendor Application Received",
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 502, { error: "Unable to send vendor lead to GoHighLevel" });
  }
};
