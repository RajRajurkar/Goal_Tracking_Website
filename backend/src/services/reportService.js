const { query } = require('../config/database');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const calculationService = require('./calculationService');
const ExcelJS = require('exceljs');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

class ReportService {
  async generateAchievementReport(cycleId, filters = {}) {
    let queryText = `
      SELECT 
        u.id as employee_id,
        u.name as employee_name,
        u.email as employee_email,
        d.name as department_name,
        g.id as goal_id,
        g.title as goal_title,
        g.thrust_area,
        g.uom_type,
        g.target,
        g.weightage,
        a.quarter,
        a.actual_achievement,
        a.progress_score,
        a.status
      FROM users u
      LEFT JOIN goals g ON u.id = g.employee_id
      LEFT JOIN achievements a ON g.id = a.goal_id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE g.cycle_id = $1 AND g.is_locked = true
    `;
    const params = [cycleId];
    let paramCount = 2;

    if (filters.department_id) {
      queryText += ` AND u.department_id = $${paramCount}`;
      params.push(filters.department_id);
      paramCount++;
    }

    if (filters.employee_id) {
      queryText += ` AND u.id = $${paramCount}`;
      params.push(filters.employee_id);
      paramCount++;
    }

    if (filters.quarter) {
      queryText += ` AND a.quarter = $${paramCount}`;
      params.push(filters.quarter);
      paramCount++;
    }

    queryText += ' ORDER BY u.name, g.id, a.quarter';

    const result = await query(queryText, params);
    return result.rows;
  }

  async exportToCSV(data, filename) {
    const csvPath = path.join(__dirname, '../../exports', filename);
    
    // Ensure exports directory exists
    const dir = path.dirname(csvPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'employee_name', title: 'Employee Name' },
        { id: 'employee_email', title: 'Email' },
        { id: 'department_name', title: 'Department' },
        { id: 'goal_title', title: 'Goal' },
        { id: 'thrust_area', title: 'Thrust Area' },
        { id: 'target', title: 'Target' },
        { id: 'weightage', title: 'Weightage (%)' },
        { id: 'quarter', title: 'Quarter' },
        { id: 'actual_achievement', title: 'Achievement' },
        { id: 'progress_score', title: 'Progress (%)' },
        { id: 'status', title: 'Status' }
      ]
    });

    await csvWriter.writeRecords(data);
    return csvPath;
  }

  async exportToExcel(data, filename) {
    const excelPath = path.join(__dirname, '../../exports', filename);
    
    // Ensure exports directory exists
    const dir = path.dirname(excelPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Achievement Report');

    // Add headers
    worksheet.columns = [
      { header: 'Employee Name', key: 'employee_name', width: 25 },
      { header: 'Email', key: 'employee_email', width: 30 },
      { header: 'Department', key: 'department_name', width: 20 },
      { header: 'Goal', key: 'goal_title', width: 40 },
      { header: 'Thrust Area', key: 'thrust_area', width: 20 },
      { header: 'Target', key: 'target', width: 15 },
      { header: 'Weightage (%)', key: 'weightage', width: 15 },
      { header: 'Quarter', key: 'quarter', width: 10 },
      { header: 'Achievement', key: 'actual_achievement', width: 15 },
      { header: 'Progress (%)', key: 'progress_score', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data
    data.forEach(row => {
      worksheet.addRow(row);
    });

    // Add conditional formatting for progress scores
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const scoreCell = row.getCell('progress_score');
        const score = parseFloat(scoreCell.value);
        
        if (score >= 100) {
          scoreCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF16A34A' }
          };
        } else if (score >= 70) {
          scoreCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF59E0B' }
          };
        } else if (score > 0) {
          scoreCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDC2626' }
          };
        }
      }
    });

    await workbook.xlsx.writeFile(excelPath);
    return excelPath;
  }

  async getCompletionDashboard(cycleId) {
    const result = await query(`
      SELECT 
        COUNT(DISTINCT u.id) as total_employees,
        COUNT(DISTINCT CASE WHEN g.status = 'LOCKED' THEN u.id END) as employees_with_approved_goals,
        COUNT(DISTINCT CASE WHEN g.status = 'PENDING_APPROVAL' THEN u.id END) as employees_pending_approval,
        COUNT(DISTINCT CASE WHEN g.status = 'DRAFT' THEN u.id END) as employees_in_draft,
        COUNT(g.id) as total_goals,
        COUNT(CASE WHEN g.is_locked = true THEN 1 END) as locked_goals,
        
        COUNT(DISTINCT CASE WHEN a.quarter = 'Q1' THEN a.goal_id END) as q1_updated,
        COUNT(DISTINCT CASE WHEN a.quarter = 'Q2' THEN a.goal_id END) as q2_updated,
        COUNT(DISTINCT CASE WHEN a.quarter = 'Q3' THEN a.goal_id END) as q3_updated,
        COUNT(DISTINCT CASE WHEN a.quarter = 'Q4' THEN a.goal_id END) as q4_updated,
        
        COUNT(DISTINCT CASE WHEN c.quarter = 'Q1' THEN c.goal_id END) as q1_checkins,
        COUNT(DISTINCT CASE WHEN c.quarter = 'Q2' THEN c.goal_id END) as q2_checkins,
        COUNT(DISTINCT CASE WHEN c.quarter = 'Q3' THEN c.goal_id END) as q3_checkins,
        COUNT(DISTINCT CASE WHEN c.quarter = 'Q4' THEN c.goal_id END) as q4_checkins
      FROM users u
      LEFT JOIN goals g ON u.id = g.employee_id AND g.cycle_id = $1
      LEFT JOIN achievements a ON g.id = a.goal_id
      LEFT JOIN checkins c ON g.id = c.goal_id
      WHERE u.role = 'EMPLOYEE' AND u.is_active = true
    `, [cycleId]);

    return result.rows[0];
  }

  async getEmployeeReport(employeeId, cycleId) {
    const goals = await Goal.findByEmployee(employeeId, cycleId);
    const achievements = {};

    for (const goal of goals) {
      achievements[goal.id] = await Achievement.findByGoal(goal.id);
    }

    // Calculate overall scores per quarter
    const quarterScores = {};
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
      const quarterAchievements = [];
      Object.values(achievements).forEach(goalAchievements => {
        const qa = goalAchievements.find(a => a.quarter === quarter);
        if (qa) quarterAchievements.push(qa);
      });

      quarterScores[quarter] = calculationService.calculateOverallScore(
        quarterAchievements,
        goals
      );
    });

    return {
      employee_id: employeeId,
      goals,
      achievements,
      quarter_scores: quarterScores,
      overall_score: Object.values(quarterScores).reduce((a, b) => a + b, 0) / 4
    };
  }
}

module.exports = new ReportService();