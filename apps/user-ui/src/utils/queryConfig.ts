import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// request priority mapping for intelligent caching
const CACHE_STRATEGIES = {
  critical: {
    staleTime: 1000 * 60 * 2, 
    gcTime: 1000 * 60 * 10, 
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  high: {
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 15, 
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 20000),
  },
  medium: {
    staleTime: 1000 * 60 * 10, 
    gcTime: 1000 * 60 * 30, 
    retry: 1,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 15000),
  },
  low: {
    staleTime: 1000 * 60 * 30, 
    gcTime: 1000 * 60 * 60, 
    retry: 0,
    retryDelay: () => 10000,
  }
};



const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 30, 
    
    refetchOnWindowFocus: false, 
    refetchOnReconnect: 'always',
    refetchOnMount: true,
    
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      
      if (status >= 400 && status < 500 && status !== 429) {
        return false;
      }
      
      if (status === 429) {
        return failureCount < 2; 
      }
      
      if (status >= 500) {
        return failureCount < 3; 
      }
      
      return failureCount < 2;
    },
    
    retryDelay: (attemptIndex) => {
      const baseDelay = 1000;
      const maxDelay = 30000;
      const jitter = Math.random() * 0.3;
      return Math.min(baseDelay * Math.pow(2, attemptIndex) * (1 + jitter), maxDelay);
    },
    
    networkMode: 'online',
  },
  
  mutations: {
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      
      if (status >= 400 && status < 500) {
        return false;
      }
      
      return failureCount < 1;
    },
    
    networkMode: 'online',
  },
};

// create optimized query client
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions,
    
    queryCache: undefined, 
    mutationCache: undefined, 
  });
};


export const getCacheStrategy = (priority: keyof typeof CACHE_STRATEGIES = 'medium') => {
  return CACHE_STRATEGIES[priority];
};


export const createQueryOptions = (
  queryKey: string[],
  queryFn: () => Promise<any>,
  options: {
    priority?: keyof typeof CACHE_STRATEGIES;
    enabled?: boolean;
    refetchInterval?: number;
    select?: (data: any) => any;
  } = {}
) => {
  const { priority = 'medium', ...restOptions } = options;
  const strategy = getCacheStrategy(priority);
  
  return {
    queryKey,
    queryFn,
    ...strategy,
    ...restOptions,
  };
};


export const queryClient = createOptimizedQueryClient();
