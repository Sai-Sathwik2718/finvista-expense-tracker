const notificationRepository = require('../repositories/notificationRepository');

class NotificationService {
  async getUserNotifications(userId) {
    const notifications = await notificationRepository.findAllByUser(userId);
    const unreadCount = await notificationRepository.getUnreadCount(userId);
    return { notifications, unreadCount };
  }

  async markAsRead(id, userId) {
    return await notificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  }

  async createNotification(userId, title, message, type = 'info', isPopup = false) {
    return await notificationRepository.create({
      user_id: userId,
      title,
      message,
      type,
      is_popup: isPopup
    });
  }
}

module.exports = new NotificationService();
