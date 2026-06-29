const { Transaction, Category, Notification } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class DashboardService {
  async getDashboardData(userId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Total Monthly Expenses
    const monthlyExpenseResult = await Transaction.findOne({
      where: {
        user_id: userId,
        type: 'expense',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']]
    });
    const totalMonthlyExpenses = parseFloat(monthlyExpenseResult?.get('total') || 0);

    // Total Monthly Income
    const monthlyIncomeResult = await Transaction.findOne({
      where: {
        user_id: userId,
        type: 'income',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']]
    });
    const totalMonthlyIncome = parseFloat(monthlyIncomeResult?.get('total') || 0);

    // Total Transactions Count in current month
    const transactionCount = await Transaction.count({
      where: {
        user_id: userId,
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });

    // Top Spending Category in current month
    const topCategoryResult = await Transaction.findAll({
      where: {
        user_id: userId,
        type: 'expense',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: [
        'category_id',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['category_id'],
      order: [[sequelize.literal('total'), 'DESC']],
      limit: 1,
      include: [{ model: Category, attributes: ['id', 'name', 'color', 'icon'] }]
    });

    const topCategory = topCategoryResult.length > 0 ? {
      name: topCategoryResult[0].Category?.name || 'N/A',
      amount: parseFloat(topCategoryResult[0].get('total')),
      color: topCategoryResult[0].Category?.color || '#FF6B35'
    } : { name: 'None', amount: 0, color: '#64748B' };

    // Recent Transactions (Top 5)
    const recentTransactions = await Transaction.findAll({
      where: { user_id: userId },
      include: [{ model: Category, attributes: ['id', 'name', 'color', 'icon', 'type'] }],
      order: [['date', 'DESC'], ['created_at', 'DESC']],
      limit: 5
    });

    // Category-Wise Expense Distribution
    const categoryDistribution = await Transaction.findAll({
      where: { user_id: userId, type: 'expense' },
      attributes: ['category_id', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['category_id'],
      include: [{ model: Category, attributes: ['id', 'name', 'color', 'icon'] }]
    });

    const categoryWiseChart = categoryDistribution.map(item => ({
      categoryId: item.category_id,
      name: item.Category?.name || 'Uncategorized',
      value: parseFloat(item.get('total')),
      color: item.Category?.color || '#3B82F6'
    }));

    // Monthly Trend (Last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
      const monthName = d.toLocaleString('default', { month: 'short' });

      const exp = await Transaction.findOne({
        where: { user_id: userId, type: 'expense', date: { [Op.between]: [mStart, mEnd] } },
        attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']]
      });
      const inc = await Transaction.findOne({
        where: { user_id: userId, type: 'income', date: { [Op.between]: [mStart, mEnd] } },
        attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']]
      });

      monthlyTrend.push({
        month: monthName,
        expense: parseFloat(exp?.get('total') || 0),
        income: parseFloat(inc?.get('total') || 0)
      });
    }

    // High-priority unread budget exceeded popups
    const unreadPopups = await Notification.findAll({
      where: { user_id: userId, is_popup: true, is_read: false },
      order: [['created_at', 'DESC']],
      limit: 1
    });

    // Smart Insights Generation
    const smartInsights = [
      `Your highest spending category this month is ${topCategory.name}.`,
      `Average daily expenditure is ₹${Math.round(totalMonthlyExpenses / Math.max(1, now.getDate()))}.`
    ];
    if (totalMonthlyIncome > totalMonthlyExpenses) {
      smartInsights.push(`You have saved ₹${Math.round(totalMonthlyIncome - totalMonthlyExpenses)} this billing cycle.`);
    }

    return {
      quickStats: {
        totalMonthlyExpenses,
        totalMonthlyIncome,
        netBalance: totalMonthlyIncome - totalMonthlyExpenses,
        transactionCount,
        topCategory
      },
      recentTransactions,
      categoryWiseChart,
      monthlyTrend,
      budgetExceededPopup: unreadPopups.length > 0 ? unreadPopups[0] : null,
      smartInsights
    };
  }
}

module.exports = new DashboardService();
