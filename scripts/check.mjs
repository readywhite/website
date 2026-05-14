#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { REQUIRED_DOCS, GHL_STANDARD } from './lib/ready-white-standards.mjs';

const checks = [];

function addCheck(ok, label, detail = '') {
  checks.push({ ok, label, detail });
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  addCheck(result.status === 0, `${command} ${args.join(' ')}`, result.stderr || result.stdout);
}

run(process.execPath, ['--check', 'server.js']);
run(process.execPath, ['--check', 'scripts/audit-ghl.mjs']);
run(process.execPath, ['--check', 'scripts/full-company-audit.mjs']);
run(process.execPath, ['--check', 'scripts/fix-pipeline.mjs']);
run(process.execPath, ['--check', 'scripts/generate-kpi-report.mjs']);

try {
  JSON.parse(readFileSync('package.json', 'utf8'));
  addCheck(true, 'package.json parses');
} catch (error) {
  addCheck(false, 'package.json parses', error.message);
}

for (const file of REQUIRED_DOCS) {
  addCheck(existsSync(file), `required doc exists: ${file}`);
}

const standardsDoc = readFileSync('docs/GHL_OBJECT_STANDARDS.md', 'utf8');
addCheck(standardsDoc.includes(GHL_STANDARD.pipeline), 'standards doc includes pipeline name');
for (const stage of GHL_STANDARD.stages) {
  addCheck(standardsDoc.includes(stage), `standards doc includes stage: ${stage}`);
}
for (const tag of GHL_STANDARD.tags) {
  addCheck(standardsDoc.includes(tag), `standards doc includes tag: ${tag}`);
}

const failures = checks.filter((check) => !check.ok);
for (const check of checks) {
  const icon = check.ok ? '✅' : '❌';
  console.log(`${icon} ${check.label}`);
  if (!check.ok && check.detail) console.log(check.detail.trim());
}

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} checks passed.`);
