import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAdmin from "./useAdmin";

const useRequireAuth = () => {
    const router = useRouter();
    const { admin, isLoading } = useAdmin();

    useEffect(() => {
        if (!isLoading && !admin) {
            router.replace("/login");
        }
    }, [admin, isLoading, router]);

    return { admin, isLoading };
};

export default useRequireAuth;
