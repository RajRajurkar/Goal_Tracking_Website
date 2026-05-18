const cron = require('node-cron');
const { query } = require('../config/database');
const Cycle = require('../models/Cycle');
const emailService = require('../services/emailService');
const { logger } = require('../utils/logger');

const sendCheckInReminders = async () => {
  const activeCycle = await Cycle.findActive();
  if (!activeCycle) return;

  const currentQuarter = await Cycle.getCurrentQuarter(activeCycle.id);
  if (!currentQuarter) return;

  // Find employees who haven't updated achievements
  const result = await query(`
    SELECT DISTINCT u.id, u.name, u.email
    FROM users u
    JOIN goals g ON u.id = g.employee_id
    LEFT JOIN achievements a ON g.id = a.goal_id AND a.quarter = $2
    WHERE g.cycle_id = $1 
      AND g.is_locked = true
      AND a.id IS NULL
      AND u.is_active = true
  `, [activeCycle.id, currentQuarter.quarter]);

  for (const user of result.rows) {
    await emailService.sendCheckInReminderEmail(user, currentQuarter.quarter);
    logger.info(`Check-in reminder sent to ${user.email}`);
  }

  return result.rows.length;
};

const startReminderJobs = () => {
  // Send reminders every Monday at 10 AM
  cron.schedule('0 10 * * 1', async () => {
    logger.info('Sending check-in reminders...');
    try {
      const count = await sendCheckInReminders();
      logger.info(`Check-in reminders sent to ${count} employees`);
    } catch (error) {
      logger.error('Reminder sending failed:', error);
    }
  });
};

module.exports = { startReminderJobs, sendCheckInReminders };