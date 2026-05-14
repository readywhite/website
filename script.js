const LEAD_ENDPOINT = "/api/ghl-lead";

const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");

function setStatus(message, type = "success") {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
}


function propertyTypeTag(propertyType = "") {
  const value = propertyType.toLowerCase();

  if (value.includes("rental") || value.includes("multifamily")) {
    return "vertical:property-management";
  }

  if (value.includes("investment")) {
    return "vertical:investor";
  }

  return null;
}

function timelineTag(timeline = "") {
  return timeline.toLowerCase().includes("asap") ? "timeline:asap" : null;
}

function occupiedStatusTag(status = "") {
  return status.toLowerCase() === "vacant" ? "vacant:true" : null;
}

function buildPayload(form) {
  const formData = new FormData(form);
  const photos = formData.getAll("photos").filter((file) => file.name);
  const firstName = formData.get("firstName");
  const packageInterest = formData.get("packageInterest") || "Package fit review needed";

  return {
    firstName,
    name: firstName,
    email: formData.get("email"),
    phone: formData.get("phone"),
    propertyAddress: formData.get("propertyAddress"),
    propertyType: formData.get("propertyType"),
    occupiedStatus: formData.get("occupiedStatus"),
    desiredTimeline: formData.get("desiredTimeline"),
    packageInterest,
    notes: formData.get("notes"),
    tags: [
      "source:squarespace",
      "lead:new",
      propertyTypeTag(formData.get("propertyType")),
      timelineTag(formData.get("desiredTimeline")),
      occupiedStatusTag(formData.get("occupiedStatus")),
    ].filter(Boolean),
    pipelineName: "Ready White Customer Jobs",
    pipelineStage: "New Lead",
    workflowStatus: "Photos Requested",
    automationMessages: {
      sms: "Your property refresh request is under review. Please upload 1 wide photo of each room and 1 photo of the worst wall in each room.",
      emailSubject: "Ready White received your property refresh request",
      emailPreview: "Photos requested. Scope review starts after we receive room photos, worst-wall photos, and any damage/prep photos.",
    },
    photoFileNames: photos.map((file) => file.name),
    submittedAt: new Date().toISOString(),
  };
}

function isLocalPreview() {
  return ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

async function submitLead(payload) {
  if (isLocalPreview()) {
    console.info("Ready White operational lead payload", payload);
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
  setStatus("Property refresh request received. Photo requirements and scope review are next...", "success");

  const submitButton = quoteForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const result = await submitLead(buildPayload(quoteForm));
    quoteForm.reset();

    if (result.demoMode) {
      setStatus("Demo mode: property refresh request captured locally. Deploy with GHL environment variables to send it live.");
    } else {
      setStatus("Your property refresh request is under review. Photos requested and scope review are next.");
    }
  } catch (error) {
    console.error(error);
    setStatus("Something went wrong. Please contact Ready White so the operations team can review the property.", "error");
  } finally {
    submitButton.disabled = false;
  }
});
