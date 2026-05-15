const fs = require("fs");
const path = require("path");

const controlThresholds = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "config", "control-thresholds.json"), "utf8"),
);

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function severityForBps(observed, warn, critical, direction = "above") {
  if (direction === "below") {
    if (observed < critical) return "critical";
    if (observed < warn) return "warning";
    return "ok";
  }

  if (observed > critical) return "critical";
  if (observed > warn) return "warning";
  return "ok";
}

function anomaly({ id, severity, domain, subject, metric, observed, threshold, actions, tags }) {
  return {
    id,
    severity,
    domain,
    subject,
    metric,
    observed,
    threshold,
    actions,
    tags,
  };
}

function evaluateMarketMetrics(snapshot, thresholds) {
  const anomalies = [];
  const metrics = snapshot.metrics || {};
  const market = snapshot.market || "default";
  const speedToLead = number(metrics.speedToLeadMedianMinutes);

  if (speedToLead > thresholds.speedToLeadMedianMaxMinutes) {
    anomalies.push(anomaly({
      id: `${market}:speed_to_lead`,
      severity: speedToLead > thresholds.speedToLeadMedianMaxMinutes * 2 ? "critical" : "warning",
      domain: "speed_to_lead",
      subject: market,
      metric: "speedToLeadMedianMinutes",
      observed: speedToLead,
      threshold: thresholds.speedToLeadMedianMaxMinutes,
      actions: ["trigger_missed_call_text_back_audit", "review_new_lead_response_sla", "assign_owner_for_speed_to_lead_recovery"],
      tags: ["control:anomaly", "sla:speed-to-lead"],
    }));
  }

  const staleLeads = metrics.staleLeadsByStage || {};
  for (const [stage, maxCount] of Object.entries(thresholds.staleLeadMaxByStage || {})) {
    const observed = number(staleLeads[stage]);
    if (observed > maxCount) {
      anomalies.push(anomaly({
        id: `${market}:stale:${stage.replace(/\s+/g, "_").toLowerCase()}`,
        severity: observed > maxCount * 2 ? "critical" : "warning",
        domain: "pipeline_integrity",
        subject: stage,
        metric: "staleLeadsByStage",
        observed,
        threshold: maxCount,
        actions: ["run_stale_lead_recovery", "audit_stage_automation", "notify_pipeline_owner"],
        tags: ["control:anomaly", "pipeline:stale-leads"],
      }));
    }
  }

  const manualReviewRate = number(metrics.photoEstimateManualReviewRateBps);
  const manualReviewSeverity = severityForBps(
    manualReviewRate,
    thresholds.manualReviewRateWarnBps,
    thresholds.manualReviewRateCriticalBps,
  );
  if (manualReviewSeverity !== "ok") {
    anomalies.push(anomaly({
      id: `${market}:manual_review_rate`,
      severity: manualReviewSeverity,
      domain: "photo_estimate_quality",
      subject: market,
      metric: "photoEstimateManualReviewRateBps",
      observed: manualReviewRate,
      threshold: thresholds.manualReviewRateWarnBps,
      actions: ["inspect_wall_photo_quality", "audit_paper_reference_compliance", "review_prompt_schema_drift"],
      tags: ["control:anomaly", "estimate:manual-review-spike"],
    }));
  }

  const marginVariance = Math.abs(number(metrics.grossMarginVarianceBps));
  const marginSeverity = severityForBps(
    marginVariance,
    thresholds.grossMarginVarianceWarnBps,
    thresholds.grossMarginVarianceCriticalBps,
  );
  if (marginSeverity !== "ok") {
    anomalies.push(anomaly({
      id: `${market}:margin_variance`,
      severity: marginSeverity,
      domain: "margin_control",
      subject: market,
      metric: "grossMarginVarianceBps",
      observed: marginVariance,
      threshold: thresholds.grossMarginVarianceWarnBps,
      actions: ["freeze_auto_quote_for_market", "review_market_pricing_config", "sample_recent_completed_jobs"],
      tags: ["control:anomaly", "risk:margin-drift"],
    }));
  }

  const proofBacklog = number(metrics.proofReviewBacklog);
  if (proofBacklog > thresholds.proofReviewBacklogWarnCount) {
    anomalies.push(anomaly({
      id: `${market}:proof_review_backlog`,
      severity: proofBacklog > thresholds.proofReviewBacklogWarnCount * 2 ? "critical" : "warning",
      domain: "qa",
      subject: "Photo Proof Review",
      metric: "proofReviewBacklog",
      observed: proofBacklog,
      threshold: thresholds.proofReviewBacklogWarnCount,
      actions: ["increase_qa_review_capacity", "block_completion_without_proof", "notify_operations_owner"],
      tags: ["control:anomaly", "qa:proof-backlog"],
    }));
  }

  const vendorAssignmentBacklog = number(metrics.vendorAssignmentBacklog);
  if (vendorAssignmentBacklog > thresholds.vendorAssignmentBacklogWarnCount) {
    anomalies.push(anomaly({
      id: `${market}:vendor_assignment_backlog`,
      severity: vendorAssignmentBacklog > thresholds.vendorAssignmentBacklogWarnCount * 2 ? "critical" : "warning",
      domain: "dispatch",
      subject: "Vendor Assignment",
      metric: "vendorAssignmentBacklog",
      observed: vendorAssignmentBacklog,
      threshold: thresholds.vendorAssignmentBacklogWarnCount,
      actions: ["run_vendor_ranking", "activate_overflow_vendor", "pause_market_lead_scaling"],
      tags: ["control:anomaly", "dispatch:backlog"],
    }));
  }

  return anomalies;
}

