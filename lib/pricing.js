const fs = require("fs");
const path = require("path");

const pricingRules = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "config", "pricing-rules.json"), "utf8"),
);

function roundCents(value) {
  return Math.round(Number(value) || 0);
}

function dollarsToCents(value) {
  return roundCents(Number(value) * 100);
}

function normalizeDamageTier(value) {
  const normalized = String(value || "").toLowerCase();

  if (["basic", "standard", "heavy"].includes(normalized)) {
    return normalized;
  }

  return "standard";
}

function normalizePaintOption(value) {
  const normalized = String(value || "").toLowerCase();

  if (pricingRules.paintOptions[normalized]) {
    return normalized;
  }

  return "ready_white_standard";
}

function getSizeBand(sqft) {
  return pricingRules.sizeBands.find((band) => band.maxSqft === null || sqft <= band.maxSqft);
}

function calculateEstimate({ squareFeet, damageTier, paintOption, confidence = 0, exceptionFlags = [] }) {
  const sqft = Math.max(0, Math.round(Number(squareFeet) || 0));
  const normalizedDamageTier = normalizeDamageTier(damageTier);
  const normalizedPaintOption = normalizePaintOption(paintOption);
  const tierRule = pricingRules.damageTiers[normalizedDamageTier];
  const paintRule = pricingRules.paintOptions[normalizedPaintOption];
  const sizeBand = getSizeBand(sqft || 1);
  const uniqueExceptionFlags = Array.from(new Set(exceptionFlags.filter(Boolean)));

  if (!sqft) {
    uniqueExceptionFlags.push("low_measurement_confidence");
  }

  if (confidence < pricingRules.manualReviewConfidenceThreshold) {
    uniqueExceptionFlags.push("low_measurement_confidence");
  }

  const laborCostCents = roundCents(sqft * tierRule.laborRatePerSqftCents + tierRule.prepAddOnCents);
  const materialCostCents = roundCents(sqft * paintRule.materialRatePerSqftCents + paintRule.baseMaterialCents);
  const mobilizationCents = sizeBand?.mobilizationCents || 0;
  const vendorBuyRateCents = laborCostCents + materialCostCents + mobilizationCents;
  const priceBeforeMinimumCents = roundCents(vendorBuyRateCents / (1 - pricingRules.targetMargin));
  const priceToCustomerCents = Math.max(pricingRules.minimumCustomerPriceCents, priceBeforeMinimumCents);
  const estimatedLaborHours = Number((sqft / (normalizedDamageTier === "heavy" ? 85 : normalizedDamageTier === "standard" ? 120 : 155)).toFixed(1));
  const grossMargin = priceToCustomerCents ? Number(((priceToCustomerCents - vendorBuyRateCents) / priceToCustomerCents).toFixed(3)) : 0;
  const manualReviewRequired = uniqueExceptionFlags.length > 0 || confidence < pricingRules.manualReviewConfidenceThreshold;

  return {
    pricingVersion: pricingRules.version,
    squareFeet: sqft,
    paintOption: normalizedPaintOption,
    paintLabel: paintRule.label,
    damageTier: normalizedDamageTier,
    conditionTier: tierRule.conditionTier,
    repairTier: tierRule.repairTier,
    vendorPackage: manualReviewRequired && uniqueExceptionFlags.some((flag) => flag !== "low_measurement_confidence")
      ? "exception_review"
      : tierRule.vendorPackage,
    sizeBand: sizeBand?.name || "unknown",
    estimatedLaborHours,
    laborCostCents,
    materialCostCents,
    mobilizationCents,
    vendorBuyRateCents,
    priceToCustomerCents,
    grossMargin,
    targetMargin: pricingRules.targetMargin,
    manualReviewRequired,
    exceptionFlags: Array.from(new Set(uniqueExceptionFlags)),
  };
}

function formatMoney(cents) {
  return `$${(roundCents(cents) / 100).toFixed(2)}`;
}

module.exports = {
  pricingRules,
  calculateEstimate,
  dollarsToCents,
  formatMoney,
  normalizeDamageTier,
  normalizePaintOption,
};
