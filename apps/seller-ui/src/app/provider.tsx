"use client";
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createQueryClient } from "../utils/queryConfig";
import { ToastProvider } from "../shared/components/providers/ToastProvider";
import useSeller from "../hooks/useSeller";
import { WebSocketProvider } from "../context/web-socket-context";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ProvidersWithWebSocket>
        {children}
        </ProvidersWithWebSocket>
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </QueryClientProvider>
  );
};

const ProvidersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { seller } = useSeller();
  
  return (
    <>
      {seller && <WebSocketProvider seller={seller}>{children}</WebSocketProvider>}
      {!seller && children}
    </>
  );
};


export default Providers;
