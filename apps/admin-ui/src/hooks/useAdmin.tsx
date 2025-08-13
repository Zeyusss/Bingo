import {useQuery} from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

//fetch admin data from API
const fetchAdmin = async ()=> {
    const response = await axiosInstance.get("/api/logged-in-admin");
    return response.data.user
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
        retry: 0, 

        placeholderData: null,
    })

    return { admin , isLoading ,isError,refetch};
}

export default useAdmin;