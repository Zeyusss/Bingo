"use client";

import React, { createContext, useContext, useCallback } from "react";
import { toast, Toaster, ToastOptions } from "react-hot-toast";
import { setToastFunction } from "../../../utils/axiosInstance";

interface ToastContextType {
  showToast: (
    message: string,
    type: "success" | "error" | "loading" | "info"
  ) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showLoading: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "loading" | "info") => {
      const baseOptions: ToastOptions = {
        duration: type === "loading" ? 6000 : 4000,
        position: "top-right",
        style: {
          background: "#fff",
          color: "#333",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          maxWidth: "400px",
        },
      };

      switch (type) {
        case "success":
          toast.success(message, {
            ...baseOptions,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
            style: {
              ...baseOptions.style,
              borderLeft: "4px solid #10b981",
            },
          });
          break;
        case "error":
          toast.error(message, {
            ...baseOptions,
            duration: 6000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              ...baseOptions.style,
              borderLeft: "4px solid #ef4444",
            },
          });
          break;
        case "loading":
          toast.loading(message, {
            ...baseOptions,
            duration: 8000,
            style: {
              ...baseOptions.style,
              borderLeft: "4px solid #3b82f6",
            },
          });
          break;
        case "info":
          toast(message, {
            ...baseOptions,
            icon: "!",
            style: {
              ...baseOptions.style,
              borderLeft: "4px solid #3b82f6",
            },
          });
          break;
      }
    },
    []
  );

  const showSuccess = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast]
  );
  const showError = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast]
  );
  const showLoading = useCallback(
    (message: string) => showToast(message, "loading"),
    [showToast]
  );
  const showInfo = useCallback(
    (message: string) => showToast(message, "info"),
    [showToast]
  );

  React.useEffect(() => {
    setToastFunction(showToast);
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showLoading,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          className: "",
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 6000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
          loading: {
            duration: 8000,
          },
        }}
      />
    </ToastContext.Provider>
  );
};
