import React from "react";
import SidebarWrapper from "../shared/components/sidebar";
import { QueryProvider } from "../shared/components/providers/QueryProvider";

const Layout = ({ children }: { children: React.ReactNode }) => {
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
