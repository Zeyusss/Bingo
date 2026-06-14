"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import useSeller from "../../../hooks/useSeller";
import CreateShop from "../../../shared/modules/auth/create-shop";

const CompleteShopSetupPage = () => {
  const { seller, isLoading } = useSeller();
  const router = useRouter();

  useEffect(() => {
    if (!seller && !isLoading) {
      router.push("/login");
    }
    if (seller?.shop) {
      router.push("/");
    }
  }, [seller, isLoading, router]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-[#F4F2EF] flex items-center justify-center"
        style={{
          backgroundImage: "url('/assets/wd-furniture-background.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      >
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  const handleShopSuccess = () => {
    router.push("/");
  };

  return (
    <div
      className="min-h-screen bg-[#F4F2EF] p-4 md:p-8"
      style={{
        backgroundImage: "url('/assets/wd-furniture-background.webp')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black font-[Poppins]">
            Complete Your Shop Setup
          </h1>
          <p className="text-lg text-gray-600 mt-2 font-[Work Sans]">
            Your account is created, but your shop setup is incomplete. Please
            complete the form below to continue.
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
          <CreateShop setActiveStep={handleShopSuccess} />
        </div>
      </div>
    </div>
  );
};

export default CompleteShopSetupPage;