function evaluateVendors(snapshot, thresholds) {
  const anomalies = [];
  const vendors = Array.isArray(snapshot.vendors) ? snapshot.vendors : [];

  for (const vendor of vendors) {
    const vendorId = vendor.vendor_id || vendor.id || "unknown_vendor";
    const callbackRate = number(vendor.callback_rate_bps);
    const callbackSeverity = severityForBps(callbackRate, thresholds.vendorCallbackWarnBps, thresholds.vendorCallbackCriticalBps);

    if (callbackSeverity !== "ok") {
      anomalies.push(anomaly({
        id: `${vendorId}:callback_rate`,
        severity: callbackSeverity,
        domain: "vendor_quality",
        subject: vendorId,
        metric: "callback_rate_bps",
        observed: callbackRate,
        threshold: thresholds.vendorCallbackWarnBps,
        actions: callbackSeverity === "critical"
          ? ["increase_qa_sampling", "decrease_dispatch_weight", "initiate_vendor_probation", "trigger_vendor_retraining"]
          : ["increase_qa_sampling", "review_recent_callbacks", "coach_vendor_on_scope_standards"],
        tags: callbackSeverity === "critical"
          ? ["control:anomaly", "vendor:probation", "qa:sampling-increased"]
          : ["control:anomaly", "qa:sampling-increased"],
      }));
    }

    const photoCompliance = number(vendor.photo_compliance_rate_bps);
    if (photoCompliance < thresholds.vendorPhotoComplianceMinBps) {
      anomalies.push(anomaly({
        id: `${vendorId}:photo_compliance`,
        severity: photoCompliance < thresholds.vendorPhotoComplianceMinBps - 1000 ? "critical" : "warning",
        domain: "proof_of_work",
        subject: vendorId,
        metric: "photo_compliance_rate_bps",
        observed: photoCompliance,
        threshold: thresholds.vendorPhotoComplianceMinBps,
        actions: ["block_completion_without_proof", "require_vendor_retraining", "decrease_dispatch_weight"],
        tags: ["control:anomaly", "proof:non-compliant"],
      }));
    }

    const onTimeRate = number(vendor.on_time_rate_bps);
    if (onTimeRate < thresholds.vendorOnTimeMinBps) {
      anomalies.push(anomaly({
        id: `${vendorId}:on_time_rate`,
        severity: onTimeRate < thresholds.vendorOnTimeMinBps - 1000 ? "critical" : "warning",
        domain: "vendor_reliability",
        subject: vendorId,
        metric: "on_time_rate_bps",
        observed: onTimeRate,
        threshold: thresholds.vendorOnTimeMinBps,
        actions: ["decrease_dispatch_weight", "review_capacity_commitments", "activate_redundant_vendor"],
        tags: ["control:anomaly", "vendor:sla-watch"],
      }));
    }

    const variance = number(vendor.avg_variance_bps);
    if (variance > thresholds.vendorVarianceWarnBps) {
      anomalies.push(anomaly({
        id: `${vendorId}:estimate_variance`,
        severity: variance > thresholds.vendorVarianceWarnBps * 2 ? "critical" : "warning",
        domain: "variance_control",
        subject: vendorId,
        metric: "avg_variance_bps",
        observed: variance,
        threshold: thresholds.vendorVarianceWarnBps,
        actions: ["sample_recent_jobs", "compare_estimated_vs_actual_wall_data", "review_vendor_scope_discipline"],
        tags: ["control:anomaly", "variance:vendor-drift"],
      }));
    }
  }

  return anomalies;
}

function buildActions(anomalies, thresholds) {
  return anomalies.map((item) => ({
    anomalyId: item.id,
    severity: item.severity,
    owner: item.domain === "dispatch" || item.domain.startsWith("vendor") ? "vendor_ops" : "operations",
    actions: item.actions,
    dispatchWeightAdjustmentBps: item.actions.includes("initiate_vendor_probation")
      ? -thresholds.probationDispatchWeightPenaltyBps
      : item.actions.includes("decrease_dispatch_weight")
        ? -thresholds.dispatchWeightPenaltyBps
        : 0,
    qaSamplingIncreaseBps: item.actions.includes("increase_qa_sampling")
      ? thresholds.qaSamplingIncreaseBps
      : 0,
    tags: item.tags,
  }));
}

function evaluateControlSnapshot(snapshot = {}, thresholds = controlThresholds) {
  const anomalies = [
    ...evaluateMarketMetrics(snapshot, thresholds),
    ...evaluateVendors(snapshot, thresholds),
  ];
  const criticalCount = anomalies.filter((item) => item.severity === "critical").length;
  const warningCount = anomalies.filter((item) => item.severity === "warning").length;

  return {
    ok: criticalCount === 0,
    generatedAt: new Date().toISOString(),
    sourceGeneratedAt: snapshot.generatedAt || null,
    market: snapshot.market || "default",
    thresholdsVersion: thresholds.version,
    summary: {
      criticalCount,
      warningCount,
      anomalyCount: anomalies.length,
    },
    anomalies,
    recommendedActions: buildActions(anomalies, thresholds),
  };
}

module.exports = {
  controlThresholds,
  evaluateControlSnapshot,
};
