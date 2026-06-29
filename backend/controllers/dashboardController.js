const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/apiResponse');
const httpStatus = require('../constants/httpStatus');

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const dashboardData = await dashboardService.getDashboardData(req.user.id);
      return successResponse(res, httpStatus.OK, 'Dashboard data retrieved successfully', dashboardData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
