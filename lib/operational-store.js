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

module.exports = {
  appendOperationalEvent,
  getPool,
  normalizeCorrection,
  normalizeEvent,
  recordStateTransition,
  recordWallCorrection,
};
