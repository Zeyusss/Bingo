"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useUser from "../../hooks/useUser";
import axiosInstance from "../../utils/axiosInstance";

const ClientRestrictionWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isLoading } = useUser();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const hasLoggedOutRef = useRef(false);

  useEffect(() => {
    if (
      !isLoading &&
      user &&
      (user.isBlocked || user.isDeleted) &&
      !hasLoggedOutRef.current
    ) {
      setShowModal(true);
      hasLoggedOutRef.current = true;

      setTimeout(() => {
        axiosInstance
          .get("/api/logout-user", { withCredentials: true })
          .catch(() => {})
          .finally(() => {
            router.replace("/login");
          });
      }, 1500);
    }
  }, [user, isLoading, router]);

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
