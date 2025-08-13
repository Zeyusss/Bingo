import axios from "axios";
import { runRedirectToLogin } from "./redirect";
import { toast } from "react-hot-toast";
import { useStore } from "../store";

let rateLimitState = {
  isRateLimited: false,
  backoffUntil: 0,
  consecutiveErrors: 0,
  lastErrorTime: 0
};

const requestQueue: Array<{
  config: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 6;
let processingQueue = false;

const calculateBackoffDelay = (consecutiveErrors: number): number => {
  const baseDelay = 1000;
  const maxDelay = 30000;
  const jitter = Math.random() * 0.3;
  return Math.min(baseDelay * Math.pow(2, consecutiveErrors) * (1 + jitter), maxDelay);
}

const processQueue = async (): Promise<void> => {
  if (processingQueue || requestQueue.length === 0) return;
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) return;
  if (rateLimitState.isRateLimited && Date.now() < rateLimitState.backoffUntil) return;

  processingQueue = true;
  const { config, resolve, reject } = requestQueue.shift()!;
  activeRequests++;

  try {
    const response = await axios(config);
    rateLimitState.consecutiveErrors = 0;
    rateLimitState.isRateLimited = false;
    resolve(response);
  } catch (error: any) {
    if (error.response?.status === 429) {
      handle429Error(error, config, resolve, reject);
    } else {
      rateLimitState.consecutiveErrors++;
      rateLimitState.lastErrorTime = Date.now();
      reject(error);
    }
  } finally {
    activeRequests--;
    processingQueue = false;
    setTimeout(processQueue, 50);
  }
}

const handle429Error = (error: any, config: any, resolve: any, reject: any): void => {
  const retryAfter = error.response?.headers['retry-after'];
  const backoffDelay = retryAfter
    ? parseInt(retryAfter) * 1000
    : calculateBackoffDelay(rateLimitState.consecutiveErrors);

  rateLimitState.isRateLimited = true;
  rateLimitState.backoffUntil = Date.now() + backoffDelay;
  rateLimitState.consecutiveErrors++;

  if (rateLimitState.consecutiveErrors === 1) {
    toast.loading('High traffic detected. Optimizing your experience...', {
      id: 'rate-limit-toast',
      duration: Math.min(backoffDelay, 5000)
    });
  }

  setTimeout(() => {
    requestQueue.unshift({ config, resolve, reject });
    processQueue();
  }, backoffDelay);
};

const makeSmartRequest = (config: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const isCritical = config.url?.includes('/auth/') ||
      config.url?.includes('/user/') ||
      config.priority === 'critical';

    if (isCritical || activeRequests < MAX_CONCURRENT_REQUESTS) {
      activeRequests++;
      axios(config)
        .then(response => {
          rateLimitState.consecutiveErrors = 0;
          resolve(response);
        })
        .catch(error => {
          if (error.response?.status === 429) {
            handle429Error(error, config, resolve, reject);
          } else {
            rateLimitState.consecutiveErrors++;
            reject(error);
          }
        })
        .finally(() => {
          activeRequests--;
        });
    } else {
      requestQueue.push({ config, resolve, reject });
      processQueue();
    }
  });
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {

  const { clearSessionData } = useStore.getState();
  clearSessionData();
  
  const publicPaths = ["/login", "/signup", "/forgot-password"];
  const currentPath = window.location.pathname;
  if (!publicPaths.includes(currentPath)) {
    runRedirectToLogin();
  }
};

const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

const protectedRoutes = [
  "/cart",
  "/wishlist",
  "/profile",
  "/account",
  "/checkout",
];

const isProtectedRoute = () => {
  const path = window.location.pathname;
  return protectedRoutes.some((route) => path.startsWith(route));
};

axiosInstance.interceptors.request.use(
  (config: any) => {
    config.metadata = {
      startTime: Date.now(),
      retryCount: config.metadata?.retryCount || 0
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const config = response.config as any;
    if (config.metadata) {
      if (rateLimitState.consecutiveErrors > 0) {
        rateLimitState.consecutiveErrors = Math.max(0, rateLimitState.consecutiveErrors - 1);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status === 429) {
      const retryAfter = error.response?.headers['retry-after'];
      const backoffDelay = retryAfter
        ? parseInt(retryAfter) * 1000
        : calculateBackoffDelay(rateLimitState.consecutiveErrors);

      rateLimitState.isRateLimited = true;
      rateLimitState.backoffUntil = Date.now() + backoffDelay;
      rateLimitState.consecutiveErrors++;

      if (rateLimitState.consecutiveErrors === 1) {
        toast.loading('Optimizing your experience...', {
          id: 'rate-limit-toast',
          duration: 3000
        });
      } else if (rateLimitState.consecutiveErrors === 3) {
        toast.loading('High traffic detected. Please wait a moment...', {
          id: 'rate-limit-toast',
          duration: 5000
        });
      } else if (rateLimitState.consecutiveErrors >= 5) {
        toast.error('Server is busy. Retrying automatically...', {
          id: 'rate-limit-toast',
          duration: 8000
        });
      }

      if (!originalRequest._rateLimitRetry && (originalRequest.metadata?.retryCount || 0) < 3) {
        originalRequest._rateLimitRetry = true;
        originalRequest.metadata = {
          ...originalRequest.metadata,
          retryCount: (originalRequest.metadata?.retryCount || 0) + 1
        };

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            axiosInstance(originalRequest)
              .then(resolve)
              .catch(reject);
          }, backoffDelay);
        });
      }
    }

    const is401 = status === 401;
    const isRetry = originalRequest?._retry;
    const isAuthRequired = originalRequest?.requireAuth === true;
    
    if (is401 && !isRetry && isAuthRequired) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );
        isRefreshing = false;
        onRefreshSuccess();
        return axiosInstance(originalRequest);
      } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        if (isProtectedRoute()) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    }

    if (status >= 500) {
      toast.error('Server maintenance in progress. Retrying...', {
        id: 'server-maintenance-toast',
        duration: 4000
      });
    } else if (status >= 400 && status < 500 && status !== 401 && status !== 429) {
      console.warn('Client error:', status, error.response?.data);
    }

    return Promise.reject(error);
  }
);

const enhancedAxiosInstance = Object.assign(axiosInstance, {
  smart: makeSmartRequest,
  getStatus: () => ({
    activeRequests,
    queuedRequests: requestQueue.length,
    isRateLimited: rateLimitState.isRateLimited,
    consecutiveErrors: rateLimitState.consecutiveErrors,
    backoffUntil: rateLimitState.backoffUntil
  }),
  priority: (config: any, priority = 'medium') => {
    return makeSmartRequest({ ...config, priority });
  }
});

export default enhancedAxiosInstance;
