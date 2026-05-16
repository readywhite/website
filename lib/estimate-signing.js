const crypto = require("crypto");

const SIGNATURE_VERSION = "rw-estimate-v1";
const TRUSTED_ESTIMATE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function getSigningSecret() {
  return process.env.ESTIMATE_SIGNING_SECRET?.trim() || process.env.ADMIN_API_TOKEN?.trim() || "";
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function trustedEstimatePayload(estimate) {
  return {
    estimateId: estimate.estimateId,
    createdAt: estimate.createdAt,
    pricing: estimate.pricing,
    quote: estimate.quote,
    analysis: {
      estimateUnit: estimate.analysis?.estimateUnit,
      totalWallSquareFeet: estimate.analysis?.totalWallSquareFeet,
      damageTier: estimate.analysis?.damageTier,
      confidenceBps: estimate.analysis?.confidenceBps,
      manualReviewRequired: Boolean(estimate.analysis?.manualReviewRequired),
      exceptionFlags: estimate.analysis?.exceptionFlags || [],
      missingPhotoRequirements: estimate.analysis?.missingPhotoRequirements || [],
      walls: (estimate.analysis?.walls || []).map((wall) => ({
        wallId: wall.wallId,
        photoId: wall.photoId,
        estimatedSquareFeet: wall.estimatedSquareFeet,
        damageTier: wall.damageTier,
        wallType: wall.wallType,
        complexityScore: wall.complexityScore,
        confidence: wall.confidence,
        manualReviewRequired: Boolean(wall.manualReviewRequired),
        exceptionFlags: wall.exceptionFlags || [],
      })),
    },
    photos: (estimate.photos || []).map((photo) => ({
      id: photo.id,
      wallId: photo.wallId,
      photoUrl: photo.photoUrl || null,
      sha256: photo.sha256 || null,
      bytes: photo.bytes,
      width: photo.width || null,
      height: photo.height || null,
      mimeType: photo.mimeType,
    })),
    photoPolicyStatus: estimate.photoPolicyStatus,
  };
}

function signEstimate(estimate) {
  const secret = getSigningSecret();
  if (!secret) return { signature: null, signedPayload: null, warning: "ESTIMATE_SIGNING_SECRET is not configured; trusted CRM pricing is disabled" };
  const signedPayload = trustedEstimatePayload(estimate);
  const encoded = stableStringify(signedPayload);
  const signature = `${SIGNATURE_VERSION}:${crypto.createHmac("sha256", secret).update(encoded).digest("hex")}`;
  return { signature, signedPayload, warning: null };
}

function verifySignedEstimate(estimate) {
  if (!estimate) return { ok: true, trustedEstimate: null, warning: null };
  const secret = getSigningSecret();
  if (!secret) return { ok: false, error: "ESTIMATE_SIGNING_SECRET is required to accept browser-supplied estimate pricing" };
  const signature = String(estimate.estimateSignature || "");
  const signedPayload = estimate.signedEstimatePayload;
  if (!signature || !signedPayload || typeof signedPayload !== "object") {
    return { ok: false, error: "signed estimate payload and signature are required" };
  }
  if (!signature.startsWith(`${SIGNATURE_VERSION}:`)) return { ok: false, error: "unsupported estimate signature version" };

  const expected = `${SIGNATURE_VERSION}:${crypto.createHmac("sha256", secret).update(stableStringify(signedPayload)).digest("hex")}`;
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return { ok: false, error: "estimate signature verification failed" };
  }

  const createdAtMs = Date.parse(signedPayload.createdAt);
  if (!Number.isFinite(createdAtMs) || Date.now() - createdAtMs > TRUSTED_ESTIMATE_MAX_AGE_MS) {
    return { ok: false, error: "signed estimate is expired" };
  }

  return { ok: true, trustedEstimate: signedPayload, warning: null };
}

module.exports = {
  signEstimate,
  stableStringify,
  trustedEstimatePayload,
  verifySignedEstimate,
};
