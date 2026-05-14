const LEAD_ENDPOINT = "/api/ghl-lead";

const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");

function setStatus(message, type = "success") {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
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
      "Website Lead",
      "Property Refresh",
      "Ready White OS",
      "Photo Review",
      "Package Confirmation",
    ],
    pipelineStage: "New Lead",
    workflowStatus: "Scope Verification in Progress",
    automationMessages: {
      sms: "Your property refresh request is under review. Photos received. Scope verification is in progress.",
      emailSubject: "Ready White received your property refresh request",
      emailPreview: "Photos received. Scope verification is in progress, and we will confirm package fit shortly.",
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
  setStatus("Photos received. Scope verification in progress...", "success");

  const submitButton = quoteForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const result = await submitLead(buildPayload(quoteForm));
    quoteForm.reset();

    if (result.demoMode) {
      setStatus("Demo mode: property refresh request captured locally. Deploy with GHL environment variables to send it live.");
    } else {
      setStatus("Your property refresh request is under review. Package fit confirmation is next.");
    }
  } catch (error) {
    console.error(error);
    setStatus("Something went wrong. Please contact Ready White so the operations team can review the property.", "error");
  } finally {
    submitButton.disabled = false;
  }
});
