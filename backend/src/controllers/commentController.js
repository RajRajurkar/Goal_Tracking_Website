const { query } = require('../config/database');

exports.getComments = async (req, res) => {
  try {
    const { goalId } = req.params;
    const result = await query(
      `SELECT c.*, u.name as user_name, u.role as user_role 
       FROM goal_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.goal_id = $1 
       ORDER BY c.created_at ASC`,
      [goalId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const result = await query(
      `INSERT INTO goal_comments (goal_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [goalId, userId, content]
    );
    
    // Fetch the inserted comment with user details to return
    const inserted = await query(
      `SELECT c.*, u.name as user_name, u.role as user_role 
       FROM goal_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(inserted.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};
