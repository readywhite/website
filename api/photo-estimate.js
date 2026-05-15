const multer = require("multer");
const { calculateEstimate, normalizePaintOption, pricingRules } = require("../lib/pricing");

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MAX_PHOTOS = 12;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_PHOTOS,
    fileSize: MAX_FILE_BYTES,
  },
  fileFilter: (_req, file, callback) => {
    if (!ACCEPTED_IMAGE_TYPES.has(file.mimetype)) {
      callback(new Error("Only JPEG, PNG, WEBP, and non-animated GIF photos are supported"));
      return;
    }

    callback(null, true);
  },
});

function getEnv(name) {
  return process.env[name] && process.env[name].trim();
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function getFiles(req) {
  return Array.isArray(req.files) ? req.files : [];
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function photoSummaries(files) {
  return files.map((file, index) => ({
    id: `photo_${index + 1}`,
    fileName: file.originalname,
    mimeType: file.mimetype,
    bytes: file.size,
  }));
}

function extractJson(text) {
  if (!text) {
    throw new Error("OpenAI response did not include text output");
  }

  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("OpenAI response did not include a JSON object");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function normalizeAnalysis(rawAnalysis, fallbackSqft) {
  const confidence = Math.max(0, Math.min(1, Number(rawAnalysis.confidence) || 0));
  const measurementConfidence = Math.max(0, Math.min(1, Number(rawAnalysis.measurementConfidence) || confidence));
  const damageConfidence = Math.max(0, Math.min(1, Number(rawAnalysis.damageConfidence) || confidence));
  const estimatedSquareFeet = Math.max(0, Math.round(Number(rawAnalysis.totalWallSquareFeet) || fallbackSqft || 0));
  const exceptionFlags = Array.isArray(rawAnalysis.exceptionFlags) ? rawAnalysis.exceptionFlags : [];

  return {
    totalWallSquareFeet: estimatedSquareFeet,
    wallDimensions: Array.isArray(rawAnalysis.wallDimensions) ? rawAnalysis.wallDimensions : [],
    damageTier: ["basic", "standard", "heavy"].includes(String(rawAnalysis.damageTier || "").toLowerCase())
      ? String(rawAnalysis.damageTier).toLowerCase()
      : "standard",
    measurementConfidence,
    damageConfidence,
    confidence,
    manualReviewRequired: Boolean(rawAnalysis.manualReviewRequired) || confidence < pricingRules.manualReviewConfidenceThreshold,
    exceptionFlags,
    missingPhotoRequirements: Array.isArray(rawAnalysis.missingPhotoRequirements) ? rawAnalysis.missingPhotoRequirements : [],
    notes: Array.isArray(rawAnalysis.notes) ? rawAnalysis.notes : [],
  };
}

function buildFallbackAnalysis(files, body, reason) {
  const manualSqft = parseOptionalNumber(body.manualSquareFeet);
  const damageTier = String(body.damageTier || "standard").toLowerCase();
  const missingPhotoRequirements = [];

  if (files.length === 0) {
    missingPhotoRequirements.push("Upload at least one wide wall photo and one worst-wall photo before AI scope review.");
  }

  return {
    totalWallSquareFeet: manualSqft || 0,
    wallDimensions: [],
    damageTier: ["basic", "standard", "heavy"].includes(damageTier) ? damageTier : "standard",
    measurementConfidence: manualSqft ? 0.55 : 0,
    damageConfidence: 0.35,
    confidence: manualSqft ? 0.45 : 0,
    manualReviewRequired: true,
    exceptionFlags: ["low_measurement_confidence"],
    missingPhotoRequirements,
    notes: [reason],
  };
}

function buildOpenAIContent(files, body) {
  const prompt = [
    "You are supporting Ready White, an AI-native property-turnover painting operator.",
    "Analyze customer wall photos for a fast but conservative paint estimate.",
    "Return ONLY valid JSON with this shape:",
    "{\"totalWallSquareFeet\": number, \"wallDimensions\": [{\"photoId\": string, \"estimatedLengthFeet\": number, \"estimatedHeightFeet\": number, \"estimatedSquareFeet\": number, \"confidence\": number, \"reasoning\": string}], \"damageTier\": \"basic|standard|heavy\", \"measurementConfidence\": number, \"damageConfidence\": number, \"confidence\": number, \"manualReviewRequired\": boolean, \"exceptionFlags\": string[], \"missingPhotoRequirements\": string[], \"notes\": string[]}",
    "Damage tier rules: basic=minimal nail holes/light scuffs/small blemishes; standard=moderate patching/multiple holes/visible surface wear; heavy=significant damage/large repairs/texture issues/major prep.",
    "If there is no visible measurement reference such as door, outlet, switch plate, baseboard, ceiling height clue, or known room data, keep measurementConfidence below 0.70 and set manualReviewRequired true.",
    "Flag water damage, smoke damage, stain blocking, peeling paint, large holes, texture repair, ceiling damage, trim damage, missing required photos, and low measurement confidence.",
    `Customer-selected paint option: ${normalizePaintOption(body.paintOption)}.`,
    `Manual square footage hint, if provided: ${body.manualSquareFeet || "not provided"}.`,
    `Customer notes: ${body.notes || "none"}.`,
  ].join("\n");

  return [
    { type: "input_text", text: prompt },
    ...files.map((file, index) => ({
      type: "input_image",
      image_url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      detail: "high",
    })),
  ];
}

async function analyzeWithOpenAI(files, body) {
  const apiKey = getEnv("OPENAI_API_KEY");

  if (!apiKey) {
    return buildFallbackAnalysis(files, body, "OpenAI vision analysis is not configured. Add OPENAI_API_KEY to enable automated photo review.");
  }

  const model = getEnv("OPENAI_VISION_MODEL") || "gpt-4.1-mini";
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: buildOpenAIContent(files, body),
        },
      ],
      temperature: 0.1,
    }),
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = responseBody.error?.message || responseBody.message || "OpenAI vision analysis failed";
    throw new Error(`${message} (${response.status})`);
  }

  return normalizeAnalysis(extractJson(responseBody.output_text), parseOptionalNumber(body.manualSquareFeet));
}

