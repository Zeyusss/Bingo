import { QueryClient, DefaultOptions } from '@tanstack/react-query';

export interface QueryOptions {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean | 'always';
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  retryDelay?: number | ((retryAttempt: number, error: any) => number);
  refetchInterval?: number;
}


export const queryConfigs = {
  critical: {
    staleTime: 1000 * 60 * 10, 
    gcTime: 1000 * 60 * 20, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: (failureCount: number, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  } as QueryOptions,

  dashboard: {
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 2000,
    refetchInterval: 1000 * 60 * 10, 
  } as QueryOptions,


  standard: {
    staleTime: 1000 * 60 * 8, 
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 1500,
  } as QueryOptions,


  analytics: {
    staleTime: 1000 * 60 * 30, 
    gcTime: 1000 * 60 * 60, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  } as QueryOptions,


  realtime: {
    staleTime: 1000 * 30, 
    gcTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: 'always',
    retry: 2,
    retryDelay: 500,
    refetchInterval: 1000 * 60 * 2,
  } as QueryOptions,
};


const defaultOptions: DefaultOptions = {
  queries: {
    
    ...queryConfigs.dashboard,
    
    
    networkMode: 'online',
    
    
    throwOnError: false,
    
    
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    
    
    retry: (failureCount: number, error: any) => {
      
      if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 429) {
        return false;
      }
      
      
      return failureCount < 3;
    },
    
    
    retryDelay: (attemptIndex: number, error: any) => {
      
      if (error?.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          return parseInt(retryAfter) * 1000;
        }
      }
      
      
      const baseDelay = 1000;
      const exponentialDelay = baseDelay * Math.pow(2, attemptIndex);
      const maxDelay = 30000; 
      
      
      const jitter = Math.random() * 0.1 * exponentialDelay;
      
      return Math.min(exponentialDelay + jitter, maxDelay);
    },
  },
  
  mutations: {
    
    retry: (failureCount: number, error: any) => {
      
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    
    retryDelay: (attemptIndex: number) => {
      return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
    },
    
    networkMode: 'online',
  },
};


export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions,
    
  });
};


export const getQueryConfig = (priority: keyof typeof queryConfigs = 'dashboard'): QueryOptions => {
  return queryConfigs[priority];
};


export const createQueryKey = (entity: string, ...params: (string | number | undefined)[]): string[] => {
  const filteredParams = params.filter(param => param !== undefined);
  return [entity, ...filteredParams.map(String)];
};


export const getInfiniteQueryConfig = (priority: keyof typeof queryConfigs = 'standard') => {
  const baseConfig = getQueryConfig(priority);
  return {
    ...baseConfig,
    getNextPageParam: (lastPage: any, pages: any[]) => {
      if (lastPage?.hasMore || lastPage?.nextPage) {
        return lastPage.nextPage || pages.length + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage: any, pages: any[]) => {
      return pages.length > 1 ? pages.length - 1 : undefined;
    },
  };
};


export const dashboardQueries = {
  metrics: () => createQueryKey('dashboard', 'metrics'),
  revenue: (period?: string) => createQueryKey('dashboard', 'revenue', period),
  users: () => createQueryKey('dashboard', 'users'),
  orders: (status?: string) => createQueryKey('dashboard', 'orders', status),

  liveStats: () => createQueryKey('dashboard', 'live-stats'),
  notifications: () => createQueryKey('dashboard', 'notifications'),
  
  analytics: (type: string, period?: string) => createQueryKey('analytics', type, period),
  reports: (type: string) => createQueryKey('reports', type),
};
