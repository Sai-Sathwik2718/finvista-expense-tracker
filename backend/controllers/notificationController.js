const notificationService = require('../services/notificationService');
const { successResponse } = require('../utils/apiResponse');
const httpStatus = require('../constants/httpStatus');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getUserNotifications(req.user.id);
      return successResponse(res, httpStatus.OK, 'Notifications fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const updated = await notificationService.markAsRead(req.params.id, req.user.id);
      return successResponse(res, httpStatus.OK, 'Notification marked as read', updated);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      return successResponse(res, httpStatus.OK, 'All notifications marked as read', null);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
