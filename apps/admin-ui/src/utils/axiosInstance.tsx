import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { requestManager, RequestOptions } from './requestManager';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}


let showToast: ((message: string, type: 'success' | 'error' | 'loading') => void) | null = null;


export const setToastFunction = (toastFn: typeof showToast) => {
  showToast = toastFn;
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
  timeout: 30000, 
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];
let rateLimitCount = 0;
let lastRateLimitTime = 0;
let isLoggingOut = false;


const handleLogout = () => {
  isLoggingOut = true;
  if (window.location.pathname !== "/") {
    requestManager.clear();
    window.location.href = "/";
  }
};

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};


const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};


axiosInstance.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const endTime = Date.now();
    const startTime = response.config.metadata?.startTime || endTime;
    const responseTime = endTime - startTime;
    
    if (responseTime > 5000) {
      console.warn(`Slow request detected: ${response.config.url} took ${responseTime}ms`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const currentTime = Date.now();

    if (error.response?.status === 429) {
      rateLimitCount++;
      lastRateLimitTime = currentTime;
      
      if (showToast) {
        if (rateLimitCount === 1) {
          showToast('Dashboard busy. Retrying automatically...', 'loading');
        } else if (rateLimitCount <= 3) {
          showToast('High traffic detected. Please wait...', 'loading');
        } else {
          showToast('System overloaded. Using smart delays...', 'error');
        }
      }
      
      return Promise.reject(error);
    }
    
    if (currentTime - lastRateLimitTime > 300000) {
      rateLimitCount = 0;
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isLoggingOut) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        isRefreshing = false;
        onRefreshSuccess();
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError.message);
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(refreshError);
      }
    }
    
    // If we're logging out, just reject the request without refresh attempts
    if (error.response?.status === 401 && isLoggingOut) {
      return Promise.reject(error);
    }


    if (error.response?.status >= 500 && showToast) {
      showToast('Server error. Retrying automatically...', 'error');
    }

    return Promise.reject(error);
  }
);


const enhancedAxiosInstance = {
  ...axiosInstance,
  
  async get(url: string, config?: AxiosRequestConfig & { requestOptions?: RequestOptions }) {
    const { requestOptions, ...axiosConfig } = config || {};
    return requestManager.enqueue(url, { method: 'GET', ...axiosConfig }, requestOptions);
  },
  
  async post(url: string, data?: any, config?: AxiosRequestConfig & { requestOptions?: RequestOptions }) {
    const { requestOptions, ...axiosConfig } = config || {};
    return requestManager.enqueue(url, { method: 'POST', data, ...axiosConfig }, requestOptions);
  },
  
  async put(url: string, data?: any, config?: AxiosRequestConfig & { requestOptions?: RequestOptions }) {
    const { requestOptions, ...axiosConfig } = config || {};
    return requestManager.enqueue(url, { method: 'PUT', data, ...axiosConfig }, requestOptions);
  },
  
  async patch(url: string, data?: any, config?: AxiosRequestConfig & { requestOptions?: RequestOptions }) {
    const { requestOptions, ...axiosConfig } = config || {};
    return requestManager.enqueue(url, { method: 'PATCH', data, ...axiosConfig }, requestOptions);
  },
  
  async delete(url: string, config?: AxiosRequestConfig & { requestOptions?: RequestOptions }) {
    const { requestOptions, ...axiosConfig } = config || {};
    return requestManager.enqueue(url, { method: 'DELETE', ...axiosConfig }, requestOptions);
  },
  
  direct: axiosInstance,
  
  getStatus: () => requestManager.getStatus(),
};
export default enhancedAxiosInstance;
