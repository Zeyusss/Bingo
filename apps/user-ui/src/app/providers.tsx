"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createOptimizedQueryClient } from "../utils/queryConfig";
import Providers from "../shared/providers/ToastProvider";

import ClientRestrictionWrapper from "../shared/components/ClientRestrictionWrapper";
import ComparisonTray from "../shared/components/comparison/ComparisonTray";
import ComparisonNotifications from "../shared/components/comparison/ComparisonNotifications";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(() => createOptimizedQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Providers>
        <ClientRestrictionWrapper>
          {children}
        </ClientRestrictionWrapper>
        <ComparisonTray />
        <ComparisonNotifications />

        <ReactQueryDevtools initialIsOpen={false} />
      </Providers>
    </QueryClientProvider>
  );
};

export default AppProviders;
