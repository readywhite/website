const { normalizeMarket, pricingRules } = require("./pricing");

const PIPELINE_NAME = "Ready White Customer Jobs";
const PIPELINE_STAGES = [
  "New Lead",
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
];

const PROPERTY_TYPES = ["single_family", "condo_townhouse", "multifamily", "commercial", "student_housing"];
const CUSTOMER_VERTICALS = ["property-management", "investor", "agent", "owner", "commercial"];
const OCCUPANCY_STATUSES = ["vacant", "occupied", "unknown"];
const TIMELINES = ["same_day", "24_hours", "48_hours", "standard", "flexible"];
const PHOTO_STATUSES = ["requested", "partial", "complete", "exception_review"];
const WALL_TYPES = Object.keys(pricingRules.wallTypes);
const DAMAGE_TIERS = Object.keys(pricingRules.damageTiers);

function isFiniteNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}

function validateWalls(walls, errors) {
  if (walls === undefined || walls === null) return;
  if (!Array.isArray(walls)) {
    errors.push("canonicalJob.walls must be an array when provided");
    return;
  }

  walls.forEach((wall, index) => {
    if (!wall || typeof wall !== "object") {
      errors.push(`canonicalJob.walls[${index}] must be an object`);
      return;
    }

    if (!wall.wall_id && !wall.wallId) errors.push(`canonicalJob.walls[${index}] must include wall_id or wallId`);
    if (wall.wall_type && !WALL_TYPES.includes(wall.wall_type)) errors.push(`canonicalJob.walls[${index}].wall_type is not approved`);
    if (wall.wallType && !WALL_TYPES.includes(wall.wallType)) errors.push(`canonicalJob.walls[${index}].wallType is not approved`);
    if (wall.damage_tier && !DAMAGE_TIERS.includes(wall.damage_tier)) errors.push(`canonicalJob.walls[${index}].damage_tier is not approved`);
    if (wall.damageTier && !DAMAGE_TIERS.includes(wall.damageTier)) errors.push(`canonicalJob.walls[${index}].damageTier is not approved`);
    if (wall.sqft !== undefined && !isFiniteNumber(wall.sqft, 0, pricingRules.maxWallSquareFeet)) errors.push(`canonicalJob.walls[${index}].sqft must be within wall sqft bounds`);
    if (wall.estimatedSquareFeet !== undefined && !isFiniteNumber(wall.estimatedSquareFeet, 0, pricingRules.maxWallSquareFeet)) errors.push(`canonicalJob.walls[${index}].estimatedSquareFeet must be within wall sqft bounds`);
    if (wall.confidence !== undefined && !isFiniteNumber(wall.confidence, 0, 1)) errors.push(`canonicalJob.walls[${index}].confidence must be between 0 and 1`);
    if (wall.complexity_score !== undefined && !isFiniteNumber(wall.complexity_score, 0, 1)) errors.push(`canonicalJob.walls[${index}].complexity_score must be between 0 and 1`);
    if (wall.complexityScore !== undefined && !isFiniteNumber(wall.complexityScore, 0, 1)) errors.push(`canonicalJob.walls[${index}].complexityScore must be between 0 and 1`);
    if (wall.exception_flags && !Array.isArray(wall.exception_flags)) errors.push(`canonicalJob.walls[${index}].exception_flags must be an array`);
    if (wall.exceptionFlags && !Array.isArray(wall.exceptionFlags)) errors.push(`canonicalJob.walls[${index}].exceptionFlags must be an array`);
  });
}

function validateCanonicalJob(job = {}) {
  const errors = [];

  if (job.pipeline_name && job.pipeline_name !== PIPELINE_NAME) {
    errors.push(`canonicalJob.pipeline_name must be ${PIPELINE_NAME}`);
  }

  if (job.pipeline_stage && !PIPELINE_STAGES.includes(job.pipeline_stage)) {
    errors.push("canonicalJob.pipeline_stage is not an approved GHL stage");
  }

  if (job.property_type && !PROPERTY_TYPES.includes(job.property_type)) {
    errors.push("canonicalJob.property_type is not approved");
  }

  if (job.customer_vertical && !CUSTOMER_VERTICALS.includes(job.customer_vertical)) {
    errors.push("canonicalJob.customer_vertical is not approved");
  }

  if (job.occupancy_status && !OCCUPANCY_STATUSES.includes(job.occupancy_status)) {
    errors.push("canonicalJob.occupancy_status is not approved");
  }

  if (job.timeline && !TIMELINES.includes(job.timeline)) {
    errors.push("canonicalJob.timeline is not approved");
  }

  if (job.photo_policy_status && !PHOTO_STATUSES.includes(job.photo_policy_status)) {
    errors.push("canonicalJob.photo_policy_status is not approved");
  }

  if (job.market && normalizeMarket(job.market) !== job.market) {
    errors.push("canonicalJob.market is not an approved normalized market key");
  }

  if (job.room_count !== null && job.room_count !== undefined && (!Number.isInteger(Number(job.room_count)) || Number(job.room_count) < 0)) {
    errors.push("canonicalJob.room_count must be a non-negative integer or null");
  }

  if (job.sqft !== null && job.sqft !== undefined && !isFiniteNumber(job.sqft, 0, pricingRules.maxTotalSquareFeet)) {
    errors.push("canonicalJob.sqft must be a non-negative number within configured bounds or null");
  }

  if (job.exception_flags && !Array.isArray(job.exception_flags)) {
    errors.push("canonicalJob.exception_flags must be an array");
  }

  validateWalls(job.walls, errors);
  return errors;
}

module.exports = {
  PIPELINE_NAME,
  PIPELINE_STAGES,
  validateCanonicalJob,
};
