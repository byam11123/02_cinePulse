import { fetchFromTMDB } from '../services/tmdb.service.js';
import UserService from '../services/UserService.js';
import { ValidationError } from '../utils/errors.js';

class SearchService {
  /**
   * Search for people
   */
  async searchPerson(query, userId) {
    try {
      const response = await fetchFromTMDB(
        `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
      );
      
      if (response.results.length === 0) {
        throw new ValidationError("No results found");
      }

      const newEntry = {
        id: response.results[0].id,
        image: response.results[0].profile_path,
        title: response.results[0].name,
        searchType: "person",
        createdAt: new Date(),
      };

      // Update user's search history
      await UserService.updateSearchHistory(userId, newEntry);

      return response.results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search for movies
   */
  async searchMovie(query, userId) {
    try {
      const response = await fetchFromTMDB(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
      );
      
      if (response.results.length === 0) {
        throw new ValidationError("No results found");
      }

      const newEntry = {
        id: response.results[0].id,
        image: response.results[0].poster_path,
        title: response.results[0].title,
        searchType: "movie",
        createdAt: new Date(),
      };

      // Update user's search history
      await UserService.updateSearchHistory(userId, newEntry);

      return response.results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search for TV shows
   */
  async searchTv(query, userId) {
    try {
      const response = await fetchFromTMDB(
        `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
      );
      
      if (response.results.length === 0) {
        throw new ValidationError("No results found");
      }

      const newEntry = {
        id: response.results[0].id,
        image: response.results[0].poster_path,
        title: response.results[0].name,
        searchType: "tv",
        createdAt: new Date(),
      };

      // Update user's search history
      await UserService.updateSearchHistory(userId, newEntry);

      return response.results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's search history
   */
  async getSearchHistory(userId) {
    try {
      // Get the user's search history
      const history = await UserService.getSearchHistory(userId);
      
      // Remove duplicate entries from search history based on id and searchType
      const uniqueHistory = [];
      const seenEntries = new Set();

      for (const entry of history) {
        const entryKey = `${entry.id}-${entry.searchType}`;
        if (!seenEntries.has(entryKey)) {
          seenEntries.add(entryKey);
          uniqueHistory.push(entry);
        }
      }

      // Update the user's search history to remove duplicates if needed
      if (uniqueHistory.length !== history.length) {
        await UserService.clearSearchHistory(userId);
        for (const entry of uniqueHistory.reverse()) { // Reverse to maintain order
          await UserService.updateSearchHistory(userId, entry);
        }
      }

      return uniqueHistory;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove item from search history
   */
  async removeItemFromSearchHistory(userId, itemId) {
    try {
      const result = await UserService.removeFromSearchHistory(userId, parseInt(itemId));
      return { message: "Item removed from history" };
    } catch (error) {
      throw error;
    }
  }
}

export default new SearchService();