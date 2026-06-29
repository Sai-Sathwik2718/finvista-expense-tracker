const { Notification } = require('../models');

class NotificationRepository {
  async findAllByUser(userId, limit = 20) {
    return await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit
    });
  }

  async getUnreadCount(userId) {
    return await Notification.count({
      where: { user_id: userId, is_read: false }
    });
  }

  async getUnreadPopups(userId) {
    return await Notification.findAll({
      where: { user_id: userId, is_popup: true, is_read: false },
      order: [['created_at', 'DESC']]
    });
  }

  async create(data) {
    return await Notification.create(data);
  }

  async markAsRead(id, userId) {
    const notif = await Notification.findOne({ where: { id, user_id: userId } });
    if (!notif) return null;
    return await notif.update({ is_read: true });
  }

  async markAllAsRead(userId) {
    await Notification.update({ is_read: true }, { where: { user_id: userId, is_read: false } });
    return true;
  }
}

module.exports = new NotificationRepository();
