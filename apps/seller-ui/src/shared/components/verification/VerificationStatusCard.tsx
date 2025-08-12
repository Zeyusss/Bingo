import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import axiosInstance from "../../../utils/axiosInstance";

type VerificationStatus =
  | "None"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "RequiresResubmission";

interface VerificationData {
  id: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationNotes?: string;
}

const VerificationStatusCard = () => {
  const { data: verificationData, isLoading } = useQuery<{
    success: boolean;
    verification: VerificationData;
  }>({
    queryKey: ["verification-status"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/seller/api/verification/status"
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const verification = verificationData?.verification;
  if (!verification) return null;

  const getStatusConfig = (status: VerificationStatus) => {
    switch (status) {
      case "None":
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          title: "Verification Required",
          message:
            "Please complete your identity verification to start selling.",
          actionText: "Start Verification",
          actionLink: "/verification",
        };
      case "Pending":
        return {
          icon: <Clock className="w-5 h-5 text-blue-500" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          title: "Under Review",
          message: "Your verification is being reviewed by our team.",
          actionText: "View Status",
          actionLink: "/verification",
        };
      case "Approved":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Verified",
          message:
            "Your identity has been verified. You can now sell on our platform.",
          actionText: null,
          actionLink: null,
        };
      case "Rejected":
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Verification Rejected",
          message:
            "Your verification was not approved. Please review the feedback and try again.",
          actionText: "View Details",
          actionLink: "/verification",
        };
      case "RequiresResubmission":
        return {
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Resubmission Required",
          message:
            "Please update your verification documents based on our feedback.",
          actionText: "Update Documents",
          actionLink: "/verification",
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          title: "Unknown Status",
          message: "Please contact support for assistance.",
          actionText: "Contact Support",
          actionLink: "/support",
        };
    }
  };

  const config = getStatusConfig(verification.verificationStatus);

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-6`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${config.color}`}>
            {config.title}
          </h3>
          <p className="text-gray-700 text-sm mt-1">{config.message}</p>

          {verification.verificationNotes && (
            <div className="mt-3 p-3 bg-white rounded border">
              <p className="text-sm text-gray-800">
                <strong>Admin Notes:</strong> {verification.verificationNotes}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {verification.verificationSubmittedAt && (
                <span>
                  Submitted:{" "}
                  {new Date(
                    verification.verificationSubmittedAt
                  ).toLocaleDateString()}
                </span>
              )}
              {verification.verificationReviewedAt && (
                <span className="ml-4">
                  Reviewed:{" "}
                  {new Date(
                    verification.verificationReviewedAt
                  ).toLocaleDateString()}
                </span>
              )}
            </div>

            {config.actionText && config.actionLink && (
              <Link
                href={config.actionLink}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  verification.verificationStatus === "Approved"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : verification.verificationStatus === "Rejected"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : verification.verificationStatus === "RequiresResubmission"
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : verification.verificationStatus === "Pending"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-yellow-600 text-white hover:bg-yellow-700"
                }`}
              >
                {config.actionText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusCard;
