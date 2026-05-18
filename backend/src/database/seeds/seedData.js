const { query } = require('../../config/database');
const bcrypt = require('bcryptjs');
const { logger } = require('../../utils/logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Departments should already exist from migration 000
    // Just verify they exist
    const deptCheck = await query('SELECT COUNT(*) as count FROM departments');
    if (parseInt(deptCheck.rows[0].count) === 0) {
      await query(`
        INSERT INTO departments (name) VALUES
          ('Sales'),
          ('Engineering'),
          ('Marketing'),
          ('Human Resources'),
          ('Operations')
      `);
      logger.info('Departments created');
    } else {
      logger.info('Departments already exist, skipping');
    }

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Admin user
    await query(`
      INSERT INTO users (email, password_hash, name, role, department_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@company.com', hashedPassword, 'System Admin', 'ADMIN', 4]);

    // Get or create managers
    const getOrCreateManager = async (email, name, deptId) => {
      const existing = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      if (existing.rows.length > 0) {
        return existing.rows[0].id;
      }
      const result = await query(`
        INSERT INTO users (email, password_hash, name, role, department_id)
        VALUES ($1, $2, $3, 'MANAGER', $4)
        RETURNING id
      `, [email, hashedPassword, name, deptId]);
      return result.rows[0].id;
    };

    const manager1Id = await getOrCreateManager(
      'manager1@company.com', 'Sarah Johnson', 1
    );
    const manager2Id = await getOrCreateManager(
      'manager2@company.com', 'Michael Chen', 2
    );
    const manager3Id = await getOrCreateManager(
      'manager3@company.com', 'Emily Davis', 3
    );

    logger.info('Managers created');

    // Employees under manager 1
    const employees1 = [
      { email: 'employee1@company.com', name: 'John Smith' },
      { email: 'employee2@company.com', name: 'Alice Williams' },
      { email: 'employee3@company.com', name: 'Robert Brown' },
      { email: 'employee4@company.com', name: 'Jennifer Garcia' },
    ];

    for (const emp of employees1) {
      await query(`
        INSERT INTO users (email, password_hash, name, role, department_id, manager_id)
        VALUES ($1, $2, $3, 'EMPLOYEE', 1, $4)
        ON CONFLICT (email) DO NOTHING
      `, [emp.email, hashedPassword, emp.name, manager1Id]);
    }

    // Employees under manager 2
    const employees2 = [
      { email: 'employee5@company.com', name: 'David Martinez' },
      { email: 'employee6@company.com', name: 'Lisa Anderson' },
      { email: 'employee7@company.com', name: 'James Taylor' },
      { email: 'employee8@company.com', name: 'Maria Rodriguez' },
    ];

    for (const emp of employees2) {
      await query(`
        INSERT INTO users (email, password_hash, name, role, department_id, manager_id)
        VALUES ($1, $2, $3, 'EMPLOYEE', 2, $4)
        ON CONFLICT (email) DO NOTHING
      `, [emp.email, hashedPassword, emp.name, manager2Id]);
    }

    // Employees under manager 3
    const employees3 = [
      { email: 'employee9@company.com', name: 'Christopher Lee' },
      { email: 'employee10@company.com', name: 'Amanda Wilson' },
      { email: 'employee11@company.com', name: 'Daniel Moore' },
      { email: 'employee12@company.com', name: 'Jessica Thomas' },
    ];

    for (const emp of employees3) {
      await query(`
        INSERT INTO users (email, password_hash, name, role, department_id, manager_id)
        VALUES ($1, $2, $3, 'EMPLOYEE', 3, $4)
        ON CONFLICT (email) DO NOTHING
      `, [emp.email, hashedPassword, emp.name, manager3Id]);
    }

    logger.info('Employees created');

    // Create active cycle (if not exists)
    const existingCycle = await query(
      'SELECT id FROM cycles WHERE name = $1',
      ['FY 2024-25']
    );

    let cycleId;
    if (existingCycle.rows.length > 0) {
      cycleId = existingCycle.rows[0].id;
      logger.info(`Cycle already exists with ID: ${cycleId}`);
    } else {
      const cycleResult = await query(`
        INSERT INTO cycles (
          name, start_date, end_date, is_active,
          q1_start, q1_end,
          q2_start, q2_end,
          q3_start, q3_end,
          q4_start, q4_end
        ) VALUES (
          'FY 2024-25',
          '2024-05-01', '2025-04-30', true,
          '2024-07-01', '2024-07-31',
          '2024-10-01', '2024-10-31',
          '2025-01-01', '2025-01-31',
          '2025-03-01', '2025-04-30'
        )
        RETURNING id
      `);
      cycleId = cycleResult.rows[0].id;
      logger.info(`Cycle created with ID: ${cycleId}`);
    }

    // Create sample goals for first employee
    const employee1 = await query(
      'SELECT id FROM users WHERE email = $1',
      ['employee1@company.com']
    );

    if (employee1.rows.length > 0) {
      const employeeId = employee1.rows[0].id;

      // Check if goals already exist
      const existingGoals = await query(
        'SELECT COUNT(*) as count FROM goals WHERE employee_id = $1 AND cycle_id = $2',
        [employeeId, cycleId]
      );

      if (parseInt(existingGoals.rows[0].count) === 0) {
        // Goal 1 - Approved & Locked
        const goal1 = await query(`
          INSERT INTO goals (
            employee_id, cycle_id, title, description, thrust_area,
            uom_type, target, weightage, status, is_locked, locked_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'LOCKED', true, CURRENT_TIMESTAMP)
          RETURNING id
        `, [
          employeeId, cycleId,
          'Increase Sales Revenue by 20%',
          'Achieve 20% growth in quarterly sales revenue',
          'Revenue Growth', 'MIN', '1200000', 30
        ]);

        // Add achievements for goal 1
        await query(`
          INSERT INTO achievements (goal_id, quarter, planned_target, actual_achievement, status, progress_score)
          VALUES 
            ($1, 'Q1', '300000', '350000', 'COMPLETED', 116.67),
            ($1, 'Q2', '300000', '280000', 'ON_TRACK', 93.33)
          ON CONFLICT (goal_id, quarter) DO NOTHING
        `, [goal1.rows[0].id]);

        // Goal 2 - Approved & Locked
        await query(`
          INSERT INTO goals (
            employee_id, cycle_id, title, description, thrust_area,
            uom_type, target, weightage, status, is_locked
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'LOCKED', true)
        `, [
          employeeId, cycleId,
          'Improve Customer Satisfaction Score',
          'Achieve CSAT score of 90% or higher',
          'Customer Satisfaction', 'MIN', '90', 25
        ]);

        // Goal 3 - Approved & Locked
        await query(`
          INSERT INTO goals (
            employee_id, cycle_id, title, description, thrust_area,
            uom_type, target, weightage, status, is_locked
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'LOCKED', true)
        `, [
          employeeId, cycleId,
          'Reduce Customer Acquisition Cost',
          'Decrease CAC by 15%',
          'Cost Optimization', 'MAX', '500', 20
        ]);

        // Goal 4 - Approved & Locked
        await query(`
          INSERT INTO goals (
            employee_id, cycle_id, title, description, thrust_area,
            uom_type, target, weightage, status, is_locked
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'LOCKED', true)
        `, [
          employeeId, cycleId,
          'Complete CRM Implementation',
          'Launch new CRM system by end of Q3',
          'Operational Excellence', 'TIMELINE', '2025-01-31', 15
        ]);

        // Goal 5 - Pending Approval
        await query(`
          INSERT INTO goals (
            employee_id, cycle_id, title, description, thrust_area,
            uom_type, target, weightage, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING_APPROVAL')
        `, [
          employeeId, cycleId,
          'Zero Customer Complaints',
          'Achieve zero escalated complaints',
          'Quality Improvement', 'ZERO', '0', 10
        ]);

        logger.info('Sample goals created');
      } else {
        logger.info('Sample goals already exist, skipping');
      }
    }

    logger.info('✅ Database seeding completed successfully');
    logger.info('\n📧 Login Credentials:');
    logger.info('Admin: admin@company.com / password123');
    logger.info('Manager: manager1@company.com / password123');
    logger.info('Employee: employee1@company.com / password123');

  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };