CREATE TABLE IF NOT EXISTS escalations (
  id SERIAL PRIMARY KEY,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('NO_SUBMISSION', 'NO_APPROVAL', 'NO_CHECKIN')),
  entity_id INTEGER,
  user_id INTEGER NOT NULL REFERENCES users(id),
  escalation_level INTEGER DEFAULT 1,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolution_notes TEXT
);

CREATE INDEX idx_escalations_user ON escalations(user_id);
CREATE INDEX idx_escalations_type ON escalations(rule_type);
CREATE INDEX idx_escalations_resolved ON escalations(resolved_at);