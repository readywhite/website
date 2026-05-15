const { listDeadLetterJobs } = require("../lib/operational-store");

async function main() {
  const result = await listDeadLetterJobs(process.argv[2] || 25);
  console.log(JSON.stringify(result, null, 2));
  if (result.jobs && result.jobs.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