async function handleParsedRequest(req, res) {
  const files = getFiles(req);

  if (files.length === 0 && !parseOptionalNumber(req.body.manualSquareFeet)) {
    sendJson(res, 400, {
      error: "Upload at least one wall photo or provide manual square footage for operator review.",
      manualReviewRequired: true,
    });
    return;
  }

  const paintOption = normalizePaintOption(req.body.paintOption);
  const analysis = await analyzeWithOpenAI(files, req.body);
  const estimate = calculateEstimate({
    squareFeet: analysis.totalWallSquareFeet,
    damageTier: analysis.damageTier,
    paintOption,
    confidence: Math.min(analysis.measurementConfidence, analysis.damageConfidence, analysis.confidence),
    exceptionFlags: [
      ...analysis.exceptionFlags,
      ...(analysis.missingPhotoRequirements.length > 0 ? ["missing_required_photos"] : []),
    ],
  });

  const response = {
    ok: true,
    photoPolicyStatus: files.length >= 2 && analysis.missingPhotoRequirements.length === 0 ? "complete" : "partial",
    photos: photoSummaries(files),
    analysis,
    pricing: estimate,
    quote: {
      priceToCustomerCents: estimate.priceToCustomerCents,
      manualReviewRequired: estimate.manualReviewRequired || analysis.manualReviewRequired,
      customerMessage: estimate.manualReviewRequired || analysis.manualReviewRequired
        ? "We received the photos and generated a preliminary estimate, but an operator must review the scope before this becomes a firm quote."
        : "Photo analysis produced enough confidence for a package-based Ready White estimate.",
    },
  };

  sendJson(res, 200, response);
}

function handleUploadError(error, res) {
  if (error) {
    const status = error.code === "LIMIT_FILE_SIZE" || error.code === "LIMIT_FILE_COUNT" ? 413 : 400;
    sendJson(res, status, { error: error.message, manualReviewRequired: true });
    return true;
  }

  return false;
}

module.exports = function photoEstimateHandler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  upload.array("photos", MAX_PHOTOS)(req, res, async (error) => {
    if (handleUploadError(error, res)) {
      return;
    }

    try {
      await handleParsedRequest(req, res);
    } catch (analysisError) {
      console.error(analysisError);
      const fallback = buildFallbackAnalysis(getFiles(req), req.body || {}, "Automated image analysis failed; route this job to manual scope review.");
      const pricing = calculateEstimate({
        squareFeet: fallback.totalWallSquareFeet,
        damageTier: fallback.damageTier,
        paintOption: req.body?.paintOption,
        confidence: fallback.confidence,
        exceptionFlags: fallback.exceptionFlags,
      });

      sendJson(res, 200, {
        ok: true,
        photoPolicyStatus: "exception_review",
        photos: photoSummaries(getFiles(req)),
        analysis: fallback,
        pricing,
        quote: {
          priceToCustomerCents: pricing.priceToCustomerCents,
          manualReviewRequired: true,
          customerMessage: "We received the photos, but automated analysis needs operator review before a firm quote.",
        },
      });
    }
  });
};
