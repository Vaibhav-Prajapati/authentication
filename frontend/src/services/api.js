import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from './token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;

let refreshSubscribers = [];

// --------------------------------------------------
// Add request to queue while token is refreshing
// --------------------------------------------------

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// --------------------------------------------------
// Notify all queued requests after refresh succeeds
// --------------------------------------------------

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => {
    callback(newAccessToken);
  });

  refreshSubscribers = [];
};

// --------------------------------------------------
// Request interceptor
// --------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --------------------------------------------------
// Response interceptor
// --------------------------------------------------

api.interceptors.response.use(
  // Successful response
  (response) => {
    return response;
  },

  // Error response
  async (error) => {
    const originalRequest = error.config;

    // ------------------------------------------------
    // Check whether response is 401
    // ------------------------------------------------

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // ------------------------------------------------
    // Prevent refresh endpoint from causing
    // another refresh attempt
    // ------------------------------------------------

    if (originalRequest.url?.includes('/auth/token/refresh/')) {
      clearTokens();

      return Promise.reject(error);
    }

    // ------------------------------------------------
    // Prevent infinite retry loop
    // ------------------------------------------------

    if (originalRequest._retry) {
      clearTokens();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken();

    // ------------------------------------------------
    // No refresh token available
    // ------------------------------------------------

    if (!refreshToken) {
      clearTokens();

      return Promise.reject(error);
    }

    // ------------------------------------------------
    // If another request is already refreshing the token,
    // put this request into the queue
    // ------------------------------------------------

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newAccessToken) => {
          if (!newAccessToken) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          resolve(api(originalRequest));
        });
      });
    }

    // ------------------------------------------------
    // Start token refresh
    // ------------------------------------------------

    isRefreshing = true;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/token/refresh/`,
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken = response.data.access;

      // ------------------------------------------------
      // Save new access token
      // ------------------------------------------------

      setAccessToken(newAccessToken);

      // ------------------------------------------------
      // Notify queued requests
      // ------------------------------------------------

      onRefreshed(newAccessToken);

      // ------------------------------------------------
      // Retry original request
      // ------------------------------------------------

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      // ------------------------------------------------
      // Refresh token is invalid / expired
      // ------------------------------------------------

      clearTokens();

      // Notify queued requests that refresh failed
      refreshSubscribers.forEach((callback) => {
        callback(null);
      });

      refreshSubscribers = [];

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
