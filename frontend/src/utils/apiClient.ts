import axios from 'axios';

// Configure axios defaults to include credentials (cookies)
axios.defaults.withCredentials = true;

// Create an axios instance with proper configuration
const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Add request interceptor to ensure credentials are always included
apiClient.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is set for each request
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;