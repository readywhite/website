#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';

const inputFile = process.env.KPI_INPUT_FILE;
const now = new Date().toISOString();

function minutesBetween(start, end) {
  if (!start || !end) return null;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
  return Math.max(0, (endMs - startMs) / 60000);
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (valid.length === 0) return null;
  return Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10;
}

function loadRows() {
  if (!inputFile) return [];
  if (!existsSync(inputFile)) throw new Error(`KPI_INPUT_FILE not found: ${inputFile}`);
  const parsed = JSON.parse(readFileSync(inputFile, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error('KPI_INPUT_FILE must contain a JSON array.');
  return parsed;
}

const rows = loadRows();
const newLeads = rows.length;
const quotesSent = rows.filter((row) => row.quote_sent_at || row.stage === 'Quote Sent').length;
const jobsWon = rows.filter((row) => row.stage === 'Closed Won' || row.won_at).length;
const jobsLost = rows.filter((row) => row.stage === 'Closed Lost' || row.lost_at).length;
const scheduledJobs = rows.filter((row) => row.scheduled_at || row.stage === 'Scheduled').length;
const staleOpen = rows.filter((row) => {
  if (['Closed Won', 'Closed Lost'].includes(row.stage)) return false;
  const lastActivity = new Date(row.last_activity_at || row.updated_at || row.created_at).getTime();
  if (!Number.isFinite(lastActivity)) return false;
  return Date.now() - lastActivity > 48 * 60 * 60 * 1000;
}).length;

const responseMinutes = rows.map((row) => minutesBetween(row.created_at, row.first_response_at));
const quoteMinutes = rows.map((row) => minutesBetween(row.created_at, row.quote_sent_at));
const closed = jobsWon + jobsLost;

const report = {
  generated_at: now,
  source: inputFile || 'no KPI_INPUT_FILE provided',
  new_leads: newLeads,
  avg_response_minutes: average(responseMinutes),
  quotes_sent: quotesSent,
  avg_quote_minutes: average(quoteMinutes),
  scheduled_jobs: scheduledJobs,
  jobs_won: jobsWon,
  jobs_lost: jobsLost,
  close_rate: closed === 0 ? null : Math.round((jobsWon / closed) * 1000) / 10,
  stale_open_opportunities: staleOpen,
  sdr_follow_up_compliance: null,
  pipeline_stagnation_count: staleOpen,
  warnings: inputFile ? [] : ['Provide KPI_INPUT_FILE with exported GHL opportunities to compute live metrics.']
};

console.log(JSON.stringify(report, null, 2));
