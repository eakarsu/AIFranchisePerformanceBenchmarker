CREATE TABLE IF NOT EXISTS performance_cycles (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, name TEXT NOT NULL,
  peer_group_definition JSONB NOT NULL DEFAULT '{}'::jsonb, status TEXT NOT NULL DEFAULT 'draft',
  created_by BIGINT NOT NULL, version INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT performance_cycle_status CHECK (status IN ('draft','review','approved','in_progress','verified','closed'))
);
CREATE TABLE IF NOT EXISTS normalized_performance_metrics (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, cycle_id BIGINT NOT NULL REFERENCES performance_cycles(id), unit_id TEXT NOT NULL,
  metric_key TEXT NOT NULL, value NUMERIC NOT NULL, unit TEXT NOT NULL, period_start TIMESTAMPTZ NOT NULL, period_end TIMESTAMPTZ NOT NULL,
  source_system TEXT NOT NULL, source_record_id TEXT NOT NULL, idempotency_key TEXT NOT NULL, ingested_by BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, source_system, source_record_id, metric_key), UNIQUE (tenant_id, idempotency_key)
);
CREATE TABLE IF NOT EXISTS franchise_action_plans (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, cycle_id BIGINT NOT NULL REFERENCES performance_cycles(id), unit_id TEXT NOT NULL,
  title TEXT NOT NULL, assumption_notes TEXT NOT NULL, owner_user_id BIGINT NOT NULL, due_at TIMESTAMPTZ NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb, version INTEGER NOT NULL DEFAULT 1, created_by BIGINT NOT NULL, approved_by BIGINT, approved_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS franchise_integration_runs (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, provider TEXT NOT NULL, cursor_value TEXT, status TEXT NOT NULL,
  records_received INTEGER NOT NULL DEFAULT 0, error_code TEXT, error_message TEXT, started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), completed_at TIMESTAMPTZ,
  CONSTRAINT franchise_integration_status CHECK (status IN ('running','succeeded','failed','partial'))
);
CREATE TABLE IF NOT EXISTS franchise_audit_events (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, actor_user_id BIGINT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
  before_state JSONB, after_state JSONB, request_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS franchise_metric_cycle_idx ON normalized_performance_metrics(tenant_id, cycle_id, metric_key);
CREATE INDEX IF NOT EXISTS franchise_action_cycle_idx ON franchise_action_plans(tenant_id, cycle_id, status);
