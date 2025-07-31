"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useSeller from "../../hooks/useSeller";
import { WebSocketProvider } from "../../context/web-socket-context";
import ClientRestrictionWrapper from "./ClientRestrictionWrapper";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/login", "/signup", "/forgot-password"];
  const isPublicPath = publicPaths.includes(pathname);

  const { seller, isLoading, isError } = useSeller({
    enabled: !isPublicPath,
  });

  useEffect(() => {
    
    if (!isPublicPath && !isLoading && !seller) {
      router.replace("/login");
    }
  }, [seller, isLoading, isError, router, pathname, isPublicPath]);

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  
  if (seller) {
    return (
      <WebSocketProvider seller={seller}>
        <ClientRestrictionWrapper>{children}</ClientRestrictionWrapper>
      </WebSocketProvider>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default AuthGuard;
