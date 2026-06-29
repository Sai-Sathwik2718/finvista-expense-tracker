const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class AnalyticsService {
  async getAnalytics(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Current Month dates
    const currStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const currEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

    // Previous Month dates
    const prevStart = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
    const prevEnd = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    // Total Expenses Current Month vs Prev Month
    const currMonthExp = await Transaction.findOne({
      where: { user_id: userId, type: 'expense', date: { [Op.between]: [currStart, currEnd] } },
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']]
    });
    const currentMonthSpend = parseFloat(currMonthExp?.get('total') || 0);

    const prevMonthExp = await Transaction.findOne({
      where: { user_id: userId, type: 'expense', date: { [Op.between]: [prevStart, prevEnd] } },
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']]
    });
    const previousMonthSpend = parseFloat(prevMonthExp?.get('total') || 0);

    const monthOverMonthChangePercentage = previousMonthSpend > 0 
      ? (((currentMonthSpend - previousMonthSpend) / previousMonthSpend) * 100).toFixed(1)
      : (currentMonthSpend > 0 ? 100 : 0);

    // Days in current month so far
    const daysPassedInMonth = Math.max(1, now.getDate());
    const avgSpendPerDay = parseFloat((currentMonthSpend / daysPassedInMonth).toFixed(2));

    // All time expenses for monthly average
    const allTimeExp = await Transaction.findOne({
      where: { user_id: userId, type: 'expense' },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('MIN', sequelize.col('date')), 'min_date']
      ]
    });
    const totalAllTimeSpend = parseFloat(allTimeExp?.get('total') || 0);
    const minDateStr = allTimeExp?.get('min_date');
    let monthsActive = 1;
    if (minDateStr) {
      const minDate = new Date(minDateStr);
      monthsActive = Math.max(1, (now.getFullYear() - minDate.getFullYear()) * 12 + (now.getMonth() - minDate.getMonth()) + 1);
    }
    const avgSpendPerMonth = parseFloat((totalAllTimeSpend / monthsActive).toFixed(2));

    // Daily Spending Breakdown for Current Month
    const dailyExpenses = await Transaction.findAll({
      where: { user_id: userId, type: 'expense', date: { [Op.between]: [currStart, currEnd] } },
      attributes: ['date', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['date'],
      order: [['date', 'ASC']]
    });

    const dailyGraph = dailyExpenses.map(d => ({
      date: d.date,
      amount: parseFloat(d.get('total'))
    }));

    let highestSpendingDay = { date: 'N/A', amount: 0 };
    let lowestSpendingDay = { date: 'N/A', amount: 0 };

    if (dailyGraph.length > 0) {
      const sorted = [...dailyGraph].sort((a, b) => b.amount - a.amount);
      highestSpendingDay = sorted[0];
      lowestSpendingDay = sorted[sorted.length - 1];
    }

    // Top 5 Categories
    const top5CategoriesResult = await Transaction.findAll({
      where: { user_id: userId, type: 'expense' },
      attributes: ['category_id', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['category_id'],
      order: [[sequelize.literal('total'), 'DESC']],
      limit: 5,
      include: [{ model: Category, attributes: ['id', 'name', 'color', 'icon'] }]
    });

    const top5Categories = top5CategoriesResult.map(cat => ({
      categoryId: cat.category_id,
      name: cat.Category?.name || 'Uncategorized',
      total: parseFloat(cat.get('total')),
      color: cat.Category?.color || '#3B82F6'
    }));

    return {
      overview: {
        avgSpendPerDay,
        avgSpendPerMonth,
        currentMonthSpend,
        previousMonthSpend,
        monthOverMonthChangePercentage,
        highestSpendingDay,
        lowestSpendingDay
      },
      dailyGraph,
      top5Categories
    };
  }
}

module.exports = new AnalyticsService();
