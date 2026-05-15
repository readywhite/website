const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");
const requiredTables = [
  "operational_events",
  "jobs",
  "walls",
  "ai_artifacts",
  "wall_corrections",
  "proof_of_work_artifacts",
  "qa_reviews",
  "operational_queue_jobs",
];

for (const table of requiredTables) {
  if (!schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
    throw new Error(`Missing operational database table: ${table}`);
  }
}

console.log(`Operational database schema check passed (${requiredTables.length} tables)`);
