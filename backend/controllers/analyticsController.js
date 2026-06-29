const analyticsService = require('../services/analyticsService');
const { successResponse } = require('../utils/apiResponse');
const httpStatus = require('../constants/httpStatus');

class AnalyticsController {
  async getAnalytics(req, res, next) {
    try {
      const analyticsData = await analyticsService.getAnalytics(req.user.id);
      return successResponse(res, httpStatus.OK, 'Analytics data retrieved successfully', analyticsData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
