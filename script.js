function getConfiguredApiBaseUrl() {
  const script = document.currentScript || document.querySelector("script[data-readywhite-api-base]");
  const configured = window.READYWHITE_API_BASE_URL || script?.dataset?.readywhiteApiBase || "";
  return String(configured).trim().replace(/\/$/, "");
}

const READYWHITE_API_BASE_URL = getConfiguredApiBaseUrl();
const CUSTOMER_LEAD_ENDPOINT = `${READYWHITE_API_BASE_URL}/api/ghl-lead`;
const VENDOR_LEAD_ENDPOINT = `${READYWHITE_API_BASE_URL}/api/vendor-lead`;

function setStatus(element, message, type = "success") {
  if (!element) return;
  element.textContent = message;
  element.className = `form-status ${type}`;
}

function fileNames(formData, key) {
  return formData.getAll(key).filter((file) => file && file.name).map((file) => file.name);
}

function propertyTypeTag(propertyType = "") {
  const value = String(propertyType).toLowerCase();

  if (value.includes("apartment") || value.includes("rental") || value.includes("multifamily") || value.includes("property manager")) {
    return "vertical:property-management";
  }

  if (value.includes("investment") || value.includes("investor")) {
    return "vertical:investor";
  }

  return null;
}

function timelineTag(timeline = "") {
  return String(timeline).toLowerCase().includes("asap") ? "timeline:asap" : null;
}

function occupiedStatusTag(status = "") {
  return String(status).toLowerCase() === "vacant" ? "vacant:true" : null;
}

function buildCustomerPayload(form) {
  const formData = new FormData(form);
  const firstName = formData.get("firstName") || formData.get("name");
  const propertyType = formData.get("propertyType");
  const desiredTimeline = formData.get("desiredTimeline") || formData.get("requestedTimeline");
  const occupiedStatus = formData.get("occupiedStatus");

  return {
    firstName,
    name: firstName,
    email: formData.get("email"),
    phone: formData.get("phone"),
    propertyAddress: formData.get("propertyAddress"),
    propertyType,
    numberOfRooms: formData.get("numberOfRooms"),
    occupiedStatus,
    desiredTimeline,
    packageInterest: formData.get("packageInterest") || "Package fit review needed",
    serviceScope: "Interior only",
    notes: formData.get("notes"),
    tags: [
      "source:squarespace",
      "lead:new",
      "service:interior-only",
      propertyTypeTag(propertyType),
      timelineTag(desiredTimeline),
      occupiedStatusTag(occupiedStatus),
    ].filter(Boolean),
    pipelineName: "Ready White Customer Jobs",
    pipelineStage: "New Lead",
    workflowStatus: "Photos Requested",
    automationMessages: {
      sms: "Your property refresh request is under review. Please upload 1 wide photo of each room and 1 photo of the worst wall in each room.",
      emailSubject: "Ready White received your property refresh request",
      emailPreview: "Photos requested. Scope review starts after we receive room photos, worst-wall photos, and any damage/prep photos.",
    },
    photoFileNames: fileNames(formData, "photos"),
    submittedAt: new Date().toISOString(),
  };
}

function buildVendorPayload(form) {
  const formData = new FormData(form);

  return {
    name: formData.get("name"),
    companyName: formData.get("companyName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    serviceAreas: formData.get("serviceAreas"),
    crewSize: formData.get("crewSize"),
    yearsExperience: formData.get("yearsExperience"),
    insuranceStatus: formData.get("insuranceStatus"),
    availability: formData.get("availability"),
    serviceScope: "Interior only vendor network",
    tags: ["source:squarespace", "source:vendor-page", "vendor:new", "service:interior-only"],
    workflowStatus: "Vendor Application Received",
    workPhotoFileNames: fileNames(formData, "workPhotos"),
    submittedAt: new Date().toISOString(),
  };
}

function isLocalPreview() {
  return ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

async function postJson(endpoint, payload) {
  if (isLocalPreview()) {
    console.info("Ready White operational payload", endpoint, payload);
    return { demoMode: true };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`${endpoint} submission failed`);
  }

  return response.json().catch(() => ({}));
}

function attachCustomerForm() {
  const quoteForm = document.querySelector("#quote-form");
  if (!quoteForm) return;

  const formStatus = document.querySelector("#form-status");
  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(formStatus, "Property refresh request received. Photo requirements and scope review are next...", "success");

    const submitButton = quoteForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const result = await postJson(CUSTOMER_LEAD_ENDPOINT, buildCustomerPayload(quoteForm));
      quoteForm.reset();
      setStatus(
        formStatus,
        result.demoMode
          ? "Demo mode: property refresh request captured locally. Deploy with GHL environment variables to send it live."
          : "Your property refresh request is under review. Photos requested and scope review are next."
      );
    } catch (error) {
      console.error(error);
      setStatus(formStatus, "Something went wrong. Please contact Ready White so the operations team can review the property.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function attachVendorForm() {
  const vendorForm = document.querySelector("#vendor-form");
  if (!vendorForm) return;

  const status = document.querySelector("#vendor-form-status");
  vendorForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(status, "Vendor application received. Routing to operations review...", "success");

    const submitButton = vendorForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const result = await postJson(VENDOR_LEAD_ENDPOINT, buildVendorPayload(vendorForm));
      vendorForm.reset();
      setStatus(
        status,
        result.demoMode
          ? "Demo mode: vendor application captured locally. Deploy with GHL environment variables to send it live."
          : "Vendor application received. Ready White operations will review service areas, capacity, insurance, and photo proof standards."
      );
    } catch (error) {
      console.error(error);
      setStatus(status, "Vendor application failed. Please contact Ready White operations.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

attachCustomerForm();
attachVendorForm();
