CREATE TABLE IF NOT EXISTS cycles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  q1_start DATE,
  q1_end DATE,
  q2_start DATE,
  q2_end DATE,
  q3_start DATE,
  q3_end DATE,
  q4_start DATE,
  q4_end DATE,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cycles_active ON cycles(is_active);