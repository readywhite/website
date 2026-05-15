const fs = require("fs");
const path = require("path");
const { normalizeMarket } = require("./pricing");

const vendorConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "config", "vendors.example.json"), "utf8"),
);

function clampBps(value) {
  return Math.max(0, Math.min(10000, Math.round(Number(value) || 0)));
}

function scoreVendor(vendor, { market = "default", service = "interior_repaint" } = {}) {
  const normalizedMarket = normalizeMarket(market);
  const marketMatch = vendor.markets.includes(normalizedMarket) ? 10000 : vendor.markets.includes("default") ? 6500 : 0;
  const serviceMatch = vendor.services.includes(service) ? 10000 : vendor.services.includes("exception_review") ? 6000 : 0;
  const capacityScore = Math.min(10000, Math.max(0, Number(vendor.capacity_open_jobs) || 0) * 2000);
  const responseScore = Math.max(0, 10000 - Math.min(10000, (Number(vendor.avg_response_minutes) || 999) * 100));
  const callbackScore = Math.max(0, 10000 - clampBps(vendor.callback_rate_bps));
  const varianceScore = Math.max(0, 10000 - clampBps(vendor.avg_variance_bps));

  const weightedScore = Math.round(
    marketMatch * 0.22
    + serviceMatch * 0.18
    + clampBps((vendor.score || 0) * 100) * 0.18
    + clampBps(vendor.on_time_rate_bps) * 0.12
    + callbackScore * 0.10
    + clampBps(vendor.photo_compliance_rate_bps) * 0.10
    + varianceScore * 0.06
    + capacityScore * 0.03
    + responseScore * 0.01,
  );

  return {
    vendor_id: vendor.vendor_id,
    name: vendor.name,
    score: weightedScore,
    marketMatch: marketMatch > 0,
    serviceMatch: serviceMatch > 0,
    capacity_open_jobs: vendor.capacity_open_jobs,
    avg_response_minutes: vendor.avg_response_minutes,
    reasons: [
      marketMatch ? "market_match" : "market_mismatch",
      serviceMatch ? "service_match" : "service_mismatch",
      clampBps(vendor.photo_compliance_rate_bps) >= 9500 ? "strong_photo_compliance" : "photo_compliance_watch",
      clampBps(vendor.callback_rate_bps) <= 500 ? "low_callback_rate" : "callback_rate_watch",
    ],
  };
}

function rankVendors(criteria = {}) {
  return vendorConfig.vendors
    .map((vendor) => scoreVendor(vendor, criteria))
    .filter((vendor) => vendor.marketMatch && vendor.serviceMatch)
    .sort((a, b) => b.score - a.score || a.avg_response_minutes - b.avg_response_minutes);
}

module.exports = {
  rankVendors,
  scoreVendor,
};
