CREATE TABLE IF NOT EXISTS goal_comments (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goal_comments_goal_id ON goal_comments(goal_id);
CREATE INDEX idx_goal_comments_created_at ON goal_comments(created_at);
