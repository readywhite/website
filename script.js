const LEAD_ENDPOINT = "/api/ghl-lead";
const PHOTO_ESTIMATE_ENDPOINT = "/api/photo-estimate";

const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");
const estimatePreview = document.querySelector("#estimate-preview");

function setStatus(message, type = "success") {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
}

function formatMoney(cents) {
  return `$${(Math.round(Number(cents) || 0) / 100).toFixed(2)}`;
}

function setEstimatePreview(estimate) {
  if (!estimatePreview) {
    return;
  }

  if (!estimate) {
    estimatePreview.hidden = true;
    estimatePreview.innerHTML = "";
    return;
  }

  const pricing = estimate.pricing || {};
  const analysis = estimate.analysis || {};
  const manualReview = estimate.quote?.manualReviewRequired || pricing.manualReviewRequired;
  const walls = Array.isArray(analysis.walls) ? analysis.walls : [];
  const wallRows = walls.map((wall) => `
    <li>
      <strong>${wall.wallId}</strong>: ${wall.estimatedSquareFeet || "review"} sqft,
      ${wall.damageTier || "damage review"}, ${wall.wallType || "standard_flat"},
      confidence ${Math.round((wall.confidence || 0) * 100)}%
    </li>
  `).join("");
  estimatePreview.hidden = false;
  estimatePreview.innerHTML = `
    <h3>Wall-by-wall estimate preview</h3>
    <dl>
      <div><dt>Total wall sqft</dt><dd>${pricing.squareFeet || analysis.totalWallSquareFeet || "Review needed"}</dd></div>
      <div><dt>Worst damage tier</dt><dd>${pricing.damageTier || analysis.damageTier || "Review needed"}</dd></div>
      <div><dt>Paint</dt><dd>${pricing.paintLabel || "Ready White Standard White"}</dd></div>
      <div><dt>Market</dt><dd>${pricing.marketLabel || "Default Market"}</dd></div>
      <div><dt>Estimate</dt><dd>${pricing.priceToCustomerCents ? formatMoney(pricing.priceToCustomerCents) : "Manual review"}</dd></div>
    </dl>
    ${wallRows ? `<ul class="wall-preview-list">${wallRows}</ul>` : ""}
    <p class="${manualReview ? "estimate-warning" : "estimate-success"}">
      ${manualReview ? "Operator review required before this becomes a firm quote." : "Enough wall-photo confidence for package-based quote review."}
    </p>
  `;
}

function normalizePropertyType(propertyType) {
  const normalized = String(propertyType || "").toLowerCase();

  if (normalized.includes("multi") || normalized.includes("rental")) {
    return "multifamily";
  }

  if (normalized.includes("condo") || normalized.includes("townhouse")) {
    return "condo_townhouse";
  }

  if (normalized.includes("commercial")) {
    return "commercial";
  }

  return "single_family";
}

function inferCustomerVertical(propertyType) {
  const normalized = String(propertyType || "").toLowerCase();

  if (normalized.includes("rental") || normalized.includes("multi")) {
    return "property-management";
  }

  if (normalized.includes("commercial")) {
    return "commercial";
  }

  return "investor";
}

function buildTags(formData, estimate) {
  const vertical = inferCustomerVertical(formData.get("propertyType"));
  const tags = ["source:squarespace", `vertical:${vertical}`, "lead:new"];

  if (formData.get("timeline") === "24_hours" || formData.get("timeline") === "same_day") {
    tags.push("timeline:asap");
  }

  if (formData.get("occupancyStatus") === "vacant") {
    tags.push("vacant:true");
  }

  if (estimate) {
    tags.push("estimate:ai-assisted");
  }

  if (estimate?.quote?.manualReviewRequired || estimate?.pricing?.manualReviewRequired) {
    tags.push("estimate:manual-review", "estimate:confidence-low");
  } else if (estimate) {
    tags.push("estimate:confidence-high");
  }

  if (formData.get("manualSquareFeet")) {
    tags.push("estimate:manual-override");
  }

  if (estimate?.pricing?.damageTier) {
    tags.push(`damage:${estimate.pricing.damageTier}`);
  }

  if (formData.get("market")) {
    tags.push(`market:${formData.get("market")}`);
  }

  if ((estimate?.pricing?.exceptionFlags || []).includes("calibration_phase_operator_review")) {
    tags.push("estimate:calibration-review");
  }

  if ((estimate?.pricing?.exceptionFlags || []).includes("premium_customer_review")) {
    tags.push("scope:premium-review");
  }

  if ((estimate?.analysis?.walls || []).some((wall) => Number(wall.complexityScore) >= 0.75)) {
    tags.push("scope:high-complexity");
  }

  return Array.from(new Set(tags));
}

function buildCanonicalJob(formData, photos, estimate) {
  const propertyType = formData.get("propertyType");
  const vertical = inferCustomerVertical(propertyType);
  const pricing = estimate?.pricing || {};
  const photoPolicyStatus = estimate?.photoPolicyStatus || (photos.length > 0 ? "partial" : "requested");
  const manualReview = estimate?.quote?.manualReviewRequired || pricing.manualReviewRequired;
  return "investor";
}

function buildTags(formData) {
  const vertical = inferCustomerVertical(formData.get("propertyType"));

  return ["source:squarespace", `vertical:${vertical}`, "lead:new"];
}

