const fs = require("fs");
const path = require("path");

const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config", "ai-eval-fixtures.json"), "utf8"));
let failures = 0;

for (const fixture of fixtures.fixtures) {
  const output = fixture.normalizedOutput;
  const flags = new Set((output.walls || []).flatMap((wall) => wall.exceptionFlags || []));
  const manualReviewRequired = output.confidence < 0.75 || flags.size > 0;
  const damageTier = output.damageTier;
  const expected = fixture.expected;

  if (expected.manualReviewRequired !== undefined && manualReviewRequired !== expected.manualReviewRequired) failures += 1;
  if (expected.damageTier && damageTier !== expected.damageTier) failures += 1;
  if (expected.exceptionFlag && !flags.has(expected.exceptionFlag)) failures += 1;
}

console.log(JSON.stringify({ ok: failures === 0, fixtureCount: fixtures.fixtures.length, failures }, null, 2));
if (failures > 0) process.exitCode = 1;
