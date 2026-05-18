const nodemailer = require('nodemailer');
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  EMAIL_FROM,
  CLIENT_URL
} = require('../config/env');
const { logger } = require('../utils/logger');

class EmailService {
  constructor() {
    this.isConfigured = !!(SMTP_USER && SMTP_PASSWORD);

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD
        }
      });
      logger.info('Email service configured');
    } else {
      logger.warn('Email service not configured - emails will be logged only');
      this.transporter = null;
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.isConfigured || !this.transporter) {
      logger.info(`[EMAIL SKIPPED] To: ${to}, Subject: ${subject}`);
      return null;
    }

    try {
      const info = await this.transporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        html
      });

      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email send failed:', error.message);
      return null;
    }
  }

  async sendGoalSubmittedEmail(employee, manager, goal) {
    const subject = `New Goal Submitted for Approval - ${employee.name}`;
    const html = `
      <h2>Goal Submitted for Approval</h2>
      <p>Dear ${manager.name},</p>
      <p><strong>${employee.name}</strong> has submitted a goal for your approval.</p>
      
      <h3>Goal Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${goal.title}</li>
        <li><strong>Thrust Area:</strong> ${goal.thrust_area}</li>
        <li><strong>Target:</strong> ${goal.target}</li>
        <li><strong>Weightage:</strong> ${goal.weightage}%</li>
      </ul>
      
      <p><a href="${CLIENT_URL}/manager/approvals" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Goal</a></p>
      
      <p>Best regards,<br/>Goal Tracker System</p>
    `;
    return await this.sendEmail(manager.email, subject, html);
  }

  async sendGoalApprovedEmail(employee, goal) {
    const subject = `Goal Approved - ${goal.title}`;
    const html = `
      <h2>Goal Approved</h2>
      <p>Dear ${employee.name},</p>
      <p>Your goal has been approved by your manager and is now locked.</p>
      
      <h3>Goal Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${goal.title}</li>
        <li><strong>Target:</strong> ${goal.target}</li>
        <li><strong>Weightage:</strong> ${goal.weightage}%</li>
      </ul>
      
      <p><a href="${CLIENT_URL}/employee/goals" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Goals</a></p>
      
      <p>Best regards,<br/>Goal Tracker System</p>
    `;
    return await this.sendEmail(employee.email, subject, html);
  }

  async sendGoalRejectedEmail(employee, goal, comment) {
    const subject = `Goal Rejected - ${goal.title}`;
    const html = `
      <h2>Goal Rejected</h2>
      <p>Dear ${employee.name},</p>
      <p>Your goal has been rejected by your manager.</p>
      
      <h3>Goal Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${goal.title}</li>
        <li><strong>Target:</strong> ${goal.target}</li>
      </ul>
      
      <h3>Manager's Comment:</h3>
      <p>${comment}</p>
      
      <p><a href="${CLIENT_URL}/employee/goals" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Goals</a></p>
      
      <p>Best regards,<br/>Goal Tracker System</p>
    `;
    return await this.sendEmail(employee.email, subject, html);
  }

  async sendGoalReturnedEmail(employee, goal, comment) {
    const subject = `Goal Returned for Rework - ${goal.title}`;
    const html = `
      <h2>Goal Returned for Rework</h2>
      <p>Dear ${employee.name},</p>
      <p>Your goal has been returned for rework by your manager.</p>
      
      <h3>Goal Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${goal.title}</li>
        <li><strong>Target:</strong> ${goal.target}</li>
      </ul>
      
      <h3>Manager's Comment:</h3>
      <p>${comment}</p>
      
      <p><a href="${CLIENT_URL}/employee/goals" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Edit Goal</a></p>
      
      <p>Best regards,<br/>Goal Tracker System</p>
    `;
    return await this.sendEmail(employee.email, subject, html);
  }

  async sendCheckInReminderEmail(employee, quarter) {
    const subject = `Reminder: ${quarter} Check-In Due`;
    const html = `
      <h2>Quarterly Check-In Reminder</h2>
      <p>Dear ${employee.name},</p>
      <p>This is a reminder to complete your <strong>${quarter}</strong> check-in.</p>
      
      <p><a href="${CLIENT_URL}/employee/checkin" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Check-In</a></p>
      
      <p>Best regards,<br/>Goal Tracker System</p>
    `;
    return await this.sendEmail(employee.email, subject, html);
  }

  async sendEscalationEmail(user, escalationType, details) {
    const subject = `Escalation: ${escalationType}`;
    const html = `
      <h2>Escalation Alert</h2>
      <p>Dear ${user.name},</p>
      <p>This is an escalation notification regarding:</p>
      
      <h3>${escalationType}</h3>
      <p>${details}</p>
      
      <p><a href="${CLIENT_URL}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Take Action</a></p>
      
      <p>Best regards,<br/>Goal Tracker System</p>
    `;
    return await this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();