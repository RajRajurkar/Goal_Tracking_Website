module.exports = {
  // User Roles
  ROLES: {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    EMPLOYEE: 'EMPLOYEE'
  },

  // Goal UoM Types
  UOM_TYPES: {
    MIN: 'MIN',      // Higher is better
    MAX: 'MAX',      // Lower is better
    TIMELINE: 'TIMELINE',
    ZERO: 'ZERO'     // Zero is success
  },

  // Goal Status
  GOAL_STATUS: {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    LOCKED: 'LOCKED'
  },

  // Achievement Status
  ACHIEVEMENT_STATUS: {
    NOT_STARTED: 'NOT_STARTED',
    ON_TRACK: 'ON_TRACK',
    COMPLETED: 'COMPLETED',
    AT_RISK: 'AT_RISK'
  },

  // Approval Actions
  APPROVAL_ACTIONS: {
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    RETURN_FOR_REWORK: 'RETURN_FOR_REWORK'
  },

  // Quarters
  QUARTERS: {
    Q1: 'Q1',
    Q2: 'Q2',
    Q3: 'Q3',
    Q4: 'Q4'
  },

  // Thrust Areas
  THRUST_AREAS: [
    'Revenue Growth',
    'Customer Satisfaction',
    'Operational Excellence',
    'Innovation',
    'Team Development',
    'Cost Optimization',
    'Quality Improvement',
    'Market Expansion'
  ],

  // Validation Rules
  VALIDATION: {
    TOTAL_WEIGHTAGE: 100,
    MIN_WEIGHTAGE_PER_GOAL: 10,
    MAX_GOALS_PER_EMPLOYEE: 8,
    MIN_GOALS_PER_EMPLOYEE: 1
  },

  // Escalation Types
  ESCALATION_TYPES: {
    NO_SUBMISSION: 'NO_SUBMISSION',
    NO_APPROVAL: 'NO_APPROVAL',
    NO_CHECKIN: 'NO_CHECKIN'
  }
};