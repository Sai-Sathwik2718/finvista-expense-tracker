const transactionService = require('../services/transactionService');
const { successResponse } = require('../utils/apiResponse');
const httpStatus = require('../constants/httpStatus');

class TransactionController {
  async getTransactions(req, res, next) {
    try {
      const result = await transactionService.getTransactions(req.user.id, req.query);
      return successResponse(res, httpStatus.OK, 'Transactions retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req, res, next) {
    try {
      const transaction = await transactionService.getTransactionById(req.params.id, req.user.id);
      return successResponse(res, httpStatus.OK, 'Transaction retrieved successfully', transaction);
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req, res, next) {
    try {
      const transaction = await transactionService.createTransaction(req.user.id, req.body);
      return successResponse(res, httpStatus.CREATED, 'Transaction created successfully', transaction);
    } catch (error) {
      next(error);
    }
  }

  async updateTransaction(req, res, next) {
    try {
      const transaction = await transactionService.updateTransaction(req.params.id, req.user.id, req.body);
      return successResponse(res, httpStatus.OK, 'Transaction updated successfully', transaction);
    } catch (error) {
      next(error);
    }
  }

  async deleteTransaction(req, res, next) {
    try {
      await transactionService.deleteTransaction(req.params.id, req.user.id);
      return successResponse(res, httpStatus.OK, 'Transaction deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
