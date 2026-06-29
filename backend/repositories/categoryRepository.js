const { Category, Transaction } = require('../models');
const { sequelize } = require('../config/database');

class CategoryRepository {
  async findAllByUser(userId) {
    return await Category.findAll({
      where: { user_id: userId },
      order: [['name', 'ASC']]
    });
  }

  async findByIdAndUser(id, userId) {
    return await Category.findOne({
      where: { id, user_id: userId }
    });
  }

  async create(categoryData) {
    return await Category.create(categoryData);
  }

  async bulkCreate(categoriesData) {
    return await Category.bulkCreate(categoriesData);
  }

  async update(id, userId, updateData) {
    const category = await this.findByIdAndUser(id, userId);
    if (!category) return null;
    return await category.update(updateData);
  }

  async delete(id, userId) {
    const category = await this.findByIdAndUser(id, userId);
    if (!category) return false;
    await category.destroy();
    return true;
  }

  async getCategoryTotals(userId) {
    return await Transaction.findAll({
      where: { user_id: userId },
      attributes: [
        'category_id',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transaction_count']
      ],
      group: ['category_id'],
      include: [{ model: Category, attributes: ['id', 'name', 'color', 'icon', 'type'] }]
    });
  }
}

module.exports = new CategoryRepository();
