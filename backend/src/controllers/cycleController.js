const Cycle = require('../models/Cycle');
const ResponseHandler = require('../utils/responseHandler');
const { ValidationError } = require('../utils/errorTypes');

class CycleController {
  async createCycle(req, res, next) {
    try {
      const cycle = await Cycle.create(req.body);
      return ResponseHandler.created(res, cycle, 'Cycle created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllCycles(req, res, next) {
    try {
      const cycles = await Cycle.findAll();
      return ResponseHandler.success(res, cycles, 'Cycles retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getActiveCycle(req, res, next) {
    try {
      const cycle = await Cycle.findActive();
      
      if (!cycle) {
        throw new ValidationError('No active cycle found');
      }

      return ResponseHandler.success(res, cycle, 'Active cycle retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getCycleById(req, res, next) {
    try {
      const cycle = await Cycle.findById(req.params.id);
      
      if (!cycle) {
        throw new ValidationError('Cycle not found');
      }

      return ResponseHandler.success(res, cycle, 'Cycle retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateCycle(req, res, next) {
    try {
      const cycle = await Cycle.update(req.params.id, req.body);
      return ResponseHandler.success(res, cycle, 'Cycle updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async setActiveCycle(req, res, next) {
    try {
      const cycle = await Cycle.setActive(req.params.id);
      return ResponseHandler.success(res, cycle, 'Active cycle set successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCurrentQuarter(req, res, next) {
    try {
      const { cycle_id } = req.query;
      const quarter = await Cycle.getCurrentQuarter(cycle_id);
      
      if (!quarter) {
        return ResponseHandler.success(res, null, 'No active quarter found');
      }

      return ResponseHandler.success(res, quarter, 'Current quarter retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CycleController();