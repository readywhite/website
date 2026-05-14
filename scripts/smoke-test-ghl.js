const target = process.env.READYWHITE_RAILWAY_BASE_URL || process.env.READYWHITE_BASE_URL || process.argv[2];
const source = process.env.READYWHITE_RAILWAY_BASE_URL
  ? "READYWHITE_RAILWAY_BASE_URL"
  : process.env.READYWHITE_BASE_URL
    ? "READYWHITE_BASE_URL"
    : "argv[2]";

if (!target) {
  console.error("Usage: READYWHITE_RAILWAY_BASE_URL=https://your-railway-domain npm run smoke:ghl");
  console.error("Fallback: READYWHITE_BASE_URL=https://your-railway-domain npm run smoke:ghl");
  process.exit(1);
}

const baseUrl = target.replace(/\/$/, "");
const isLikelySquarespaceMarketingUrl = /(^|\.)readywhite\.com$/i.test(new URL(baseUrl).hostname);

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";
    let body = {};

    if (contentType.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
      body = JSON.parse(text || "{}");
    }

    return { response, body, text, contentType, url };
  } catch (error) {
    const cause = error.cause?.message ? ` Cause: ${error.cause.message}` : "";
    throw new Error(`Unable to reach ${url}.${cause}`);
  }
}

function assertJsonEndpoint(result, endpointName) {
  if (!result.contentType.includes("application/json")) {
    throw new Error(
      `${endpointName} did not return JSON from ${baseUrl}. ` +
      `This usually means READYWHITE_RAILWAY_BASE_URL is pointing at the Squarespace marketing layer instead of the Railway backend orchestration layer.`
    );
  }
}

async function main() {
  console.log(`Running Ready White stack smoke test against ${baseUrl} from ${source}`);

  if (isLikelySquarespaceMarketingUrl && !process.env.READYWHITE_RAILWAY_BASE_URL) {
    console.warn(
      "WARN: readywhite.com is the Squarespace marketing layer. " +
      "The smoke test requires the Railway backend URL because it validates /health, SEO pages, /readiness, and /api/ghl-lead. " +
      "Set READYWHITE_RAILWAY_BASE_URL to the Railway domain for the live backend test."
    );
  }

  const health = await request("/health");
  console.log("/health", health.response.status, health.body || health.text.slice(0, 120));
  assertJsonEndpoint(health, "/health");

  if (!health.response.ok || health.body.ok !== true) {
    throw new Error("Healthcheck failed");
  }

  for (const page of ["/", "/services", "/vendors", "/locations", "/gallery", "/get-started", "/contact", "/sitemap.xml"]) {
    const pageResult = await request(page);
    console.log(page, pageResult.response.status, pageResult.contentType);
    if (!pageResult.response.ok) {
      throw new Error(`${page} did not load from the Railway backend`);
    }
  }

  const readiness = await request("/readiness");
  console.log("/readiness", readiness.response.status, readiness.body || readiness.text.slice(0, 120));
  assertJsonEndpoint(readiness, "/readiness");

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
      "source:squarespace",
      "vertical:property-management",
      "timeline:asap",
      "vacant:true",
      "lead:new",
      "systems-check",
    ],
    pipelineName: "Ready White Customer Jobs",
    pipelineStage: "New Lead",
    workflowStatus: "Photos Requested",
    photoFileNames: ["systems-check-before.jpg"],
    submittedAt: new Date().toISOString(),
  };

  const ghl = await request("/api/ghl-lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lead),
  });
  console.log("/api/ghl-lead", ghl.response.status, ghl.body || ghl.text.slice(0, 120));
  assertJsonEndpoint(ghl, "/api/ghl-lead");

  if (!ghl.response.ok || !ghl.body.ok) {
    throw new Error("GHL lead submission failed");
  }

  console.log("PASS: test lead submitted. Now confirm contact, opportunity, tags, and workflow activity inside GHL.");
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
