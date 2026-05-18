const cron = require('node-cron');
const escalationService = require('../services/escalationService');
const { logger } = require('../utils/logger');

const startCronJobs = () => {
  // Run escalation checks daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running daily escalation checks...');

    try {
      const noSubmissionCount = await escalationService.checkNoSubmission();
      logger.info(`No submission escalations: ${noSubmissionCount}`);

      const noApprovalCount = await escalationService.checkNoApproval();
      logger.info(`No approval escalations: ${noApprovalCount}`);

      const noCheckInCount = await escalationService.checkNoCheckIn();
      logger.info(`No check-in escalations: ${noCheckInCount}`);

      logger.info('Escalation checks completed');
    } catch (error) {
      logger.error('Escalation check failed:', error);
    }
  });

  logger.info('Cron jobs scheduled');
};

module.exports = { startCronJobs };