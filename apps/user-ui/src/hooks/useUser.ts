import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "../utils/protected";

const fetchUser = async () => {
  try {

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); 
    
    const response = await axiosInstance.get("/api/logged-in-user", {
      ...isProtected,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.data.user ?? null;
  } catch (error: any) {
   
    if (error.name === 'AbortError') {
      console.warn("User fetch timed out - backend may be unavailable");
    } else if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      console.warn("Backend connection failed - running in offline mode");
    } else if (error?.response?.status !== 401 && error?.response?.status !== 400) {
      console.error("Failed to fetch user data:", error);
    }
    return null;
  }
};

const useUser = () => {
  const { isLoggedIn, setLoggedIn } = useAuthStore();
  const [hasInitialized, setHasInitialized] = React.useState(false);

  const {
    data: user,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 30, 
    retry: 1,
    retryDelay: 1000, 
    refetchOnWindowFocus: false,
    refetchOnMount: true, 
    refetchOnReconnect: true,
    enabled: false,

    meta: {
      timeout: 5000 
    }
  });

  React.useEffect(() => {
    if (!hasInitialized && (user !== undefined || isError)) {
      setHasInitialized(true);
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    }
  }, [user, isError, hasInitialized, setLoggedIn]);

 
  const shouldShowUser = isLoggedIn || !hasInitialized;
  
  return { 
    user: shouldShowUser ? (user as any) : null, 
    isLoading: !hasInitialized || isPending, 
    isError 
  };
};

export default useUser;
