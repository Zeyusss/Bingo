import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "../utils/protected";

// fetch user data
const fetchUser = async (isLoggedIn: boolean) => {
  try {
    const config = isLoggedIn ? isProtected : {};
    const response = await axiosInstance.get("/api/logged-in-user", config);
    return response.data.user ?? null;
  } catch (error) {
    if (!isLoggedIn) {
      return null;
    }
    throw error;
  }
};

const useUser = () => {
  const { setLoggedIn, isLoggedIn } = useAuthStore();

  const {
    data: user,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchUser(isLoggedIn),
    staleTime: 1000 * 60 * 15, 
    gcTime: 1000 * 60 * 30, 
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false, 
    enabled: true, 
  });

  React.useEffect(() => {
    if (user && !isLoggedIn) {
      setLoggedIn(true);
    } else if (isError && isLoggedIn) {
      setLoggedIn(false);
    }
  }, [user, isError, isLoggedIn, setLoggedIn]);

  return { user: user as any, isLoading: isPending, isError };
};

export default useUser;
