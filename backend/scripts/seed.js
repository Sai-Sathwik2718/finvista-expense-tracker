const { connectDB, sequelize } = require('../config/database');
const { User, Category, Transaction } = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await connectDB();
    await sequelize.sync({ force: true });
    console.log('Database resynced for seeding.');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Alex Mercer',
      email: 'alex@enterprise.io',
      password: hashedPassword
    });
    console.log('Demo user created: alex@enterprise.io / password123');

    const categories = await Category.bulkCreate([
      { user_id: user.id, name: 'Food & Dining', color: '#FF6B35', icon: 'utensils', type: 'expense', budget_limit: 2500 },
      { user_id: user.id, name: 'Shopping & Apparel', color: '#3B82F6', icon: 'shopping-bag', type: 'expense', budget_limit: 1500 },
      { user_id: user.id, name: 'Housing & Rent', color: '#8B5CF6', icon: 'home', type: 'expense', budget_limit: 3000 },
      { user_id: user.id, name: 'Transport & Commute', color: '#EC4899', icon: 'car', type: 'expense', budget_limit: 1200 },
      { user_id: user.id, name: 'Utilities & Subscriptions', color: '#10B981', icon: 'bolt', type: 'expense', budget_limit: 1800 },
      { user_id: user.id, name: 'Salary & Investments', color: '#22C55E', icon: 'wallet', type: 'income', budget_limit: 0 }
    ]);
    console.log(`${categories.length} categories seeded.`);

    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c.id; });

    const transactionsData = [
      { user_id: user.id, category_id: catMap['Salary & Investments'], amount: 5500.00, type: 'income', date: '2026-06-01', payment_mode: 'bank_transfer', description: 'Monthly Tech Salary Deposit', notes: 'Base payroll' },
      { user_id: user.id, category_id: catMap['Housing & Rent'], amount: 1450.00, type: 'expense', date: '2026-06-02', payment_mode: 'bank_transfer', description: 'Downtown Apartment Rent', notes: 'June rent payment' },
      { user_id: user.id, category_id: catMap['Food & Dining'], amount: 124.50, type: 'expense', date: '2026-06-05', payment_mode: 'card', description: 'Gourmet Dinner with Team', notes: 'Bistro 26' },
      { user_id: user.id, category_id: catMap['Shopping & Apparel'], amount: 289.00, type: 'expense', date: '2026-06-10', payment_mode: 'card', description: 'Noise-Canceling Headphones', notes: 'Tech store upgrade' },
      { user_id: user.id, category_id: catMap['Transport & Commute'], amount: 65.20, type: 'expense', date: '2026-06-14', payment_mode: 'upi', description: 'Weekly Fuel Refill', notes: 'Shell Station' },
      { user_id: user.id, category_id: catMap['Utilities & Subscriptions'], amount: 89.99, type: 'expense', date: '2026-06-18', payment_mode: 'card', description: 'High-Speed Fiber Internet', notes: 'Gigabit line' },
      { user_id: user.id, category_id: catMap['Food & Dining'], amount: 45.80, type: 'expense', date: '2026-06-22', payment_mode: 'upi', description: 'Organic Grocery Supplies', notes: 'Whole foods' },
      { user_id: user.id, category_id: catMap['Salary & Investments'], amount: 850.00, type: 'income', date: '2026-06-25', payment_mode: 'bank_transfer', description: 'Freelance Consulting Payout', notes: 'Architecture design audit' }
    ];

    await Transaction.bulkCreate(transactionsData);
    console.log(`${transactionsData.length} transactions seeded successfully.`);

    console.log('Seeding completed! You can now log in with alex@enterprise.io / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
