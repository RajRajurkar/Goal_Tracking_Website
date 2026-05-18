const reportService = require('../services/reportService');
const ResponseHandler = require('../utils/responseHandler');
const { ValidationError } = require('../utils/errorTypes');
const path = require('path');

class ReportController {
  async getAchievementReport(req, res, next) {
    try {
      const { cycle_id, department_id, employee_id, quarter } = req.query;

      if (!cycle_id) {
        throw new ValidationError('Cycle ID is required');
      }

      const data = await reportService.generateAchievementReport(
        cycle_id,
        { department_id, employee_id, quarter }
      );

      return ResponseHandler.success(res, data, 'Achievement report generated');
    } catch (error) {
      next(error);
    }
  }

  async exportAchievementCSV(req, res, next) {
    try {
      const { cycle_id, department_id, employee_id, quarter } = req.query;

      if (!cycle_id) {
        throw new ValidationError('Cycle ID is required');
      }

      const data = await reportService.generateAchievementReport(
        cycle_id,
        { department_id, employee_id, quarter }
      );

      const filename = `achievement_report_${cycle_id}_${Date.now()}.csv`;
      const filePath = await reportService.exportToCSV(data, filename);

      res.download(filePath, filename, (err) => {
        if (err) {
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async exportAchievementExcel(req, res, next) {
    try {
      const { cycle_id, department_id, employee_id, quarter } = req.query;

      if (!cycle_id) {
        throw new ValidationError('Cycle ID is required');
      }

      const data = await reportService.generateAchievementReport(
        cycle_id,
        { department_id, employee_id, quarter }
      );

      const filename = `achievement_report_${cycle_id}_${Date.now()}.xlsx`;
      const filePath = await reportService.exportToExcel(data, filename);

      res.download(filePath, filename, (err) => {
        if (err) {
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompletionDashboard(req, res, next) {
    try {
      const { cycle_id } = req.query;

      if (!cycle_id) {
        throw new ValidationError('Cycle ID is required');
      }

      const dashboard = await reportService.getCompletionDashboard(cycle_id);
      return ResponseHandler.success(res, dashboard, 'Completion dashboard retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeReport(req, res, next) {
    try {
      const { cycle_id } = req.query;
      const { employeeId } = req.params;

      if (!cycle_id) {
        throw new ValidationError('Cycle ID is required');
      }

      const report = await reportService.getEmployeeReport(employeeId, cycle_id);
      return ResponseHandler.success(res, report, 'Employee report retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();