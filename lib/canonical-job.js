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

  if (job.room_count !== null && job.room_count !== undefined && (!Number.isInteger(Number(job.room_count)) || Number(job.room_count) < 0)) {
    errors.push("canonicalJob.room_count must be a non-negative integer or null");
  }

  if (job.sqft !== null && job.sqft !== undefined && (!Number.isFinite(Number(job.sqft)) || Number(job.sqft) < 0)) {
    errors.push("canonicalJob.sqft must be a non-negative number or null");
  }

  if (job.exception_flags && !Array.isArray(job.exception_flags)) {
    errors.push("canonicalJob.exception_flags must be an array");
  }

  return errors;
}

module.exports = {
  PIPELINE_NAME,
  PIPELINE_STAGES,
  validateCanonicalJob,
};
