const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');

class TransactionRepository {
  async findAndPaginate({ userId, page = 1, limit = 10, search = '', categoryId, type, paymentMode, startDate, endDate, minAmount, maxAmount, sortBy = 'date', sortOrder = 'DESC' }) {
    const offset = (page - 1) * limit;
    const where = { user_id: userId };

    if (search) {
      where.description = { [Op.like]: `%${search}%` };
    }
    if (categoryId) {
      where.category_id = categoryId;
    }
    if (type) {
      where.type = type;
    }
    if (paymentMode) {
      where.payment_mode = paymentMode;
    }
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    if (minAmount && maxAmount) {
      where.amount = { [Op.between]: [minAmount, maxAmount] };
    } else if (minAmount) {
      where.amount = { [Op.gte]: minAmount };
    } else if (maxAmount) {
      where.amount = { [Op.lte]: maxAmount };
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name', 'color', 'icon', 'type'] }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    return {
      totalItems: count,
      transactions: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10)
    };
  }

  async findByIdAndUser(id, userId) {
    return await Transaction.findOne({
      where: { id, user_id: userId },
      include: [{ model: Category, attributes: ['id', 'name', 'color', 'icon', 'type'] }]
    });
  }

  async create(transactionData) {
    return await Transaction.create(transactionData);
  }

  async update(id, userId, updateData) {
    const transaction = await Transaction.findOne({ where: { id, user_id: userId } });
    if (!transaction) return null;
    return await transaction.update(updateData);
  }

  async delete(id, userId) {
    const transaction = await Transaction.findOne({ where: { id, user_id: userId } });
    if (!transaction) return false;
    await transaction.destroy();
    return true;
  }

  async getAllFiltered(userId, filters = {}) {
    const where = { user_id: userId };
    if (filters.startDate && filters.endDate) {
      where.date = { [Op.between]: [filters.startDate, filters.endDate] };
    }
    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.category_id = filters.categoryId;
    if (filters.paymentMode) where.payment_mode = filters.paymentMode;

    return await Transaction.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name', 'color', 'icon', 'type'] }],
      order: [['date', 'DESC']]
    });
  }
}

module.exports = new TransactionRepository();
