import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { getQueryConfig, createQueryKey } from "../utils/queryConfig";
import { useRouter } from "next/navigation";

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
    
      return null;
    }
    throw error;
  }
};

interface UseSellerOptions {
  enabled?: boolean;
}

const useSeller = (options: UseSellerOptions = {}) => {
  const criticalConfig = getQueryConfig('critical');
  const queryClient = useQueryClient();
  const router = useRouter();
  
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
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 30, 
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    meta: {
      timeout: 5000
    }
  });

  const logout = async () => {
    try {
      await axiosInstance.get("/api/logout-seller", {
        withCredentials: true
      });
      
      queryClient.clear();
      
      router.push("/login");
    } catch (error) {
      console.error('Logout error:', error);
      queryClient.clear();
      router.push("/login");
    }
  };
  
  return { seller, isLoading, isError, refetch, logout };
};

export default useSeller;
