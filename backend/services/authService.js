const userRepository = require('../repositories/userRepository');
const categoryRepository = require('../repositories/categoryRepository');
const { generateToken } = require('../utils/jwt');

class AuthService {
  async register({ name, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    const user = await userRepository.create({ name, email, password });

    const defaultCategories = [
      { name: 'Food & Dining', color: '#FF6B35', icon: 'utensils', type: 'expense', budget_limit: 2500 },
      { name: 'Shopping', color: '#3B82F6', icon: 'shopping-bag', type: 'expense', budget_limit: 1500 },
      { name: 'Housing & Rent', color: '#8B5CF6', icon: 'home', type: 'expense', budget_limit: 3000 },
      { name: 'Transport', color: '#EC4899', icon: 'car', type: 'expense', budget_limit: 1200 },
      { name: 'Utilities & Bills', color: '#10B981', icon: 'bolt', type: 'expense', budget_limit: 1800 },
      { name: 'Entertainment', color: '#F59E0B', icon: 'film', type: 'expense', budget_limit: 2000 },
      { name: 'Salary & Income', color: '#22C55E', icon: 'wallet', type: 'income', budget_limit: 0 }
    ];

    for (const cat of defaultCategories) {
      await categoryRepository.create({ ...cat, user_id: user.id });
    }

    const token = generateToken({ id: user.id, email: user.email });
    return { user: user.toPublicJSON(), token };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({ id: user.id, email: user.email });
    return { user: user.toPublicJSON(), token };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user.toPublicJSON();
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.update(userId, updateData);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user.toPublicJSON();
  }
}

module.exports = new AuthService();
