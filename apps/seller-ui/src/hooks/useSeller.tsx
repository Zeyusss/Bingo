import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

// fetch seller data
const fetchSeller = async () => {
  const response = await axiosInstance.get("/api/logged-in-seller");
  return response.data.seller;
};

interface UseSellerOptions {
  enabled?: boolean;
}

const useSeller = (options: UseSellerOptions = {}) => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    enabled: options.enabled !== false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
  });
  return { seller, isLoading, isError, refetch };
};

export default useSeller;
