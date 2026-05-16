const { QUEUE_NAMES } = require("../lib/queue");
const { claimNextQueueJob, completeQueueJob, failQueueJob } = require("../lib/operational-store");
const { emitOperationalLog } = require("../lib/observability");

const queueName = process.argv[2] || "control_snapshot";

async function processQueueJob(queueJob) {
  emitOperationalLog({ event: "queue_job_processing", message: `Processing ${queueJob.queue_name}`, jobId: queueJob.job_id, metadata: { queue_job_id: queueJob.queue_job_id } });
  // Foundation worker: validates queue plumbing now. Specific queue processors can be added without changing queue contracts.
  return completeQueueJob(queueJob.queue_job_id);
}

async function main() {
  if (!QUEUE_NAMES.includes(queueName)) throw new Error(`Unknown queue: ${queueName}`);
  const claimed = await claimNextQueueJob(queueName);
  if (!claimed.persisted) {
    emitOperationalLog({ level: "warn", event: "queue_worker_no_database", message: claimed.reason, metadata: { queueName } });
    return;
  }
  if (!claimed.queueJob) {
    emitOperationalLog({ event: "queue_worker_idle", message: "No queue job available", metadata: { queueName } });
    return;
  }

  try {
    await processQueueJob(claimed.queueJob);
  } catch (error) {
    await failQueueJob(claimed.queueJob, error);
    throw error;
  }
}

main().catch((error) => {
  emitOperationalLog({ level: "error", event: "queue_worker_failed", message: error.message, metadata: { queueName } });
  process.exitCode = 1;
});
