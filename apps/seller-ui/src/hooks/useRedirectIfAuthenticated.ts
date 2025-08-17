import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "./useSeller";

const useRedirectIfAuthenticated = () => {
    const router = useRouter();
    
    // Disable authentication check on signup page to prevent API spam
    const { seller, isLoading } = useSeller({ enabled: false });

    useEffect(() => {
        if (!isLoading && seller) {
            router.replace("/dashboard");
        }
    }, [seller, isLoading, router]);

    return { seller, isLoading };
};

export default useRedirectIfAuthenticated;
