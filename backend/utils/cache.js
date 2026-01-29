import redis from 'redis';
import NodeCache from 'node-cache';
import logger from './logger.js';

let redisClient;
const memoryCache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 minutes TTL, check every 2 minutes

// Initialize Redis client
const initializeRedis = async () => {
  try {
    // Use Redis URL from environment variables, or default to local instance
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = redis.createClient({
      url: redisUrl
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', { error: err.message });
    });

    await redisClient.connect();
    logger.info('Connected to Redis successfully');

    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis', { error: error.message });
    // Fallback: continue without Redis cache
    return null;
  }
};

// Cache middleware function with fallback to memory cache
const cacheMiddleware = (keyPrefix, expirationTime = 3600) => {
  return async (req, res, next) => {
    try {
      // Create a unique cache key based on the route and query parameters
      const cacheKey = `${keyPrefix}:${req.originalUrl}`;

      // Try to get cached data from Redis first
      let cachedData = null;
      if (redisClient) {
        try {
          cachedData = await redisClient.get(cacheKey);
          if (cachedData) {
            cachedData = JSON.parse(cachedData);
            logger.info('Redis cache hit', { key: cacheKey });
            return res.status(200).json(cachedData);
          }
        } catch (redisErr) {
          logger.warn('Redis get failed, trying memory cache', { error: redisErr.message });
        }
      }

      // If Redis didn't have the data or failed, try memory cache
      if (!cachedData) {
        cachedData = memoryCache.get(cacheKey);
        if (cachedData) {
          logger.info('Memory cache hit', { key: cacheKey });
          return res.status(200).json(cachedData);
        }
      }

      // If not in any cache, continue to the route handler
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function (data) {
        // Cache the response data in both Redis and memory
        if (redisClient) {
          redisClient.setEx(cacheKey, expirationTime, JSON.stringify(data))
            .catch(err => logger.error('Redis set error', { error: err.message, key: cacheKey }));
        }

        // Also store in memory cache
        memoryCache.set(cacheKey, data, expirationTime);

        logger.info('Cache set', { key: cacheKey, expiration: expirationTime });
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', { error: error.message });
      next(); // Proceed without caching
    }
  };
};

// Direct cache functions with fallback to memory cache
const setCache = async (key, data, expirationTime = 3600) => {
  try {
    // Store in Redis if available
    if (redisClient) {
      await redisClient.setEx(key, expirationTime, JSON.stringify(data));
    }

    // Also store in memory cache
    memoryCache.set(key, data, expirationTime);

    logger.info('Data cached', { key, expiration: expirationTime });
  } catch (error) {
    logger.error('Error setting cache', { error: error.message, key });
  }
};

const getCache = async (key) => {
  try {
    // Try Redis first
    let cachedData = null;
    if (redisClient) {
      try {
        cachedData = await redisClient.get(key);
        if (cachedData) {
          cachedData = JSON.parse(cachedData);
          logger.info('Redis cache retrieved', { key });
          return cachedData;
        }
      } catch (redisErr) {
        logger.warn('Redis get failed, trying memory cache', { error: redisErr.message });
      }
    }

    // If Redis failed or didn't have the data, try memory cache
    cachedData = memoryCache.get(key);
    if (cachedData) {
      logger.info('Memory cache retrieved', { key });
      return cachedData;
    }

    return null;
  } catch (error) {
    logger.error('Error getting cache', { error: error.message, key });
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    // Delete from Redis if available
    if (redisClient) {
      await redisClient.del(key);
    }

    // Also delete from memory cache
    memoryCache.del(key);

    logger.info('Cache deleted', { key });
  } catch (error) {
    logger.error('Error deleting cache', { error: error.message, key });
  }
};

const clearCacheByPattern = async (pattern) => {
  try {
    // Clear Redis cache by pattern if available
    if (redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }

    // For memory cache, we'll clear all since NodeCache doesn't support patterns
    memoryCache.flushAll();

    logger.info('Cache cleared by pattern', { pattern });
  } catch (error) {
    logger.error('Error clearing cache by pattern', { error: error.message, pattern });
  }
};

export {
  initializeRedis,
  cacheMiddleware,
  setCache,
  getCache,
  deleteCache,
  clearCacheByPattern,
  redisClient,
  memoryCache
};