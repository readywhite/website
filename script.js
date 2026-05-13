const GHL_WEBHOOK_URL = "";

const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");

function setStatus(message, type = "success") {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
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
    tags: ["Website Lead", "Property Refresh", "Interior Estimate"],
    pipelineStage: "New Lead",
    photoFileNames: photos.map((file) => file.name),
    submittedAt: new Date().toISOString(),
  };
}

async function submitLead(payload) {
  if (!GHL_WEBHOOK_URL) {
    console.info("Ready White lead payload", payload);
    return { demoMode: true };
  }

  const response = await fetch(GHL_WEBHOOK_URL, {
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
      setStatus("Demo mode: your request was captured locally. Add your GoHighLevel webhook URL in script.js to send it live.");
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
