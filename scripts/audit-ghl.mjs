#!/usr/bin/env node

const API_BASE = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const API_VERSION = process.env.GHL_API_VERSION || '2023-02-21';
const TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.GHL_API_KEY;
const LOCATION_ID = process.env.GHL_LOCATION_ID;

const requiredPipeline = 'Ready White Customer Jobs';
const requiredForm = 'Ready White Quote Request';
const requiredWorkflows = [
  'New Website Lead Workflow',
  'Photos Needed Sequence',
  'Quote Sent Follow-Up',
  'Approved to Scheduled',
  'Completed Job Review Loop'
];
const requiredStages = [
  'New Lead',
  'Contact Attempted',
  'Photos Needed',
  'Photos Received',
  'Quote In Progress',
  'Quote Sent',
  'Follow-Up',
  'Approved',
  'Scheduled',
  'In Progress',
  'Completed',
  'Closed Won',
  'Closed Lost'
];

const results = [];

function addResult(level, area, message) {
  results.push({ level, area, message });
}

function getArray(payload, keys) {
  for (const key of keys) {
    const value = key.split('.').reduce((acc, part) => acc?.[part], payload);
    if (Array.isArray(value)) return value;
  }
  if (Array.isArray(payload)) return payload;
  return [];
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

async function ghlGet(path) {
  const url = new URL(path, API_BASE);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Version: API_VERSION,
      Accept: 'application/json'
    }
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const error = new Error(data.message || data.error || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function fetchFirst(paths, area) {
  const errors = [];
  for (const path of paths) {
    try {
      const data = await ghlGet(path);
      addResult('pass', area, `Fetched ${path}`);
      return data;
    } catch (error) {
      errors.push(`${path}: ${error.message}`);
    }
  }
  addResult('warn', area, `Could not fetch ${area}. Tried: ${errors.join(' | ')}`);
  return null;
}

function auditEnv() {
  if (!TOKEN) addResult('fail', 'env', 'Missing GHL_PRIVATE_INTEGRATION_TOKEN or GHL_API_KEY.');
  else addResult('pass', 'env', 'GHL token is present in the current shell.');

  if (!LOCATION_ID) addResult('fail', 'env', 'Missing GHL_LOCATION_ID.');
  else addResult('pass', 'env', `GHL_LOCATION_ID is set: ${LOCATION_ID}`);

  if (!process.env.GHL_PIPELINE_ID) addResult('warn', 'env', 'GHL_PIPELINE_ID is not set in this shell. Railway should have it.');
  else addResult('pass', 'env', 'GHL_PIPELINE_ID is set in this shell.');

  if (!process.env.LEAD_WEBHOOK_SECRET) addResult('warn', 'env', 'LEAD_WEBHOOK_SECRET is not set in this shell. Add it in Railway to protect inbound lead submissions.');
  else addResult('pass', 'env', 'LEAD_WEBHOOK_SECRET is configured in this shell.');
}

async function auditPipelines() {
  const data = await fetchFirst([
    `/opportunities/pipelines?locationId=${encodeURIComponent(LOCATION_ID)}`,
    `/opportunities/pipeline?locationId=${encodeURIComponent(LOCATION_ID)}`
  ], 'pipelines');
  if (!data) return;

  const pipelines = getArray(data, ['pipelines', 'data', 'results']);
  const pipeline = pipelines.find((item) => normalize(item.name) === normalize(requiredPipeline));
  if (!pipeline) {
    addResult('fail', 'pipelines', `Missing pipeline: ${requiredPipeline}`);
    return;
  }

  addResult('pass', 'pipelines', `Found pipeline: ${requiredPipeline}`);
  const stages = getArray(pipeline, ['stages']).map((stage) => stage.name || stage.title || stage.stageName);
  for (const stage of requiredStages) {
    if (stages.some((existing) => normalize(existing) === normalize(stage))) {
      addResult('pass', 'pipeline stages', `Found stage: ${stage}`);
    } else {
      addResult('warn', 'pipeline stages', `Missing recommended stage: ${stage}`);
    }
  }
}

async function auditForms() {
  const data = await fetchFirst([
    `/forms/?locationId=${encodeURIComponent(LOCATION_ID)}`,
    `/forms?locationId=${encodeURIComponent(LOCATION_ID)}`
  ], 'forms');
  if (!data) return;

  const forms = getArray(data, ['forms', 'data', 'results']);
  const form = forms.find((item) => normalize(item.name || item.title) === normalize(requiredForm));
  if (form) addResult('pass', 'forms', `Found form: ${requiredForm}`);
  else addResult('warn', 'forms', `Missing form: ${requiredForm}. If Squarespace owns the form, confirm its webhook points to Railway.`);
}

async function auditWorkflows() {
  const data = await fetchFirst([
    `/workflows/?locationId=${encodeURIComponent(LOCATION_ID)}`,
    `/workflows?locationId=${encodeURIComponent(LOCATION_ID)}`
  ], 'workflows');
  if (!data) return;

  const workflows = getArray(data, ['workflows', 'data', 'results']);
  for (const workflowName of requiredWorkflows) {
    const workflow = workflows.find((item) => normalize(item.name || item.title) === normalize(workflowName));
    if (!workflow) {
      addResult('warn', 'workflows', `Missing workflow: ${workflowName}`);
      continue;
    }

    const status = normalize(workflow.status || workflow.state || workflow.isPublished || workflow.published);
    if (status.includes('draft') || status === 'false') {
      addResult('warn', 'workflows', `Workflow may be inactive/draft: ${workflowName}`);
    } else {
      addResult('pass', 'workflows', `Found workflow: ${workflowName}`);
    }
  }
}

function printReport() {
  const order = { fail: 0, warn: 1, pass: 2 };
  results.sort((a, b) => order[a.level] - order[b.level] || a.area.localeCompare(b.area));

  console.log('# Ready White GHL Audit Report');
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log('');

  for (const result of results) {
    const icon = result.level === 'pass' ? '✅' : result.level === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} [${result.area}] ${result.message}`);
  }

  const failures = results.filter((result) => result.level === 'fail').length;
  const warnings = results.filter((result) => result.level === 'warn').length;
  console.log('');
  console.log(`Summary: ${failures} fail, ${warnings} warn, ${results.length - failures - warnings} pass`);

  if (failures > 0) process.exitCode = 1;
}

async function main() {
  auditEnv();
  if (!TOKEN || !LOCATION_ID) {
    printReport();
    return;
  }

  await auditPipelines();
  await auditForms();
  await auditWorkflows();
  printReport();
}

main().catch((error) => {
  addResult('fail', 'audit', error.stack || error.message);
  printReport();
});
