const LEAD_ENDPOINT = "/api/ghl-lead";

const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");

function setStatus(message, type = "success") {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
}


function normalizePropertyType(propertyType) {
  const normalized = String(propertyType || "").toLowerCase();

  if (normalized.includes("multi") || normalized.includes("rental")) {
    return "multifamily";
  }

  if (normalized.includes("condo") || normalized.includes("townhouse")) {
    return "condo_townhouse";
  }

  if (normalized.includes("commercial")) {
    return "commercial";
  }

  return "single_family";
}

function inferCustomerVertical(propertyType) {
  const normalized = String(propertyType || "").toLowerCase();

  if (normalized.includes("rental") || normalized.includes("multi")) {
    return "property-management";
  }

  return "investor";
}

function buildTags(formData) {
  const vertical = inferCustomerVertical(formData.get("propertyType"));

  return ["source:squarespace", `vertical:${vertical}`, "lead:new"];
}

function buildCanonicalJob(formData, photos) {
  const propertyType = formData.get("propertyType");
  const vertical = inferCustomerVertical(propertyType);

  return {
    lead_source: "source:squarespace",
    pipeline_name: "Ready White Customer Jobs",
    pipeline_stage: "New Lead",
    job_type: "make_ready_refresh",
    property_type: normalizePropertyType(propertyType),
    customer_vertical: vertical,
    occupancy_status: "unknown",
    room_count: null,
    sqft: null,
    condition_tier: "unknown",
    repair_tier: "unknown",
    timeline: "standard",
    vendor_package: "standard_turn",
    target_margin: 0.42,
    photo_policy_status: photos.length > 0 ? "partial" : "requested",
    exception_flags: [],
  };
}

function buildPayload(form) {
  const formData = new FormData(form);
  const photos = formData.getAll("photos").filter((file) => file.name);

  return {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    propertyAddress: formData.get("address"),
    propertyType: formData.get("propertyType"),
    notes: formData.get("notes"),
    tags: buildTags(formData),
    pipelineName: "Ready White Customer Jobs",
    pipelineStage: "New Lead",
    canonicalJob: buildCanonicalJob(formData, photos),
    photoFileNames: photos.map((file) => file.name),
    submittedAt: new Date().toISOString(),
  };
}

function isLocalPreview() {
  return ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

async function submitLead(payload) {
  if (isLocalPreview()) {
    console.info("Ready White lead payload", payload);
    return { demoMode: true };
  }

  const response = await fetch(LEAD_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Lead submission failed");
  }

  return response.json().catch(() => ({}));
}

quoteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Sending your property request...", "success");

  const submitButton = quoteForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const result = await submitLead(buildPayload(quoteForm));
    quoteForm.reset();

    if (result.demoMode) {
      setStatus("Demo mode: your request was captured locally. Deploy with the GHL environment variables to send it live.");
    } else {
      setStatus("Thanks! Ready White received your request and will follow up shortly.");
    }
  } catch (error) {
    console.error(error);
    setStatus("Something went wrong. Please call or email Ready White directly so we can help.", "error");
  } finally {
    submitButton.disabled = false;
  }
});
