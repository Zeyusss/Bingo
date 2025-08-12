"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import Image from "next/image";
import axiosInstance from "../../../utils/axiosInstance";

// API functions
const fetchPendingVerifications = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(
    `/admin/api/verifications/pending?page=${page}&limit=${limit}`
  );
  return response.data;
};

const fetchVerificationDetails = async (sellerId: string) => {
  const response = await axiosInstance.get(
    `/admin/api/verifications/${sellerId}`
  );
  return response.data;
};

const reviewVerification = async ({
  sellerId,
  action,
  notes,
}: {
  sellerId: string;
  action: string;
  notes?: string;
}) => {
  const response = await axiosInstance.post(
    `/admin/api/verifications/${sellerId}/review`,
    {
      action,
      notes,
    }
  );
  return response.data;
};

const VerificationManagementPage = () => {
  const queryClient = useQueryClient();
  const [selectedVerification, setSelectedVerification] = useState<
    string | null
  >(null);
  const [reviewAction, setReviewAction] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch pending verifications
  const {
    data: verifications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pending-verifications", currentPage],
    queryFn: () => fetchPendingVerifications(currentPage, 10),
    staleTime: 1000 * 60 * 5,
  });

  // Fetch verification details
  const {
    data: verificationDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useQuery({
    queryKey: ["verification-details", selectedVerification],
    queryFn: () =>
      selectedVerification
        ? fetchVerificationDetails(selectedVerification)
        : null,
    enabled: !!selectedVerification,
    staleTime: 1000 * 60 * 5,
  });

  // Note: isLoadingDetails is used for future loading state implementation

  // Review verification mutation
  const reviewMutation = useMutation({
    mutationFn: reviewVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["verification-details"] });
      setShowReviewModal(false);
      setSelectedVerification(null);
      setReviewAction("");
      setReviewNotes("");
    },
  });

  const handleReview = () => {
    if (selectedVerification && reviewAction) {
      reviewMutation.mutate({
        sellerId: selectedVerification,
        action: reviewAction,
        notes: reviewNotes,
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="text-yellow-500" size={20} />;
      case "Approved":
        return <CheckCircle className="text-green-500" size={20} />;
      case "Rejected":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <AlertTriangle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredVerifications =
    verifications?.verifications?.filter(
      (verification: any) =>
        verification.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.shop.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Seller Verification Management
            </h1>
            <p className="text-gray-600 mt-2">
              Review and manage seller identity verifications
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Clock className="text-blue-600" size={20} />
            <span className="text-blue-700 font-medium">
              {verifications?.pagination?.totalCount || 0} Pending Reviews
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by seller name, email, or shop name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verification List */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Verifications
                </h2>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-20 bg-gray-200 animate-pulse rounded"
                      ></div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <XCircle className="mx-auto text-red-400 mb-3" size={48} />
                    <p className="text-red-500 mb-2">
                      Failed to load verifications
                    </p>
                    <p className="text-gray-500 text-sm">
                      {error instanceof Error
                        ? error.message
                        : "Please try again later"}
                    </p>
                  </div>
                ) : filteredVerifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <AlertTriangle
                      className="mx-auto text-gray-400 mb-3"
                      size={48}
                    />
                    <p className="text-gray-500">
                      No pending verifications found
                    </p>
                  </div>
                ) : (
                  filteredVerifications.map((verification: any) => (
                    <div
                      key={verification.id}
                      onClick={() => setSelectedVerification(verification.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                        selectedVerification === verification.id
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {verification.name}
                        </h3>
                        {getStatusIcon(verification.verificationStatus)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {verification.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {verification.shop.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Submitted:{" "}
                        {new Date(
                          verification.verificationSubmittedAt
                        ).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {verification.termsAccepted ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={12} />
                            <span className="text-xs">Terms Accepted</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500">
                            <XCircle size={12} />
                            <span className="text-xs">Terms Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="lg:col-span-2">
            {selectedVerification && detailsError ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="text-center">
                  <XCircle className="mx-auto text-red-400 mb-3" size={48} />
                  <p className="text-red-500 mb-2">
                    Failed to load verification details
                  </p>
                  <p className="text-gray-500 text-sm">
                    {detailsError instanceof Error
                      ? detailsError.message
                      : "Please try again later"}
                  </p>
                </div>
              </div>
            ) : selectedVerification && verificationDetails ? (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Verification Details
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        verificationDetails.verification.verificationStatus
                      )}`}
                    >
                      {verificationDetails.verification.verificationStatus}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Seller Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Seller Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <User className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">
                            {verificationDetails.verification.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">
                            {verificationDetails.verification.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">
                            {verificationDetails.verification.phone_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Country</p>
                          <p className="font-medium">
                            {verificationDetails.verification.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Submitted</p>
                          <p className="font-medium">
                            {new Date(
                              verificationDetails.verification.verificationSubmittedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shop Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Shop Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Shop Name</p>
                        <p className="font-medium">
                          {verificationDetails.verification.shop.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">
                          {verificationDetails.verification.shop.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Documents */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Verification Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          title: "ID Front",
                          image: verificationDetails.verification.idFrontImage,
                        },
                        {
                          title: "ID Back",
                          image: verificationDetails.verification.idBackImage,
                        },
                        {
                          title: "Personal Photo",
                          image: verificationDetails.verification.personalImage,
                        },
                      ].map((doc, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h4 className="font-medium text-gray-900 mb-2">
                            {doc.title}
                          </h4>
                          {doc.image ? (
                            <div className="space-y-2">
                              <Image
                                src={doc.image}
                                alt={doc.title}
                                width={200}
                                height={150}
                                className="rounded border object-cover"
                              />
                              <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                                <Eye size={16} />
                                View Full Size
                              </button>
                            </div>
                          ) : (
                            <p className="text-red-500 text-sm">
                              Document not uploaded
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms Acceptance Status */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Terms & Conditions Acceptance
                    </h3>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            Verification Terms
                          </h4>
                          <p className="text-sm text-gray-600">
                            Seller agreement to verification terms and
                            conditions
                          </p>
                        </div>
                        <div className="text-right">
                          {verificationDetails.verification.termsAccepted ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle size={18} />
                              <span className="font-medium">Accepted</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-500">
                              <XCircle size={18} />
                              <span className="font-medium">Not Accepted</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {verificationDetails.verification.termsAcceptedAt && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Accepted on:{" "}
                            {new Date(
                              verificationDetails.verification.termsAcceptedAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review Actions */}
                  {verificationDetails.verification.verificationStatus ===
                    "Pending" && (
                    <div className="space-y-4">
                      {/* Terms Warning */}
                      {!verificationDetails.verification.termsAccepted && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle size={18} />
                            <p className="font-medium">Terms Not Accepted</p>
                          </div>
                          <p className="text-yellow-700 text-sm mt-1">
                            This verification cannot be approved until the
                            seller accepts the terms and conditions.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setReviewAction("approve");
                            setShowReviewModal(true);
                          }}
                          disabled={
                            !verificationDetails.verification.termsAccepted
                          }
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setReviewAction("reject");
                            setShowReviewModal(true);
                          }}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setReviewAction("require_resubmission");
                            setShowReviewModal(true);
                          }}
                          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
                        >
                          <FileText size={18} />
                          Request Resubmission
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <Eye className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500">
                  Select a verification to view details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {reviewAction === "approve"
                  ? "Approve Verification"
                  : reviewAction === "reject"
                  ? "Reject Verification"
                  : "Request Resubmission"}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {reviewAction === "approve"
                    ? "Approval Notes (Optional)"
                    : "Reason for action"}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    reviewAction === "approve"
                      ? "Any additional comments..."
                      : reviewAction === "reject"
                      ? "Explain why the verification is being rejected..."
                      : "Explain what needs to be corrected and resubmitted..."
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReview}
                  disabled={reviewMutation.isPending}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition ${
                    reviewAction === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : reviewAction === "reject"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  } disabled:opacity-50`}
                >
                  {reviewMutation.isPending ? "Processing..." : "Confirm"}
                </button>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewAction("");
                    setReviewNotes("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationManagementPage;
