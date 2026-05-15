const fs = require("fs");
const path = require("path");

const pricingRules = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "config", "pricing-rules.json"), "utf8"),
);

const DAMAGE_TIERS = Object.keys(pricingRules.damageTiers);
const WALL_TYPES = Object.keys(pricingRules.wallTypes);
const MARKETS = Object.keys(pricingRules.markets);

function roundCents(value) {
  return Math.round(Number(value) || 0);
}

function multiplyBps(cents, bps = 10000) {
  return Math.round(roundCents(cents) * Math.max(0, Math.round(Number(bps) || 10000)) / 10000);
}

function priceFromMarginCents(vendorBuyRateCents, targetMarginBps) {
  const denominator = 10000 - Math.max(0, Math.min(9500, Math.round(Number(targetMarginBps) || pricingRules.targetMarginBps)));
  return Math.ceil(roundCents(vendorBuyRateCents) * 10000 / denominator);
}

function dollarsToCents(value) {
  return roundCents(Number(value) * 100);
}

function normalizeDamageTier(value) {
  const normalized = String(value || "").toLowerCase();
  return DAMAGE_TIERS.includes(normalized) ? normalized : "standard";
}

function normalizeWallType(value) {
  const normalized = String(value || "").toLowerCase();
  return WALL_TYPES.includes(normalized) ? normalized : "standard_flat";
}

function normalizeMarket(value) {
  const normalized = String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return MARKETS.includes(normalized) ? normalized : "default";
}

function normalizePaintOption(value) {
  const normalized = String(value || "").toLowerCase();
  return pricingRules.paintOptions[normalized] ? normalized : "ready_white_standard";
}

function getSizeBand(sqft) {
  return pricingRules.sizeBands.find((band) => band.maxSqft === null || sqft <= band.maxSqft);
}

function normalizeExceptionFlags(flags = []) {
  const allowed = new Set(pricingRules.exceptionFlags);
  return Array.from(new Set((Array.isArray(flags) ? flags : []).filter((flag) => allowed.has(flag))));
}

function calculateEstimate({
  squareFeet,
  damageTier,
  paintOption,
  confidence = 0,
  exceptionFlags = [],
  market = "default",
  walls = [],
} = {}) {
  const sqft = Math.max(0, Math.min(pricingRules.maxTotalSquareFeet, Math.round(Number(squareFeet) || 0)));
  const normalizedDamageTier = normalizeDamageTier(damageTier);
  const normalizedPaintOption = normalizePaintOption(paintOption);
  const normalizedMarket = normalizeMarket(market);
  const marketRule = pricingRules.markets[normalizedMarket];
  const tierRule = pricingRules.damageTiers[normalizedDamageTier];
  const paintRule = pricingRules.paintOptions[normalizedPaintOption];
  const sizeBand = getSizeBand(sqft || 1);
  const confidenceBps = Math.max(0, Math.min(10000, Math.round(Number(confidence) * 10000 || 0)));
  const uniqueExceptionFlags = normalizeExceptionFlags(exceptionFlags);

  if (!sqft) uniqueExceptionFlags.push("low_measurement_confidence");
  if (sqft > pricingRules.maxAutoQuoteSquareFeet) uniqueExceptionFlags.push("large_scope_review");
  if (confidenceBps < pricingRules.manualReviewConfidenceThresholdBps) uniqueExceptionFlags.push("low_measurement_confidence");

  const wallComplexityMultiplierBps = Array.isArray(walls) && walls.length > 0
    ? Math.max(...walls.map((wall) => pricingRules.wallTypes[normalizeWallType(wall.wallType)]?.laborMultiplierBps || 10000))
    : 10000;
  const laborBeforeMarketCents = multiplyBps(
    sqft * tierRule.laborRatePerSqftCents + tierRule.prepAddOnCents,
    wallComplexityMultiplierBps,
  );
  const materialBeforeMarketCents = sqft * paintRule.materialRatePerSqftCents + paintRule.baseMaterialCents;
  const laborCostCents = multiplyBps(laborBeforeMarketCents, marketRule.laborMultiplierBps);
  const materialCostCents = multiplyBps(materialBeforeMarketCents, marketRule.materialMultiplierBps);
  const mobilizationCents = multiplyBps(sizeBand?.mobilizationCents || 0, marketRule.mobilizationMultiplierBps);
  const vendorBuyRateCents = laborCostCents + materialCostCents + mobilizationCents;
  const targetMarginBps = marketRule.targetMarginBps || pricingRules.targetMarginBps;
  const priceBeforeMinimumCents = priceFromMarginCents(vendorBuyRateCents, targetMarginBps);
  const priceToCustomerCents = Math.max(pricingRules.minimumCustomerPriceCents, priceBeforeMinimumCents);
  const estimatedLaborHours = Number((sqft / (normalizedDamageTier === "heavy" ? 85 : normalizedDamageTier === "standard" ? 120 : 155)).toFixed(1));
  const grossMarginCents = priceToCustomerCents - vendorBuyRateCents;
  const grossMarginBps = priceToCustomerCents ? Math.round(grossMarginCents * 10000 / priceToCustomerCents) : 0;
  const finalExceptionFlags = Array.from(new Set(uniqueExceptionFlags));
  const manualReviewRequired = finalExceptionFlags.length > 0;

  return {
    pricingRulesVersion: pricingRules.version,
    pricingVersion: pricingRules.version,
    squareFeet: sqft,
    paintOption: normalizedPaintOption,
    paintLabel: paintRule.label,
    market: normalizedMarket,
    marketLabel: marketRule.label,
    marketMultipliersBps: {
      labor: marketRule.laborMultiplierBps,
      material: marketRule.materialMultiplierBps,
      mobilization: marketRule.mobilizationMultiplierBps,
    },
    damageTier: normalizedDamageTier,
    conditionTier: tierRule.conditionTier,
    repairTier: tierRule.repairTier,
    vendorPackage: manualReviewRequired && finalExceptionFlags.some((flag) => flag !== "low_measurement_confidence")
      ? "exception_review"
      : tierRule.vendorPackage,
    sizeBand: sizeBand?.name || "unknown",
    estimatedLaborHours,
    laborCostCents,
    materialCostCents,
    mobilizationCents,
    vendorBuyRateCents,
    priceToCustomerCents,
    grossMarginCents,
    grossMarginBps,
    targetMarginBps,
    targetMargin: targetMarginBps / 10000,
    manualReviewRequired,
    exceptionFlags: finalExceptionFlags,
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
  normalizeExceptionFlags,
  normalizeMarket,
  normalizePaintOption,
  normalizeWallType,
};
