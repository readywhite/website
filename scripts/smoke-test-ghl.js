const target = process.env.READYWHITE_BASE_URL || process.argv[2];

if (!target) {
  console.error("Usage: READYWHITE_BASE_URL=https://your-domain npm run smoke:ghl");
  process.exit(1);
}

const baseUrl = target.replace(/\/$/, "");

async function requestJson(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json().catch(() => ({}));

  return { response, body };
}

async function main() {
  console.log(`Running Ready White stack smoke test against ${baseUrl}`);

  const health = await requestJson("/health");
  console.log("/health", health.response.status, health.body);

  if (!health.response.ok) {
    throw new Error("Healthcheck failed");
  }

  const readiness = await requestJson("/readiness");
  console.log("/readiness", readiness.response.status, readiness.body);

  if (!readiness.response.ok) {
    throw new Error("Readiness check failed. Add missing Railway variables before testing GHL lead flow.");
  }

  const timestamp = Date.now();
  const lead = {
    firstName: "Test Lead",
    name: "Test Lead",
    email: `readywhite.test+${timestamp}@example.com`,
    phone: "555-555-5555",
    propertyAddress: "123 Test Turnover Ave",
    propertyType: "Single-family rental",
    occupiedStatus: "Vacant",
    desiredTimeline: "ASAP turnover",
    packageInterest: "Standard Market Ready",
    notes: "Automated systems-check lead. Delete after verification.",
    tags: [
      "Website Lead",
      "Property Refresh",
      "Ready White OS",
      "Photo Review",
      "Package Confirmation",
      "Systems Check",
    ],
    pipelineStage: "New Lead",
    workflowStatus: "Scope Verification in Progress",
    photoFileNames: ["systems-check-before.jpg"],
    submittedAt: new Date().toISOString(),
  };

  const ghl = await requestJson("/api/ghl-lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lead),
  });
  console.log("/api/ghl-lead", ghl.response.status, ghl.body);

  if (!ghl.response.ok || !ghl.body.ok) {
    throw new Error("GHL lead submission failed");
  }

  console.log("PASS: test lead submitted. Now confirm contact, opportunity, tags, and workflow activity inside GHL.");
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
