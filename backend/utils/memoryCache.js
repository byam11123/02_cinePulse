import NodeCache from 'node-cache';
import logger from './logger.js';

// Create a memory cache instance
const memoryCache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 minutes TTL, check every 2 minutes

// Memory cache middleware function
const memoryCacheMiddleware = (keyPrefix, expirationTime = 600) => {
  return (req, res, next) => {
    try {
      // Create a unique cache key based on the route and query parameters
      const cacheKey = `${keyPrefix}:${req.originalUrl}`;
      
      // Try to get cached data
      const cachedData = memoryCache.get(cacheKey);
      
      if (cachedData) {
        logger.info('Memory cache hit', { key: cacheKey });
        // Send cached data
        return res.status(200).json(cachedData);
      }
      
      // If not in cache, continue to the route handler
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Cache the response data
        memoryCache.set(cacheKey, data, expirationTime);
        logger.info('Memory cache set', { key: cacheKey, expiration: expirationTime });
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Memory cache middleware error', { error: error.message });
      next(); // Proceed without caching
    }
  };
};

// Direct memory cache functions
const setMemoryCache = (key, data, expirationTime = 600) => {
  try {
    memoryCache.set(key, data, expirationTime);
    logger.info('Data stored in memory cache', { key, expiration: expirationTime });
  } catch (error) {
    logger.error('Error setting memory cache', { error: error.message, key });
  }
};

const getMemoryCache = (key) => {
  try {
    const cachedData = memoryCache.get(key);
    if (cachedData) {
      logger.info('Memory cache retrieved', { key });
      return cachedData;
    }
    return null;
  } catch (error) {
    logger.error('Error getting memory cache', { error: error.message, key });
    return null;
  }
};

const deleteMemoryCache = (key) => {
  try {
    const deleted = memoryCache.del(key);
    if (deleted) {
      logger.info('Memory cache deleted', { key });
    }
  } catch (error) {
    logger.error('Error deleting memory cache', { error: error.message, key });
  }
};

const clearMemoryCache = () => {
  try {
    memoryCache.flushAll();
    logger.info('Memory cache cleared');
  } catch (error) {
    logger.error('Error clearing memory cache', { error: error.message });
  }
};

export {
  memoryCache,
  memoryCacheMiddleware,
  setMemoryCache,
  getMemoryCache,
  deleteMemoryCache,
  clearMemoryCache
};