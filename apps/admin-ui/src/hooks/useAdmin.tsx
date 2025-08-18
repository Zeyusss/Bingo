import {useQuery} from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

let isLoggingOut = false;

export const setAdminLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

const fetchAdmin = async ()=> {
    if (isLoggingOut) {
        throw new Error('Logout in progress');
    }
    try {
        const response = await axiosInstance.get("/api/logged-in-admin");
        return response.data.user
    } catch (error: any) {
        console.error('Admin fetch failed:', error.response?.status || error.message);
        throw error;
    }
}

const useAdmin = ()=>{
    const {
        data:admin,
        isLoading,
        isError,
        refetch
    } = useQuery({
        queryKey: [ "admin"],
        queryFn: fetchAdmin,
        staleTime: 1000 * 60 * 30, 
        gcTime: 1000 * 60 * 60, 
        refetchInterval: false, 
        refetchOnWindowFocus: false, 
        refetchOnMount: false, 
        refetchOnReconnect: false, 
        retry: false, 
        retryDelay: 1000, 
        enabled: !isLoggingOut, 

        placeholderData: null,
    })

    return { admin , isLoading ,isError,refetch};
}

export default useAdmin;