import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { getQueryConfig, createQueryKey } from "../utils/queryConfig";


const fetchSeller = async () => {
  try {
    const response = await axiosInstance.get("/api/logged-in-seller", {
      requestOptions: {
        priority: 'high', 
        deduplicationKey: 'logged-in-seller'
      }
    });
    return response.data.seller;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      throw error;
    }
    throw error;
  }
};

interface UseSellerOptions {
  enabled?: boolean;
}

const useSeller = (options: UseSellerOptions = {}) => {

  const criticalConfig = getQueryConfig('critical');
  
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: createQueryKey("seller"),
    queryFn: fetchSeller,
    ...criticalConfig,
    enabled: options.enabled !== false,
    retry: (failureCount: number, error: any) => {
      
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 15, 
    gcTime: 1000 * 60 * 30, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false, 
  });
  
  return { seller, isLoading, isError, refetch };
};

export default useSeller;
