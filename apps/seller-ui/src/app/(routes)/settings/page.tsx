"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, User, Bell, Lock } from "lucide-react";
import useSeller from "../../../hooks/useSeller";

const SettingsPage = () => {
  const { seller, isLoading } = useSeller();
  const router = useRouter();

  React.useEffect(() => {
    if (!seller && !isLoading) {
      router.push("/login");
    }
  }, [seller, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const settingsItems = [
    {
      icon: Shield,
      title: "Identity Verification",
      description: "Verify your identity to start selling on our platform",
      href: "/settings/verification",
      status: seller?.isVerified ? "Verified" : "Pending",
      statusColor: seller?.isVerified ? "text-green-600" : "text-yellow-600",
    },
    {
      icon: User,
      title: "Profile Settings",
      description: "Update your personal and shop information",
      href: "/edit-profile",
      status: "Active",
      statusColor: "text-blue-600",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage your notification preferences",
      href: "/settings/notifications",
      status: "Coming Soon",
      statusColor: "text-gray-500",
    },
    {
      icon: Lock,
      title: "Security",
      description: "Password and security settings",
      href: "/settings/security",
      status: "Coming Soon",
      statusColor: "text-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="w-full px-6 pt-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsItems.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (item.href && !item.href.includes("Coming Soon")) {
                  router.push(item.href);
                }
              }}
              className={`bg-gray-800 p-6 rounded-lg border border-gray-700 transition-all duration-200 ${
                item.href && !item.href.includes("Coming Soon")
                  ? "hover:bg-gray-700 cursor-pointer hover:border-blue-500"
                  : "cursor-not-allowed opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <item.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Alert */}
        {!seller?.isVerified && (
          <div className="mt-8 p-6 bg-yellow-900/50 border border-yellow-600 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Shield size={24} className="text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-100">
                Verification Required
              </h3>
            </div>
            <p className="text-yellow-200 mb-4">
              Your identity verification is required to start selling on our
              platform. Complete the verification process to unlock all selling
              features.
            </p>
            <button
              onClick={() => router.push("/settings/verification")}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Start Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
