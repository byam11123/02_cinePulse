import BaseService from './BaseService.js';
import { User } from '../models/user.model.js';

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await this.findOne('email', email);
  }

  /**
   * Find user by username
   */
  async findByUsername(username) {
    return await this.findOne('username', username);
  }

  /**
   * Update user's search history
   */
  async updateSearchHistory(userId, searchItem) {
    const user = await User.findById(userId);
    if (!user) {
      const { NotFoundError } = await import('../utils/errors.js');
      throw new NotFoundError('User not found');
    }

    // Add to search history (limit to 50 items)
    if (!user.searchHistory) {
      user.searchHistory = [];
    }

    // Add new search item to the beginning
    user.searchHistory.unshift(searchItem);

    // Limit to 50 items
    user.searchHistory = user.searchHistory.slice(0, 50);

    return await user.save();
  }

  /**
   * Remove item from search history
   */
  async removeFromSearchHistory(userId, itemId) {
    const user = await User.findById(userId);
    if (!user) {
      const { NotFoundError } = await import('../utils/errors.js');
      throw new NotFoundError('User not found');
    }

    user.searchHistory = user.searchHistory.filter(item => item.id !== itemId);
    return await user.save();
  }

  /**
   * Clear all search history
   */
  async clearSearchHistory(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { searchHistory: [] },
      { new: true }
    );

    if (!user) {
      const { NotFoundError } = await import('../utils/errors.js');
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Get user's search history
   */
  async getSearchHistory(userId) {
    const user = await User.findById(userId).select('searchHistory');
    if (!user) {
      const { NotFoundError } = await import('../utils/errors.js');
      throw new NotFoundError('User not found');
    }

    return user.searchHistory;
  }
}

export default new UserService();