import axios from 'axios';
import { getAccessToken, setAccessToken, clearTokens } from './token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => {
    callback(newAccessToken);
  });

  refreshSubscribers = [];
};

const getCSRFToken = () => {
  const name = 'csrftoken=';

  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();

    if (cookie.startsWith(name)) {
      return decodeURIComponent(cookie.substring(name.length));
    }
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    console.log('Request Interceptor Success');

    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const csrfToken = getCSRFToken();

    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => {
    console.log('Request Interceptor Error');
    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    /*
        |--------------------------------------------------------------------------
        | Prevent refresh endpoint from refreshing itself
        |--------------------------------------------------------------------------
        */

    if (originalRequest.url?.includes('/token/refresh/')) {
      clearTokens();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    /*
        |--------------------------------------------------------------------------
        | If another request is already refreshing the token
        |--------------------------------------------------------------------------
        */

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

    /*
        |--------------------------------------------------------------------------
        | Start token refresh
        |--------------------------------------------------------------------------
        */

    isRefreshing = true;

    try {
      const response = await api.post('/token/refresh/');

      const newAccessToken = response.data.access;

      setAccessToken(newAccessToken);

      onRefreshed(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();

      onRefreshed(null);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
