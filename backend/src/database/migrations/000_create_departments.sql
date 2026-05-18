-- Run this BEFORE 001_create_users.sql
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default departments
INSERT INTO departments (name) VALUES
  ('Sales'),
  ('Engineering'),
  ('Marketing'),
  ('Human Resources'),
  ('Operations')
ON CONFLICT (name) DO NOTHING;