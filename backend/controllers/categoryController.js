const categoryService = require('../services/categoryService');
const { successResponse } = require('../utils/apiResponse');
const httpStatus = require('../constants/httpStatus');

class CategoryController {
  async getCategories(req, res, next) {
    try {
      const categories = await categoryService.getCategories(req.user.id);
      return successResponse(res, httpStatus.OK, 'Categories fetched successfully', categories);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.user.id, req.body);
      return successResponse(res, httpStatus.CREATED, 'Category created successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.user.id, req.body);
      return successResponse(res, httpStatus.OK, 'Category updated successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id, req.user.id);
      return successResponse(res, httpStatus.OK, 'Category deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
