require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'goal_tracker',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@goaltracker.com',
  
  // Frontend
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Escalation settings
  ESCALATION_NO_SUBMISSION_DAYS: parseInt(process.env.ESCALATION_NO_SUBMISSION_DAYS || '7'),
  ESCALATION_NO_APPROVAL_DAYS: parseInt(process.env.ESCALATION_NO_APPROVAL_DAYS || '3'),
  ESCALATION_NO_CHECKIN_DAYS: parseInt(process.env.ESCALATION_NO_CHECKIN_DAYS || '5')
};