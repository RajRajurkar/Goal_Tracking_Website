const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { logger } = require('../utils/logger');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> Set of WebSocket connections
  }

  initialize(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws',
      verifyClient: (info, callback) => {
        try {
          const url = new URL(info.req.url, 'http://localhost');
          const token = url.searchParams.get('token');

          if (!token) {
            callback(false, 401, 'Unauthorized');
            return;
          }

          const decoded = jwt.verify(token, JWT_SECRET);
          info.req.userId = decoded.id;
          info.req.userRole = decoded.role;
          callback(true);
        } catch (error) {
          callback(false, 401, 'Invalid token');
        }
      }
    });

    this.wss.on('connection', (ws, req) => {
      const userId = req.userId;

      // Register client
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId).add(ws);

      logger.info(`WebSocket connected: User ${userId}`);

      // Send connection confirmation
      this.sendToUser(userId, {
        type: 'CONNECTED',
        message: 'Real-time connection established',
        timestamp: new Date().toISOString()
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(userId, message);
        } catch (error) {
          logger.error('WebSocket message parse error:', error);
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        this.clients.get(userId)?.delete(ws);
        if (this.clients.get(userId)?.size === 0) {
          this.clients.delete(userId);
        }
        logger.info(`WebSocket disconnected: User ${userId}`);
      });

      // Ping to keep alive
      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });
    });

    // Heartbeat interval
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    logger.info('WebSocket server initialized');
  }

  handleMessage(userId, message) {
    switch (message.type) {
      case 'PING':
        this.sendToUser(userId, { type: 'PONG' });
        break;
      default:
        break;
    }
  }

  sendToUser(userId, data) {
    const userConnections = this.clients.get(parseInt(userId));
    if (!userConnections) return;

    const message = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    });

    userConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  broadcastToRole(role, data, excludeUserId = null) {
    this.clients.forEach((connections, userId) => {
      if (excludeUserId && userId === excludeUserId) return;
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            ...data,
            timestamp: new Date().toISOString()
          }));
        }
      });
    });
  }

  // Event emitters for different actions
  notifyGoalSubmitted(managerId, employeeId, goal) {
    this.sendToUser(managerId, {
      type: 'GOAL_SUBMITTED',
      title: 'New Goal Pending Approval',
      message: `A team member submitted a goal: "${goal.title}"`,
      data: { goal_id: goal.id },
      variant: 'warning'
    });
  }

  notifyGoalApproved(employeeId, goal) {
    this.sendToUser(employeeId, {
      type: 'GOAL_APPROVED',
      title: 'Goal Approved! 🎉',
      message: `Your goal "${goal.title}" has been approved`,
      data: { goal_id: goal.id },
      variant: 'success'
    });
  }

  notifyGoalRejected(employeeId, goal, comment) {
    this.sendToUser(employeeId, {
      type: 'GOAL_REJECTED',
      title: 'Goal Needs Attention',
      message: `Your goal "${goal.title}" was rejected`,
      data: { goal_id: goal.id, comment },
      variant: 'danger'
    });
  }

  notifyCheckInRequired(employeeId, quarter) {
    this.sendToUser(employeeId, {
      type: 'CHECKIN_REMINDER',
      title: `${quarter} Check-In Due`,
      message: 'Please update your goal achievements',
      data: { quarter },
      variant: 'info'
    });
  }

  notifyAchievementUpdated(managerId, employeeId, goal) {
    this.sendToUser(managerId, {
      type: 'ACHIEVEMENT_UPDATED',
      title: 'Team Member Updated Progress',
      message: `Progress updated for: "${goal.title}"`,
      data: { goal_id: goal.id, employee_id: employeeId },
      variant: 'info'
    });
  }
}

module.exports = new WebSocketService();