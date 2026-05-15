const { Pool } = require("pg");
const { randomUUID } = require("crypto");
const { assertTransition } = require("./state-machine");

const EVENT_TYPES = new Set([
  "job_created",
  "photo_captured",
  "ai_artifact_recorded",
  "wall_estimate_corrected",
  "proof_of_work_submitted",
  "qa_review_recorded",
  "vendor_assigned",
  "pricing_snapshot_recorded",
  "control_anomaly_detected",
  "queue_job_created",
  "queue_job_failed",
  "queue_job_completed",
]);

let pool;

function getDatabaseUrl() {
  return process.env.DATABASE_URL && process.env.DATABASE_URL.trim();
}

function getPool() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl });
  }
  return pool;
}

function requireObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fieldName} must be an object`);
  }
  return value;
}

function normalizeEvent(event) {
  requireObject(event, "event");
  const eventType = String(event.event_type || event.eventType || "").trim();
  const aggregateType = String(event.aggregate_type || event.aggregateType || "").trim();
  const aggregateId = String(event.aggregate_id || event.aggregateId || "").trim();

  if (!eventType) throw new Error("event_type is required");
  if (!EVENT_TYPES.has(eventType) && !eventType.startsWith("state_transitioned:")) {
    throw new Error(`Unsupported operational event type: ${eventType}`);
  }
  if (!aggregateType) throw new Error("aggregate_type is required");
  if (!aggregateId) throw new Error("aggregate_id is required");

  return {
    event_id: event.event_id || event.eventId || randomUUID(),
    event_type: eventType,
    aggregate_type: aggregateType,
    aggregate_id: aggregateId,
    job_id: event.job_id || event.jobId || null,
    wall_id: event.wall_id || event.wallId || null,
    actor_id: event.actor_id || event.actorId || null,
    actor_type: event.actor_type || event.actorType || "system",
    payload: requireObject(event.payload || {}, "payload"),
    metadata: requireObject(event.metadata || {}, "metadata"),
    occurred_at: event.occurred_at || event.occurredAt || new Date().toISOString(),
  };
}

async function appendOperationalEvent(event) {
  const normalized = normalizeEvent(event);
  const db = getPool();

  if (!db) {
    return {
      persisted: false,
      reason: "DATABASE_URL is not configured; event validated but not stored",
      event: normalized,
    };
  }

  await db.query(
    `INSERT INTO operational_events
      (event_id, event_type, aggregate_type, aggregate_id, job_id, wall_id, actor_id, actor_type, payload, metadata, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11)`,
    [
      normalized.event_id,
      normalized.event_type,
      normalized.aggregate_type,
      normalized.aggregate_id,
      normalized.job_id,
      normalized.wall_id,
      normalized.actor_id,
      normalized.actor_type,
      JSON.stringify(normalized.payload),
      JSON.stringify(normalized.metadata),
      normalized.occurred_at,
    ],
  );

  return { persisted: true, event: normalized };
}

function normalizeCorrection(input) {
  const correction = requireObject(input, "correction");
  const jobId = String(correction.job_id || correction.jobId || "").trim();
  const wallId = String(correction.wall_id || correction.wallId || "").trim();
  const operatorId = String(correction.operator_id || correction.operatorId || "").trim();
  const reason = String(correction.reason || "").trim();

  if (!jobId) throw new Error("job_id is required");
  if (!wallId) throw new Error("wall_id is required");
  if (!operatorId) throw new Error("operator_id is required");
  if (!reason) throw new Error("reason is required");

  return {
    correction_id: correction.correction_id || correction.correctionId || randomUUID(),
    job_id: jobId,
    wall_id: wallId,
    operator_id: operatorId,
    reason,
    original_values: requireObject(correction.original_values || correction.originalValues || {}, "original_values"),
    corrected_values: requireObject(correction.corrected_values || correction.correctedValues || {}, "corrected_values"),
  };
}

async function recordWallCorrection(correction) {
  const normalized = normalizeCorrection(correction);
  const db = getPool();

  if (db) {
    await db.query(
      `INSERT INTO wall_corrections
        (correction_id, job_id, wall_id, operator_id, reason, original_values, corrected_values)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)`,
      [
        normalized.correction_id,
        normalized.job_id,
        normalized.wall_id,
        normalized.operator_id,
        normalized.reason,
        JSON.stringify(normalized.original_values),
        JSON.stringify(normalized.corrected_values),
      ],
    );
  }

  const eventResult = await appendOperationalEvent({
    event_type: "wall_estimate_corrected",
    aggregate_type: "wall",
    aggregate_id: `${normalized.job_id}:${normalized.wall_id}`,
    job_id: normalized.job_id,
    wall_id: normalized.wall_id,
    actor_id: normalized.operator_id,
    actor_type: "operator",
    payload: normalized,
    metadata: { correction_id: normalized.correction_id },
  });

  return {
    persisted: Boolean(db) && eventResult.persisted,
    correction: normalized,
    event: eventResult.event,
    reason: db ? undefined : "DATABASE_URL is not configured; correction validated but not stored",
  };
}

async function recordStateTransition({ jobId, fromState, toState, actorId, metadata = {} }) {
  const transition = assertTransition(fromState, toState);
  return appendOperationalEvent({
    event_type: transition.eventType,
    aggregate_type: "job",
    aggregate_id: jobId,
    job_id: jobId,
    actor_id: actorId || null,
    actor_type: actorId ? "operator" : "system",
    payload: transition,
    metadata,
  });
}

async function recordAiArtifact(artifact = {}) {
  const db = getPool();
  const normalized = {
    job_id: artifact.job_id || artifact.jobId || null,
    wall_id: artifact.wall_id || artifact.wallId || null,
    prompt_version: artifact.prompt_version || artifact.promptVersion || "unknown",
    model_version: artifact.model_version || artifact.modelVersion || "unknown",
    pricing_rules_version: artifact.pricing_rules_version || artifact.pricingRulesVersion || "unknown",
    raw_response: requireObject(artifact.raw_response || artifact.rawResponse || {}, "raw_response"),
    normalized_output: requireObject(artifact.normalized_output || artifact.normalizedOutput || {}, "normalized_output"),
    confidence: Number.isFinite(Number(artifact.confidence)) ? Number(artifact.confidence) : null,
  };

  if (db) {
    await db.query(
      `INSERT INTO ai_artifacts
        (job_id, wall_id, prompt_version, model_version, pricing_rules_version, raw_response, normalized_output, confidence)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8)`,
      [
        normalized.job_id,
        normalized.wall_id,
        normalized.prompt_version,
        normalized.model_version,
        normalized.pricing_rules_version,
        JSON.stringify(normalized.raw_response),
        JSON.stringify(normalized.normalized_output),
        normalized.confidence,
      ],
    );
  }

  const eventResult = await appendOperationalEvent({
    event_type: "ai_artifact_recorded",
    aggregate_type: normalized.wall_id ? "wall" : "job",
    aggregate_id: normalized.wall_id ? `${normalized.job_id}:${normalized.wall_id}` : normalized.job_id || "unknown_job",
    job_id: normalized.job_id,
    wall_id: normalized.wall_id,
    payload: normalized,
    metadata: { prompt_version: normalized.prompt_version, model_version: normalized.model_version },
  });

  return { persisted: Boolean(db) && eventResult.persisted, artifact: normalized, event: eventResult.event };
}

async function enqueueOperationalJob(queueJob) {
  const { normalizeQueueJob } = require("./queue");
  const normalized = normalizeQueueJob(queueJob);
  const db = getPool();

  if (db) {
    const result = await db.query(
      `INSERT INTO operational_queue_jobs (queue_name, job_id, payload, status, attempts, max_attempts, available_at)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)
       RETURNING queue_job_id`,
      [normalized.queue_name, normalized.job_id, JSON.stringify(normalized.payload), normalized.status, normalized.attempts, normalized.max_attempts, normalized.available_at],
    );
    normalized.queue_job_id = result.rows[0].queue_job_id;
  }

  const eventResult = await appendOperationalEvent({
    event_type: "queue_job_created",
    aggregate_type: "queue_job",
    aggregate_id: normalized.queue_job_id || `${normalized.queue_name}:${normalized.job_id || "pending"}`,
    job_id: normalized.job_id,
    payload: normalized,
    metadata: { queue_name: normalized.queue_name },
  });

  return { persisted: Boolean(db) && eventResult.persisted, queueJob: normalized, event: eventResult.event };
}

async function claimNextQueueJob(queueName) {
  const db = getPool();
  if (!db) return { persisted: false, queueJob: null, reason: "DATABASE_URL is not configured" };
  const result = await db.query(
    `UPDATE operational_queue_jobs
       SET status = 'processing', locked_at = now(), updated_at = now()
     WHERE queue_job_id = (
       SELECT queue_job_id FROM operational_queue_jobs
       WHERE queue_name = $1 AND status IN ('queued', 'failed') AND available_at <= now()
       ORDER BY available_at ASC, created_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT 1
     )
     RETURNING *`,
    [queueName],
  );
  return { persisted: true, queueJob: result.rows[0] || null };
}

async function completeQueueJob(queueJobId) {
  const db = getPool();
  if (!db) return { persisted: false, reason: "DATABASE_URL is not configured" };
  await db.query(
    `UPDATE operational_queue_jobs SET status = 'completed', updated_at = now() WHERE queue_job_id = $1`,
    [queueJobId],
  );
  return appendOperationalEvent({
    event_type: "queue_job_completed",
    aggregate_type: "queue_job",
    aggregate_id: queueJobId,
    payload: { queue_job_id: queueJobId },
  });
}

async function failQueueJob(queueJob, error) {
  const { nextQueueStatus } = require("./queue");
  const db = getPool();
  if (!db) return { persisted: false, reason: "DATABASE_URL is not configured" };
  const status = nextQueueStatus({ attempts: queueJob.attempts, max_attempts: queueJob.max_attempts, error });
  await db.query(
    `UPDATE operational_queue_jobs
       SET status = $1, attempts = attempts + 1, last_error = $2, locked_at = null, updated_at = now()
     WHERE queue_job_id = $3`,
    [status, String(error.message || error), queueJob.queue_job_id],
  );
  return appendOperationalEvent({
    event_type: "queue_job_failed",
    aggregate_type: "queue_job",
    aggregate_id: queueJob.queue_job_id,
    job_id: queueJob.job_id,
    payload: { queue_job_id: queueJob.queue_job_id, status, error: String(error.message || error) },
  });
}

async function listDeadLetterJobs(limit = 25) {
  const db = getPool();
  if (!db) return { persisted: false, jobs: [], reason: "DATABASE_URL is not configured" };
  const result = await db.query(
    `SELECT * FROM operational_queue_jobs WHERE status = 'dead_letter' ORDER BY updated_at DESC LIMIT $1`,
    [Math.max(1, Math.min(100, Number(limit) || 25))],
  );
  return { persisted: true, jobs: result.rows };
}

module.exports = {
  appendOperationalEvent,
  claimNextQueueJob,
  completeQueueJob,
  enqueueOperationalJob,
  failQueueJob,
  getPool,
  listDeadLetterJobs,
  normalizeCorrection,
  normalizeEvent,
  recordAiArtifact,
  recordStateTransition,
  recordWallCorrection,
};
