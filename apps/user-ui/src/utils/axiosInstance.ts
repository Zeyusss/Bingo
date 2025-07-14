import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
withCredentials:true,
});

let isRefreshing = false;
let refreshSubscribers:(()=> void)[] = [];

// handle logout and prevent infinite loops
const handleLogout = ()=>{
    if(window.location.pathname !== "/login"){
        window.location.href = "/login"
    }
}

// handle adding new acces token to queue
const subscribeTokenRefresh = (callback:()=> void)=>{
    refreshSubscribers.push(callback);
};

// execute queued requests after refresh
const onRefreshSuccess = ()=>{
    refreshSubscribers.forEach((callback)=> callback());
    refreshSubscribers= [];
};

// List of protected routes that require authentication
const protectedRoutes = [
  "/cart",
  "/wishlist",
  "/profile",
  "/account",
  "/checkout"
];

const isProtectedRoute = () => {
  const path = window.location.pathname;
  return protectedRoutes.some(route => path.startsWith(route));
};

// handle api requests
axiosInstance.interceptors.request.use(
    (config)=> config,
(error) =>{
    Promise.reject(error);
}
)

//handle expired token
axiosInstance.interceptors.response.use(
    (response)=> response,
    async (error)=>{
        const originalRequest = error.config;

        //prevent infinite loops
        if(error.response?.status === 401 && !originalRequest._retry){
            if(isRefreshing){
                return new Promise((resolve) =>{
                    subscribeTokenRefresh(()=>resolve(axiosInstance(originalRequest)));
                })
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/refresh-token`, {}, {
                    withCredentials: true,
                });
                isRefreshing = false;
                onRefreshSuccess();
                return axiosInstance(originalRequest);
            } catch (error) {
                isRefreshing = false;
                refreshSubscribers = [];
                // Only redirect if on a protected route
                if (isProtectedRoute()) {
                  handleLogout();
                }
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);  
    }
)
export default axiosInstance;
