const db = require('./src/config/database');

async function fixCycles() {
  try {
    await db.query(`
      UPDATE cycles 
      SET 
        start_date='2024-04-01', 
        end_date='2025-03-31', 
        q1_start='2024-04-01', 
        q1_end='2024-06-30', 
        q2_start='2024-07-01', 
        q2_end='2024-09-30', 
        q3_start='2024-10-01', 
        q3_end='2024-12-31', 
        q4_start='2025-01-01', 
        q4_end='2025-03-31' 
      WHERE id=1
    `);
    console.log('Cycles updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCycles();
