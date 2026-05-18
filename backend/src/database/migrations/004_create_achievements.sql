CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  quarter VARCHAR(10) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  planned_target VARCHAR(255),
  actual_achievement VARCHAR(255),
  status VARCHAR(50) DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'ON_TRACK', 'COMPLETED', 'AT_RISK')),
  progress_score DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(goal_id, quarter)
);

CREATE INDEX idx_achievements_goal ON achievements(goal_id);
CREATE INDEX idx_achievements_quarter ON achievements(quarter);