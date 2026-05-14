#!/usr/bin/env node

import { GHL_STANDARD } from './lib/ready-white-standards.mjs';

const apply = process.argv.includes('--apply') || process.env.APPLY_GHL_FIXES === 'true';

const plan = {
  generated_at: new Date().toISOString(),
  mode: apply ? 'apply-requested' : 'plan-only',
  pipeline: GHL_STANDARD.pipeline,
  required_stages: GHL_STANDARD.stages,
  required_tags: GHL_STANDARD.tags,
  required_custom_fields: GHL_STANDARD.customFields,
  required_workflows: GHL_STANDARD.workflows,
  actions: [
    'Ensure the pipeline exists with the exact standard name.',
    'Ensure stages exist in the exact order listed.',
    'Consolidate old/nonstandard stages into the standard stage names.',
    'Ensure tags use colon naming, for example source:squarespace and lead:new.',
    'Ensure required custom fields use snake_case names.',
    'Verify workflows use the exact standard names.'
  ]
};

if (apply) {
  plan.warning = 'Live GHL mutation is intentionally not performed yet. Run npm run audit:ghl first, review the plan, then apply changes in GHL UI or extend this script with confirmed endpoint IDs.';
}

console.log(JSON.stringify(plan, null, 2));
