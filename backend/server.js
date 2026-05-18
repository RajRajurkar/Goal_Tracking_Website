const http = require('http');
const app = require('./src/app');
const { logger } = require('./src/utils/logger');
const { PORT, NODE_ENV } = require('./src/config/env');
const { testConnection } = require('./src/config/database');
const { startCronJobs } = require('./src/jobs/escalationCron');
const websocketService = require('./src/services/websocketService');

const server = http.createServer(app);

testConnection()
  .then(() => {
    logger.info('Database connected successfully');

    // Initialize WebSocket
    websocketService.initialize(server);
    logger.info('WebSocket server initialized');

    if (NODE_ENV === 'production') {
      startCronJobs();
      logger.info('Cron jobs started');
    }

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`REST API: http://localhost:${PORT}/api`);
      logger.info(`WebSocket: ws://localhost:${PORT}/ws`);
    });
  })
  .catch((err) => {
    logger.error('Database connection failed:', err);
    process.exit(1);
  });

process.on('SIGTERM', () => {
  server.close(() => {
    logger.info('Server closed gracefully');
    process.exit(0);
  });
});