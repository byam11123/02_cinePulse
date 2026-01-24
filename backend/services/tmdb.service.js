import axios from "axios";
import { ENV_VARS } from "../config/envVars.js";
import logger from "../utils/logger.js";
import { getCache, setCache } from "../utils/cache.js";
import { AppError } from "../utils/errors.js";

export const fetchFromTMDB = async (url) => {
  try {
    // Check cache first
    const cachedData = await getCache(url);
    if (cachedData) {
      // logger.info("TMDB Cache Hit", { url });
      return cachedData;
    }

    // Check if TMDB_API_KEY is available
    if (!ENV_VARS.TMDB_API_KEY) {
      logger.error("TMDB_API_KEY is not set in environment variables");
      throw new Error("TMDB API key is not configured");
    }

    const options = {
      headers: {
        accept: "application/json",
        Authorization: "Bearer " + ENV_VARS.TMDB_API_KEY,
      },
    };

    const response = await axios.get(url, options);

    if (response.status !== 200) {
      logger.error("TMDB API request failed", {
        url,
        status: response.status,
        statusText: response.statusText
      });
      throw new AppError(`Failed to fetch data from TMDB: ${response.statusText}`, response.status);
    }

    // Cache the successful response for 1 hour (3600 seconds)
    // Adjust TTL based on requirements, but 1 hour seems reasonable for trending/lists
    await setCache(url, response.data, 3600);

    return response.data;
  } catch (error) {
    logger.error("Error fetching from TMDB", {
      url,
      error: error.message,
      code: error.code,
      responseStatus: error.response?.status
    });

    // If it's an axios error with a response, propagate the status code
    if (error.response) {
      throw new AppError(
        `TMDB Error: ${error.response.statusText || error.message}`, 
        error.response.status
      );
    }

    // Re-throw if it's already an AppError
    if (error instanceof AppError) {
      throw error;
    }

    // Fallback for other errors
    throw new AppError(error.message, 500);
  }
};
