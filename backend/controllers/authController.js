const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../constants/httpStatus');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, httpStatus.CREATED, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, httpStatus.OK, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user.id);
      return successResponse(res, httpStatus.OK, 'Profile retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedProfile = await authService.updateProfile(req.user.id, req.body);
      return successResponse(res, httpStatus.OK, 'Profile updated successfully', updatedProfile);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      return successResponse(res, httpStatus.OK, 'Logged out successfully', null);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
