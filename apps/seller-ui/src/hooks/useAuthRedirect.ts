import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "./useSeller";

const useAuthRedirect = () => {
    const router = useRouter();
    const { seller, isLoading } = useSeller();

    useEffect(() => {
        if (!isLoading) {
            if (seller) {
                router.replace("/dashboard");
            } else {
                router.replace("/login");
            }
        }
    }, [seller, isLoading, router]);

    return { seller, isLoading };
};

export default useAuthRedirect;