function buildCanonicalJob(formData, photos) {
  const propertyType = formData.get("propertyType");
  const vertical = inferCustomerVertical(propertyType);

  return {
    lead_source: "source:squarespace",
    pipeline_name: "Ready White Customer Jobs",
    pipeline_stage: "New Lead",
    job_type: "make_ready_refresh",
    property_type: normalizePropertyType(propertyType),
    customer_vertical: vertical,
    occupancy_status: formData.get("occupancyStatus") || "unknown",
    room_count: formData.get("roomCount") ? Number(formData.get("roomCount")) : null,
    sqft: pricing.squareFeet || null,
    market: pricing.market || formData.get("market") || "default",
    estimate_unit: estimate?.analysis?.estimateUnit || "one_wall_one_estimate_unit",
    walls: (estimate?.analysis?.walls || []).map((wall) => ({
      wall_id: wall.wallId,
      photo_id: wall.photoId,
      sqft: wall.estimatedSquareFeet,
      damage_tier: wall.damageTier,
      wall_type: wall.wallType,
      complexity_score: wall.complexityScore,
      confidence: wall.confidence,
      manual_review_required: wall.manualReviewRequired,
      exception_flags: wall.exceptionFlags || [],
    })),
    condition_tier: pricing.conditionTier || "unknown",
    repair_tier: pricing.repairTier || "unknown",
    timeline: formData.get("timeline") || "standard",
    vendor_package: pricing.vendorPackage || "standard_turn",
    target_margin: pricing.targetMargin || 0.42,
    photo_policy_status: manualReview ? "exception_review" : photoPolicyStatus,
    exception_flags: pricing.exceptionFlags || [],
    estimate: pricing.priceToCustomerCents
      ? {
          labor_hours_estimated: pricing.estimatedLaborHours,
          materials_estimated_cents: pricing.materialCostCents,
          price_to_customer_cents: pricing.priceToCustomerCents,
          vendor_buy_rate_cents: pricing.vendorBuyRateCents,
          gross_margin_cents: pricing.grossMarginCents,
          pricing_rules_version: pricing.pricingRulesVersion,
        }
      : null,
  };
}

function buildPhotoEstimateFormData(form) {
  const formData = new FormData(form);
  const estimateData = new FormData();

  for (const file of formData.getAll("photos").filter((photo) => photo.name)) {
    estimateData.append("photos", file, file.name);
  }

  estimateData.append("paintOption", formData.get("paintOption") || "ready_white_standard");
  estimateData.append("market", formData.get("market") || "default");
  estimateData.append("manualSquareFeet", formData.get("manualSquareFeet") || "");
  estimateData.append("notes", formData.get("notes") || "");
  estimateData.append("propertyType", formData.get("propertyType") || "");
  estimateData.append("damageTier", formData.get("damageTier") || "");

  return estimateData;
}

function buildPayload(form, estimate) {
    occupancy_status: "unknown",
    room_count: null,
    sqft: null,
    condition_tier: "unknown",
    repair_tier: "unknown",
    timeline: "standard",
    vendor_package: "standard_turn",
    target_margin: 0.42,
    photo_policy_status: photos.length > 0 ? "partial" : "requested",
    exception_flags: [],
  };
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
    paintOption: formData.get("paintOption"),
    market: formData.get("market") || "default",
    occupancyStatus: formData.get("occupancyStatus"),
    timeline: formData.get("timeline"),
    roomCount: formData.get("roomCount") ? Number(formData.get("roomCount")) : null,
    notes: formData.get("notes"),
    tags: buildTags(formData, estimate),
    pipelineName: "Ready White Customer Jobs",
    pipelineStage: "New Lead",
    canonicalJob: buildCanonicalJob(formData, photos, estimate),
    estimate,
    photoUrls: (estimate?.photos || []).map((photo) => photo.photoUrl).filter(Boolean),
    tags: buildTags(formData),
    pipelineName: "Ready White Customer Jobs",
    pipelineStage: "New Lead",
    canonicalJob: buildCanonicalJob(formData, photos),
    photoFileNames: photos.map((file) => file.name),
    submittedAt: new Date().toISOString(),
  };
}

function isLocalPreview() {
  return ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

async function requestPhotoEstimate(form) {
  const formData = new FormData(form);
  const photos = formData.getAll("photos").filter((file) => file.name);
  const manualSquareFeet = formData.get("manualSquareFeet");

  if (photos.length === 0 && !manualSquareFeet) {
    return null;
  }

  const response = await fetch(PHOTO_ESTIMATE_ENDPOINT, {
    method: "POST",
    body: buildPhotoEstimateFormData(form),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Photo estimate failed");
  }

  return response.json();
}

async function submitLead(payload) {
  if (isLocalPreview()) {
    console.info("Ready White lead payload", payload);
    return { demoMode: true };
  }

  const response = await fetch(LEAD_ENDPOINT, {
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
  setStatus("Reviewing photos and preparing your Ready White estimate...", "success");
  setEstimatePreview(null);

  const submitButton = quoteForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const estimate = await requestPhotoEstimate(quoteForm);
    setEstimatePreview(estimate);

    const result = await submitLead(buildPayload(quoteForm, estimate));
    quoteForm.reset();

    if (result.demoMode) {
      setStatus("Demo mode: estimate payload captured locally. Deploy with OpenAI and GHL environment variables to send it live.");
    } else {
      setStatus("Thanks! Ready White received your photos and will follow up shortly with quote next steps.");
    }
  } catch (error) {
    console.error(error);
    setStatus("Something went wrong. Please call or email Ready White directly so we can help.", "error");
  } finally {
    submitButton.disabled = false;
  }
});
