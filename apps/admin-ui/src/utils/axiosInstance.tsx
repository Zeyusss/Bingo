import axios from "axios";


const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
withCredentials:true,
});

let isRefreshing = false;
let refreshSubscribers:(()=> void)[] = [];

// handle logout and prevent infinite loops
const handleLogout = ()=>{
if(window.location.pathname !== "/"){
    window.location.href = "/";
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
                await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`, {}, {
                    withCredentials: true,
                });
                isRefreshing = false;
                onRefreshSuccess();
                return axiosInstance(originalRequest);
            } catch (error) {
                isRefreshing = false;
                refreshSubscribers = [];
                handleLogout();
                return Promise.reject(error);
            }
        }
            return Promise.reject(error);  
    }
)
export default axiosInstance;
