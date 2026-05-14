#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { GHL_STANDARD, NORTHSTAR, REQUIRED_DOCS } from './lib/ready-white-standards.mjs';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  return {
    command: `${command} ${args.join(' ')}`,
    status: result.status,
    ok: result.status === 0,
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || ''
  };
}

function docStatus() {
  return REQUIRED_DOCS.map((file) => ({ file, exists: existsSync(file) }));
}

function outreachStatus() {
  const file = 'docs/data/outreach.yml';
  if (!existsSync(file)) return { file, exists: false, templates: 0 };
  const text = readFileSync(file, 'utf8');
  const templates = text.split('\n').filter((line) => /^[a-z0-9_]+:\s*$/.test(line)).length;
  return { file, exists: true, templates };
}

const check = run(process.execPath, ['scripts/check.mjs']);
const auditGhl = run(process.execPath, ['scripts/audit-ghl.mjs']);
const kpi = run(process.execPath, ['scripts/generate-kpi-report.mjs']);

const report = {
  generated_at: new Date().toISOString(),
  northstar: NORTHSTAR,
  standards: GHL_STANDARD,
  docs: docStatus(),
  outreach: outreachStatus(),
  commands: {
    check,
    audit_ghl: auditGhl,
    kpi
  },
  recommendations: [
    'Run npm run audit:ghl with real GHL credentials weekly.',
    'Set GHL_COO_USER_ID and GHL_SDR_USER_ID once user IDs are confirmed.',
    'Build Missed Lead Rescue, Stale Pipeline Detection, Photo Reminder Automation, and Quote Follow-Up Sequence in GHL.',
    'Review COO and SDR scorecards every business day.'
  ]
};

console.log(JSON.stringify(report, null, 2));

if (!check.ok) process.exitCode = 1;
