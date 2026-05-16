const fs = require("fs");
const { normalizeEvent } = require("../lib/operational-store");
const { assertTransition } = require("../lib/state-machine");

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/replay-events.js <events.json>");
  process.exit(1);
}

const events = JSON.parse(fs.readFileSync(filePath, "utf8"));
const normalized = (Array.isArray(events) ? events : events.events || []).map(normalizeEvent);
const stateByJob = new Map();

for (const event of normalized) {
  if (event.event_type.startsWith("state_transitioned:")) {
    const { fromState, toState } = event.payload;
    const jobKey = event.job_id || event.aggregate_id;
    const currentState = stateByJob.get(jobKey) || fromState;
    if (currentState !== fromState) {
      throw new Error(`Replay chain mismatch for ${jobKey}: expected ${currentState}, event declared ${fromState}`);
    }
    assertTransition(fromState, toState);
    stateByJob.set(jobKey, toState);
  }
}

console.log(JSON.stringify({ ok: true, eventCount: normalized.length, finalStates: Object.fromEntries(stateByJob) }, null, 2));
