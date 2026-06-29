const reportService = require('../services/reportService');
const { successResponse } = require('../utils/apiResponse');
const httpStatus = require('../constants/httpStatus');

class ReportController {
  async getReports(req, res, next) {
    try {
      const reportData = await reportService.getReportData(req.user.id, req.query);
      return successResponse(res, httpStatus.OK, 'Report data retrieved successfully', reportData);
    } catch (error) {
      next(error);
    }
  }

  async exportPdf(req, res, next) {
    try {
      await reportService.generatePdfReport(req.user.id, req.query, res);
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req, res, next) {
    try {
      await reportService.generateExcelReport(req.user.id, req.query, res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
