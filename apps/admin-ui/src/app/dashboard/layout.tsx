"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarWrapper from "../shared/components/sidebar";
import { QueryProvider } from "../shared/components/providers/QueryProvider";
import useAdmin from "../../hooks/useAdmin";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { admin, isLoading, isError } = useAdmin();
  const router = useRouter();


  useEffect(() => {
    if (!isLoading && (!admin || isError)) {
      console.log('Admin not authenticated, redirecting to login...');
      router.replace('/');
    }
  }, [admin, isLoading, isError, router]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

 
  if (!admin || isError) {
    return null;
  }

 
  return (
    <QueryProvider>
      <div
        className="flex h-full min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <aside
          className="w-[280px] min-w-[250px] max-w-[300px]"
          style={{
            borderRight: "1px solid var(--border)",
            background: "var(--background)",
            padding: "var(--sidebar-padding)",
            boxShadow: "2px 0 8px 0 rgba(175,18,57,0.04)",
            zIndex: 10,
          }}
        >
          <div className="sticky top-0">
            <SidebarWrapper />
          </div>
        </aside>
        <main className="flex-1">
          <div
            className="overflow-auto"
            style={{
              padding: "var(--content-padding)",
              background: "rgba(175,18,57,0.02)",
              minHeight: "100vh",
              borderRadius: "1.25rem 0 0 1.25rem",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </QueryProvider>
  );
};

export default Layout;
