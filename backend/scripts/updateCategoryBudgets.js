const { connectDB } = require('../config/database');
const { Category } = require('../models');

const updateBudgets = async () => {
  try {
    await connectDB();

    const categories = await Category.findAll({ where: { type: 'expense' } });

    const budgetValues = [2500, 1500, 3000, 1200, 1800, 2000];
    let index = 0;

    for (const cat of categories) {
      const newLimit = budgetValues[index % budgetValues.length];
      await cat.update({ budget_limit: newLimit });
      console.log(`Updated category "${cat.name}" budget limit to ₹${newLimit}`);
      index++;
    }

    console.log('Category budget limits updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update category budgets:', err);
    process.exit(1);
  }
};

updateBudgets();
