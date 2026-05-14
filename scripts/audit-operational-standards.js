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
    file: "config/outreach.yaml",
    required: ["stale_lead_recovery", "missed_call_text_back", "vertical:property-management"],
  },
  {
    file: "config/kpi-reporting.yaml",
    required: ["speed_to_lead", "vacancy_turnover_time", "property_manager_repeat_rate"],
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
