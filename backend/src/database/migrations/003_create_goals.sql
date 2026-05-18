CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id INTEGER NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  thrust_area VARCHAR(255) NOT NULL,
  uom_type VARCHAR(50) NOT NULL CHECK (uom_type IN ('MIN', 'MAX', 'TIMELINE', 'ZERO')),
  target VARCHAR(255) NOT NULL,
  weightage INTEGER NOT NULL CHECK (weightage >= 10 AND weightage <= 100),
  status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'LOCKED')),
  is_shared BOOLEAN DEFAULT false,
  shared_parent_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
  is_locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMP,
  locked_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_employee ON goals(employee_id);
CREATE INDEX idx_goals_cycle ON goals(cycle_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_shared_parent ON goals(shared_parent_id);