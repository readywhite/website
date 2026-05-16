const QUEUE_NAMES = [
  "photo_estimation",
  "crm_sync",
  "vendor_dispatch",
  "proof_review",
  "control_snapshot",
];

const QUEUE_STATUSES = ["queued", "processing", "completed", "failed", "dead_letter"];

function normalizeQueueJob(input = {}) {
  const queueName = String(input.queue_name || input.queueName || "").trim();
  const payload = input.payload && typeof input.payload === "object" && !Array.isArray(input.payload) ? input.payload : {};
  const maxAttempts = Math.max(1, Math.min(10, Math.round(Number(input.max_attempts || input.maxAttempts || 3))));

  if (!QUEUE_NAMES.includes(queueName)) {
    throw new Error(`queue_name must be one of: ${QUEUE_NAMES.join(", ")}`);
  }

  return {
    queue_name: queueName,
    job_id: input.job_id || input.jobId || null,
    payload,
    status: QUEUE_STATUSES.includes(input.status) ? input.status : "queued",
    attempts: Math.max(0, Math.round(Number(input.attempts || 0))),
    max_attempts: maxAttempts,
    available_at: input.available_at || input.availableAt || new Date().toISOString(),
  };
}

function nextQueueStatus({ attempts = 0, max_attempts: maxAttempts = 3, error = null }) {
  if (!error) return "completed";
  return attempts + 1 >= maxAttempts ? "dead_letter" : "failed";
}

module.exports = {
  QUEUE_NAMES,
  QUEUE_STATUSES,
  nextQueueStatus,
  normalizeQueueJob,
};
