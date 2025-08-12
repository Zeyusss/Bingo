"use client";
import SidebarBarWrapper from "apps/seller-ui/src/shared/components/sidebar/sidebar";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "../../../hooks/useSeller";
import { Shield, AlertTriangle } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { seller, isLoading } = useSeller();
  const router = useRouter();

  useEffect(() => {
    if (!seller && !isLoading) {
      router.push("/login");
    }
  }, [seller, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show verification required message for unverified sellers
  if (
    seller &&
    (!seller.isVerified ||
      seller.verificationStatus === "None" ||
      seller.verificationStatus === "Pending" ||
      seller.verificationStatus === "Rejected" ||
      seller.verificationStatus === "RequiresResubmission")
  ) {
    const getVerificationMessage = () => {
      switch (seller.verificationStatus) {
        case "None":
          return "You need to complete identity verification before accessing the seller dashboard.";
        case "Pending":
          return "Your verification is under review. You'll be notified once it's completed.";
        case "Rejected":
          return "Your verification was rejected. Please review the feedback and try again.";
        case "RequiresResubmission":
          return "Your verification requires resubmission. Please update your documents.";
        default:
          return "You need to complete identity verification before accessing the seller dashboard.";
      }
    };

    const getButtonText = () => {
      switch (seller.verificationStatus) {
        case "None":
          return "Start Verification";
        case "Pending":
          return "View Status";
        case "Rejected":
        case "RequiresResubmission":
          return "Update Verification";
        default:
          return "Start Verification";
      }
    };
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verification Required
            </h2>
            <p className="text-gray-300">{getVerificationMessage()}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/settings/verification")}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <Shield size={20} />
              {getButtonText()}
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Sidebar */}
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
          <SidebarBarWrapper />
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
  );
};

export default Layout;
