-- Ready White operational source-of-truth schema for Railway Postgres.
-- GoHighLevel remains CRM/workflow; Postgres stores operational memory, audit history, and replayable events.

CREATE TABLE IF NOT EXISTS operational_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  job_id TEXT,
  wall_id TEXT,
  actor_id TEXT,
  actor_type TEXT NOT NULL DEFAULT 'system',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operational_events_aggregate ON operational_events (aggregate_type, aggregate_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_operational_events_job_wall ON operational_events (job_id, wall_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_operational_events_type ON operational_events (event_type, occurred_at);

CREATE TABLE IF NOT EXISTS jobs (
  job_id TEXT PRIMARY KEY,
  ghl_contact_id TEXT,
  ghl_opportunity_id TEXT,
  market TEXT NOT NULL DEFAULT 'default',
  current_state TEXT NOT NULL DEFAULT 'NEW_LEAD',
  pipeline_stage TEXT NOT NULL DEFAULT 'New Lead',
  customer_vertical TEXT,
  property_type TEXT,
  occupancy_status TEXT,
  pricing_rules_version TEXT,
  price_to_customer_cents INTEGER,
  vendor_buy_rate_cents INTEGER,
  gross_margin_cents INTEGER,
  manual_review_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS walls (
  wall_id TEXT NOT NULL,
  job_id TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
  photo_id TEXT,
  estimated_sqft INTEGER,
  corrected_sqft INTEGER,
  estimated_damage_tier TEXT,
  corrected_damage_tier TEXT,
  wall_type TEXT,
  complexity_score NUMERIC(4, 3),
  confidence NUMERIC(4, 3),
  manual_review_required BOOLEAN NOT NULL DEFAULT true,
  exception_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (job_id, wall_id)
);

CREATE TABLE IF NOT EXISTS ai_artifacts (
  artifact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT REFERENCES jobs(job_id) ON DELETE CASCADE,
  wall_id TEXT,
  prompt_version TEXT NOT NULL,
  model_version TEXT NOT NULL,
  pricing_rules_version TEXT NOT NULL,
  raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  normalized_output JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(4, 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wall_corrections (
  correction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  wall_id TEXT NOT NULL,
  operator_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  original_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  corrected_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS proof_of_work_artifacts (
  proof_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  wall_id TEXT,
  vendor_id TEXT,
  artifact_type TEXT NOT NULL,
  artifact_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  review_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS qa_reviews (
  qa_review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  wall_id TEXT,
  reviewer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  callback_risk TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS operational_queue_jobs (
  queue_job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_name TEXT NOT NULL,
  job_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operational_queue_available ON operational_queue_jobs (queue_name, status, available_at);
