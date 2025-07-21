import {useQuery} from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "../utils/protected";

// fetch user data
const fetchUser = async (isLoggedIn: boolean)=>{
  try {
      const config = isLoggedIn ? isProtected : {};
      const response = await axiosInstance.get("/api/logged-in-user",config);
    return response.data.user ?? null;
  } catch (error) {
    return null;
  }
}

const useUser= ()=>{
  const {setLoggedIn , isLoggedIn} = useAuthStore();

    const {data:user,isPending,isError} = useQuery({
        queryKey: ["user"],
        queryFn: ()=> fetchUser(isLoggedIn),
        staleTime: 1000 * 60 * 5,
        retry: false,
        // @ts-ignore
        onSuccess : ()=>{
          setLoggedIn(true);
        },
        onError : ()=>{
          setLoggedIn(false);
        }
    })
    return {user:user as any,isLoading:isPending,isError}
}

export default useUser;