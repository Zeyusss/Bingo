"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSeller from "../../hooks/useSeller";
import axiosInstance from "../../utils/axiosInstance";

const ClientRestrictionWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { seller, isLoading } = useSeller();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  useEffect(() => {
    if (!isLoading && seller && (seller.isBlocked || seller.isDeleted)) {
      setShowModal(true);
      if (!hasLoggedOut) {
        setTimeout(() => {
          axiosInstance
            .get("/api/logout-user", { withCredentials: true })
            .catch(() => {})
            .finally(() => {
              setHasLoggedOut(true);
              router.replace("/login");
            });
        }, 1500);
      }
    }
  }, [seller, isLoading, router, hasLoggedOut]);

  if (showModal) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
          <h2 className="text-lg font-semibold mb-2">Account Restricted</h2>
          <p className="mb-4">
            Your account is currently restricted. Please contact support or the
            site administration for assistance.
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              setShowModal(false);
              router.replace("/login");
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ClientRestrictionWrapper;
