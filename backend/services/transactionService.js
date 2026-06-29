const transactionRepository = require('../repositories/transactionRepository');
const categoryRepository = require('../repositories/categoryRepository');
const notificationService = require('./notificationService');
const { Transaction } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class TransactionService {
  async getTransactions(userId, queryParams) {
    return await transactionRepository.findAndPaginate({ userId, ...queryParams });
  }

  async getTransactionById(id, userId) {
    const transaction = await transactionRepository.findByIdAndUser(id, userId);
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  }

  async createTransaction(userId, transactionData) {
    const transaction = await transactionRepository.create({ ...transactionData, user_id: userId });
    await this.checkCategoryBudgetAlert(userId, transaction.category_id);
    return transaction;
  }

  async updateTransaction(id, userId, updateData) {
    const transaction = await transactionRepository.update(id, userId, updateData);
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    await this.checkCategoryBudgetAlert(userId, transaction.category_id);
    return transaction;
  }

  async deleteTransaction(id, userId) {
    const transaction = await transactionRepository.findByIdAndUser(id, userId);
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    const categoryId = transaction.category_id;
    const success = await transactionRepository.delete(id, userId);
    if (categoryId) {
      await this.checkCategoryBudgetAlert(userId, categoryId);
    }
    return true;
  }

  async checkCategoryBudgetAlert(userId, categoryId) {
    if (!categoryId) return;
    const category = await categoryRepository.findByIdAndUser(categoryId, userId);
    if (!category || category.type !== 'expense' || !category.budget_limit || category.budget_limit <= 0) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const result = await Transaction.findOne({
      where: {
        user_id: userId,
        category_id: categoryId,
        type: 'expense',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']]
    });

    const totalSpent = parseFloat(result?.get('total') || 0);
    const budgetLimit = parseFloat(category.budget_limit);
    const percentageUsed = (totalSpent / budgetLimit) * 100;

    if (percentageUsed >= 100) {
      const excess = totalSpent - budgetLimit;
      await notificationService.createNotification(
        userId,
        `🚨 Budget Exceeded`,
        `You have exceeded your ${category.name} budget by ₹${excess.toFixed(2)}. Consider reducing expenses this month.`,
        'danger',
        true
      );
    } else if (percentageUsed >= 90) {
      await notificationService.createNotification(
        userId,
        `⚠️ Near Budget Limit`,
        `You have almost reached your monthly ${category.name} budget (${percentageUsed.toFixed(0)}% used).`,
        'warning',
        false
      );
    } else if (percentageUsed >= 75) {
      await notificationService.createNotification(
        userId,
        `⚠️ Budget Usage Notice`,
        `You have used ${percentageUsed.toFixed(0)}% of your ${category.name} budget.`,
        'warning',
        false
      );
    }
  }
}

module.exports = new TransactionService();
