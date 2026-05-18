CREATE TABLE IF NOT EXISTS checkins (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  quarter VARCHAR(10) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  manager_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  checkin_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(goal_id, quarter)
);

CREATE INDEX idx_checkins_goal ON checkins(goal_id);
CREATE INDEX idx_checkins_quarter ON checkins(quarter);