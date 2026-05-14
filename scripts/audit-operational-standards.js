const fs = require("fs");
const path = require("path");

const checks = [
  {
    file: "ghl-stack.example.json",
    required: [
      "Ready White Customer Jobs",
      "Photos Requested",
      "Photos Received",
      "Scope Review",
      "Quote Sent",
      "Follow-Up",
      "Approved",
      "Vendor Assignment",
      "Scheduled",
      "In Progress",
      "Photo Proof Review",
      "Completed",
      "Review Requested",
      "Closed Won",
      "Closed Lost",
      "source:squarespace",
      "lead:new",
      "lead:quoted",
      "lead:won",
      "missed call text back",
      "stale lead recovery",
      "property manager nurture",
      "00:00, 12:00, and 18:00 EST daily",
    ],
  },
  {
    file: "docs/sops/photo-intake-policy.md",
    required: ["1 wide photo of each room", "1 photo of the worst wall in each room", "prevent scope drift", "protect margins"],
  },
  {
    file: "docs/sops/vendor-policy.md",
    required: ["preset package buy rates", "vendor scorecards", "response SLAs", "callback tracking"],
  },
  {
    file: "docs/sops/material-cost-estimating-template.md",
    required: ["Sherwin-Williams", "required gallons", "totalMaterialCost", "approved exception workflows"],
  },
  {
    file: "config/material-pricing.json",
    required: ["pricingLastReviewed", "Sherwin-Williams", "pricePerGallon", "coverageSqFtPerGallon"],
  },
  {
    file: "config/outreach.yaml",
    required: ["stale_lead_recovery", "missed_call_text_back", "property_manager_nurture", "vertical:property-management"],
  },
  {
    file: "api/ghl-lead.js",
    required: ["GHL_PIPELINE_STAGE_NAME", "DEFAULT_PIPELINE_STAGE_NAME", "resolvePipelineStageId", "resolvedStageCache", "service_scope", "number_of_rooms"],
  },
  {
    file: "api/vendor-lead.js",
    required: ["source:vendor-page", "vendor:new", "service:interior-only", "Vendor Application Received"],
  },
  {
    file: "scripts/smoke-test-ghl.js",
    required: ["READYWHITE_RAILWAY_BASE_URL", "Squarespace marketing layer", "Railway backend orchestration layer"],
  },
  {
    file: "scripts/estimate-paint-materials.js",
    required: ["estimatePaintMaterials", "gallonsRequired", "totalMaterialCost", "material-pricing.json"],
  },
  {
    file: "scripts/audit-seo.js",
    required: ["Squarespace SEO audit passed", "SITE_TITLE", "SITE_DESCRIPTION", "MAX_IMAGE_BYTES", "MAX_PAGE_BYTES"],
  },

  {
    file: "index.html",
    required: ["Ready White | Fast Interior Property Refreshes", "og:title", "og:description", "og:image", "canonical", "application/ld+json", "Apartment Turnover Painting", "Request Property Refresh", "Join Vendor Network"],
  },
  {
    file: "services.html",
    required: ["Services | Ready White", "Interior repaint services", "og:url", "/get-started"],
  },
  {
    file: "locations.html",
    required: ["Locations | Ready White", "apartment painting Harrisburg PA", "rental repaint Harrisburg", "property manager painting Central PA", "apartment turnover repainting Pennsylvania", "move-out painting services"],
  },
  {
    file: "gallery.html",
    required: ["Gallery | Ready White", "Occupied apartment before interior repaint", "Empty apartment after Ready White repaint", "Rental turnover room with fresh white walls", "Apartment move-out repaint before and after"],
  },
  {
    file: "vendors.html",
    required: ["Vendor Network | Ready White", "Join the Ready White Vendor Network", "Vendor Sign-Up", "response SLAs", "photo proof"],
  },
  {
    file: "get-started.html",
    required: ["Get Started | Ready White", "Number of Rooms", "Upload Photos", "Requested Timeline", "Occupied or Vacant"],
  },
  {
    file: "contact.html",
    required: ["Contact | Ready White", "https://www.readywhite.com/contact", "Start Property Refresh Review"],
  },
  {
    file: "404.html",
    required: ["Page Not Found | Ready White", "/services", "/get-started", "/vendors", "/contact"],
  },
  {
    file: "docs/seo-launch-checklist.md",
    required: ["Google Search Console", "Bing Webmaster Tools", "Submit `https://www.readywhite.com/sitemap.xml`", "Apartment Turnover Painting", "missing alt text"],
  },
  {
    file: "scripts/report-ghl-setup.js",
    required: ["REQUIRED_AUTOMATION_SIGNALS", "stageOrderIssues", "Automation coverage checklist", "Ready White Customer Jobs"],
  },
  {
    file: ".github/workflows/systems-check.yml",
    required: ["0 5,17,23 * * *", "READYWHITE_RAILWAY_BASE_URL", "npm run audit:seo", "Generate GHL setup report", "Upload GHL setup report"],
  },
  {
    file: "config/kpi-reporting.yaml",
    required: ["speed_to_lead", "vacancy_turnover_time", "property_manager_repeat_rate", "pipeline_integrity_score", "automation_coverage_score", "material_cost_variance"],
  },
];

let failed = false;

for (const check of checks) {
  const fullPath = path.join(process.cwd(), check.file);
  const content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";

  for (const expected of check.required) {
    if (!content.includes(expected)) {
      console.error(`Missing "${expected}" in ${check.file}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("Operational standards audit passed.");
