import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAdmin from "./useAdmin";

const useAuthRedirect = () => {
    const router = useRouter();
    const { admin, isLoading } = useAdmin();

    useEffect(() => {
        if (!isLoading) {
            if (admin) {
                router.replace("/dashboard");
            } else {
                router.replace("/login");
            }
        }
    }, [admin, isLoading, router]);

    return { admin, isLoading };
};

export default useAuthRedirect;
