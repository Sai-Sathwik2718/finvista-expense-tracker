const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
  async getCategories(userId) {
    return await categoryRepository.findAllByUser(userId);
  }

  async createCategory(userId, categoryData) {
    return await categoryRepository.create({ ...categoryData, user_id: userId });
  }

  async updateCategory(id, userId, updateData) {
    const category = await categoryRepository.update(id, userId, updateData);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  async deleteCategory(id, userId) {
    const success = await categoryRepository.delete(id, userId);
    if (!success) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }
}

module.exports = new CategoryService();
