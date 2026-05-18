CREATE TABLE IF NOT EXISTS approvals (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  manager_id INTEGER NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL CHECK (action IN ('APPROVE', 'REJECT', 'RETURN_FOR_REWORK')),
  comment TEXT,
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_goal ON approvals(goal_id);
CREATE INDEX idx_approvals_manager ON approvals(manager_id);