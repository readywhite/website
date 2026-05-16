const { randomUUID } = require("crypto");

function emitOperationalLog({ level = "info", event, message, jobId = null, wallId = null, market = null, metadata = {} }) {
  const entry = {
    logId: randomUUID(),
    ts: new Date().toISOString(),
    level,
    event,
    message,
    jobId,
    wallId,
    market,
    metadata,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn" || level === "warning") console.warn(line);
  else console.log(line);
  return entry;
}

function metricPoint({ name, value = 1, unit = "count", tags = {}, ts = new Date().toISOString() }) {
  return { name, value: Number(value) || 0, unit, tags, ts };
}

function buildOperationalTelemetry(snapshot = {}) {
  const metrics = snapshot.metrics || {};
  const vendors = Array.isArray(snapshot.vendors) ? snapshot.vendors : [];
  return [
    metricPoint({ name: "speed_to_lead_median_minutes", value: metrics.speedToLeadMedianMinutes, unit: "minutes", tags: { market: snapshot.market || "default" } }),
    metricPoint({ name: "photo_estimate_manual_review_rate_bps", value: metrics.photoEstimateManualReviewRateBps, unit: "bps", tags: { market: snapshot.market || "default" } }),
    metricPoint({ name: "gross_margin_variance_bps", value: metrics.grossMarginVarianceBps, unit: "bps", tags: { market: snapshot.market || "default" } }),
    metricPoint({ name: "proof_review_backlog", value: metrics.proofReviewBacklog, tags: { market: snapshot.market || "default" } }),
    metricPoint({ name: "vendor_assignment_backlog", value: metrics.vendorAssignmentBacklog, tags: { market: snapshot.market || "default" } }),
    ...vendors.flatMap((vendor) => [
      metricPoint({ name: "vendor_callback_rate_bps", value: vendor.callback_rate_bps, unit: "bps", tags: { vendor_id: vendor.vendor_id, market: vendor.market } }),
      metricPoint({ name: "vendor_photo_compliance_rate_bps", value: vendor.photo_compliance_rate_bps, unit: "bps", tags: { vendor_id: vendor.vendor_id, market: vendor.market } }),
      metricPoint({ name: "vendor_on_time_rate_bps", value: vendor.on_time_rate_bps, unit: "bps", tags: { vendor_id: vendor.vendor_id, market: vendor.market } }),
      metricPoint({ name: "vendor_avg_variance_bps", value: vendor.avg_variance_bps, unit: "bps", tags: { vendor_id: vendor.vendor_id, market: vendor.market } }),
    ]),
  ];
}

module.exports = {
  buildOperationalTelemetry,
  emitOperationalLog,
  metricPoint,
};
