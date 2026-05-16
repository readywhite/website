const HIGHLEVEL_API_BASE_URL = "https://services.leadconnectorhq.com";
const HIGHLEVEL_API_VERSION = "2021-07-28";
const { validateCanonicalJob } = require("../lib/canonical-job");
const { verifySignedEstimate } = require("../lib/estimate-signing");

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
  const tags = Array.from(new Set([...(lead.tags || []), "source:squarespace", "lead:new"]));

  if (lead.estimate) {
    tags.push("estimate:ai-assisted");
  }

  if (lead.estimate?.quote?.manualReviewRequired || lead.estimate?.pricing?.manualReviewRequired) {
    tags.push("estimate:manual-review", "estimate:confidence-low");
  } else if (lead.estimate) {
    tags.push("estimate:confidence-high");
  }

  if (lead.canonicalJob?.estimate?.pricing_rules_version || lead.estimate?.audit?.pricingRulesVersion) {
    tags.push("estimate:pricing-versioned");
  }

  if (lead.estimate?.pricing?.damageTier) {
    tags.push(`damage:${lead.estimate.pricing.damageTier}`);
  }

  if (lead.market || lead.estimate?.pricing?.market || lead.canonicalJob?.market) {
    tags.push(`market:${lead.market || lead.estimate?.pricing?.market || lead.canonicalJob?.market}`);
  }

  if ((lead.estimate?.pricing?.exceptionFlags || []).includes("calibration_phase_operator_review")) {
    tags.push("estimate:calibration-review");
  }

  if ((lead.estimate?.pricing?.exceptionFlags || []).includes("premium_customer_review")) {
    tags.push("scope:premium-review");
  }

  if ((lead.estimate?.analysis?.walls || []).some((wall) => Number(wall.complexityScore) >= 0.75)) {
    tags.push("scope:high-complexity");
  }

  return {
    locationId,
    firstName,
    lastName,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    address1: lead.propertyAddress,
    source: "Ready White Website",
    tags: Array.from(new Set(tags)),
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
    monetaryValue: lead.trustedEstimate?.pricing?.priceToCustomerCents
      ? Math.round(lead.trustedEstimate.pricing.priceToCustomerCents / 100)
      : 0,
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

  const canonicalErrors = validateCanonicalJob(lead.canonicalJob || {});

  if (canonicalErrors.length > 0) {
    return canonicalErrors.join("; ");
  }

  if (lead.estimate && typeof lead.estimate !== "object") {
    return "estimate must be an object when provided";
  }

  if (lead.photoFileNames?.length && !lead.photoUrls?.length) {
    return "photoUrls are required; Ready White cannot run manual review from filenames only";
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
    const signatureResult = verifySignedEstimate(lead.estimate);
    if (!signatureResult.ok) {
      sendJson(res, 400, { error: signatureResult.error });
      return;
    }
    lead.trustedEstimate = signatureResult.trustedEstimate;
    if (lead.trustedEstimate) {
      lead.estimate = {
        ...lead.trustedEstimate,
        pricing: lead.trustedEstimate.pricing,
        quote: lead.trustedEstimate.quote,
        analysis: lead.trustedEstimate.analysis,
      };
    }

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
