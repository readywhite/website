export const NORTHSTAR = {
  mission: 'Make vacant and turnover properties rent-ready within days, not weeks.',
  primaryKpi: 'time_from_lead_submission_to_scheduled_job',
  speedStandards: {
    leadResponseMinutes: 5,
    quotePathStartMinutes: 30,
    quoteTurnaroundHours: 24,
    scheduledAfterApprovalHours: 48,
    staleOpportunityHours: 48
  }
};

export const GHL_STANDARD = {
  pipeline: 'Ready White Customer Jobs',
  stages: [
    'New Lead',
    'Photos Requested',
    'Photos Received',
    'Quote Sent',
    'Follow-Up',
    'Approved',
    'Scheduled',
    'In Progress',
    'Completed',
    'Closed Won',
    'Closed Lost'
  ],
  tags: [
    'source:squarespace',
    'source:facebook',
    'timeline:asap',
    'service:rental-repaint',
    'vacant:true',
    'lead:new',
    'lead:quoted',
    'lead:won'
  ],
  customFields: [
    'property_address',
    'property_type',
    'timeline',
    'vacant',
    'service_needed',
    'lead_source'
  ],
  workflows: [
    'New Website Lead Workflow',
    'Missed Lead Rescue',
    'Stale Pipeline Detection',
    'Photo Reminder Automation',
    'Quote Follow-Up Sequence'
  ]
};

export const REQUIRED_DOCS = [
  'docs/NORTHSTAR.md',
  'docs/GHL_OBJECT_STANDARDS.md',
  'docs/SOP/lead-intake.md',
  'docs/SOP/quote-process.md',
  'docs/SOP/follow-up.md',
  'docs/SOP/job-closeout.md',
  'docs/data/outreach.yml',
  'docs/GHL_COMPANY_OPTIMIZATION.md',
  'docs/GHL_AUDIT_RULES.md',
  'docs/GHL_ROI_CAPABILITY_REVIEW.md'
];

export function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}
