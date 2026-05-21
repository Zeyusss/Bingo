"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  FileText,
  User,
  CreditCard,
} from "lucide-react";
import useRequireAuth from "../../hooks/useRequireAuth";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner";

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
  idFrontImage?: string;
  idBackImage?: string;
  personalImage?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationNotes?: string;
}

const VerificationPage = () => {
  const { seller, isLoading: authLoading } = useRequireAuth();
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>(
    {}
  );
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch verification status
  const {
    data: verificationData,
    isLoading,
    refetch,
  } = useQuery<{ success: boolean; verification: VerificationData }>({
    queryKey: ["verification-status"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/seller/api/verification/status"
      );
      return response.data;
    },
    enabled: !!seller,
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({
      documentType,
      imageData,
    }: {
      documentType: string;
      imageData: string;
    }) => {
      const response = await axiosInstance.post(
        "/seller/api/verification/upload-document",
        {
          documentType,
          imageData,
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.documentType} uploaded successfully`);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Upload failed");
    },
  });

  // Accept terms mutation
  const acceptTermsMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(
        "/seller/api/verification/accept-terms",
        {
          confirmed: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Terms and conditions accepted");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to accept terms");
    },
  });

  // Submit verification mutation
  const submitVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(
        "/seller/api/verification/submit"
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Verification submitted for review");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Submission failed");
    },
  });

  // Download contract
  const downloadContract = async () => {
    try {
      const response = await axiosInstance.get(
        "/seller/api/verification/download-contract",
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "seller_verification_contract.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Contract downloaded successfully");
    } catch (error: any) {
      toast.error("Failed to download contract");
    }
  };

  const handleFileSelect = (documentType: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [documentType]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviews((prev) => ({
        ...prev,
        [documentType]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (documentType: string) => {
    const file = selectedFiles[documentType];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      uploadDocumentMutation.mutate({
        documentType,
        imageData: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case "None":
        return "text-gray-500";
      case "Pending":
        return "text-yellow-500";
      case "Approved":
        return "text-green-500";
      case "Rejected":
        return "text-red-500";
      case "RequiresResubmission":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-5 h-5" />;
      case "Rejected":
      case "RequiresResubmission":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (verificationData?.verification?.termsAccepted) {
      setTermsAccepted(true);
    }
  }, [verificationData]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  const verification = verificationData?.verification;
  if (!verification) return null;

  const canSubmit =
    verification.idFrontImage &&
    verification.idBackImage &&
    verification.personalImage &&
    verification.termsAccepted &&
    (verification.verificationStatus === "None" ||
      verification.verificationStatus === "RequiresResubmission");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Seller Identity Verification
            </h1>
            <p className="text-gray-600">
              Complete your identity verification to start selling on our
              platform
            </p>
          </div>

          {/* Current Status */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`flex items-center space-x-2 ${getStatusColor(
                    verification.verificationStatus
                  )}`}
                >
                  {getStatusIcon(verification.verificationStatus)}
                  <span className="font-semibold">
                    Status: {verification.verificationStatus}
                  </span>
                </div>
              </div>
              {verification.isVerified && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Verified</span>
                </div>
              )}
            </div>

            {verification.verificationNotes && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">
                  <strong>Admin Notes:</strong> {verification.verificationNotes}
                </p>
              </div>
            )}

            {verification.verificationSubmittedAt && (
              <p className="text-sm text-gray-500 mt-2">
                Submitted:{" "}
                {new Date(
                  verification.verificationSubmittedAt
                ).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Verification Steps */}
          <div className="space-y-6">
            {/* Step 1: Download and Sign Contract */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold">
                  Step 1: Download Contract
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Download, sign, and upload the seller verification contract.
              </p>
              <button
                onClick={downloadContract}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Contract</span>
              </button>
            </div>

            {/* Step 2: Upload Documents */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold">
                  Step 2: Upload ID Documents
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* ID Front */}
                <DocumentUpload
                  title="ID Front"
                  documentType="idFront"
                  currentImage={verification.idFrontImage}
                  selectedFile={selectedFiles.idFront}
                  preview={previews.idFront}
                  onFileSelect={handleFileSelect}
                  onUpload={handleUpload}
                  isUploading={uploadDocumentMutation.isPending}
                />

                {/* ID Back */}
                <DocumentUpload
                  title="ID Back"
                  documentType="idBack"
                  currentImage={verification.idBackImage}
                  selectedFile={selectedFiles.idBack}
                  preview={previews.idBack}
                  onFileSelect={handleFileSelect}
                  onUpload={handleUpload}
                  isUploading={uploadDocumentMutation.isPending}
                />
              </div>
            </div>

            {/* Step 3: Upload Personal Photo */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold">
                  Step 3: Upload Personal Photo
                </h3>
              </div>

              <DocumentUpload
                title="Personal Photo"
                description="Upload a clear photo of yourself"
                documentType="personal"
                currentImage={verification.personalImage}
                selectedFile={selectedFiles.personal}
                preview={previews.personal}
                onFileSelect={handleFileSelect}
                onUpload={handleUpload}
                isUploading={uploadDocumentMutation.isPending}
              />
            </div>

            {/* Step 4: Accept Terms */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold">Step 4: Accept Terms</h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    disabled={verification.termsAccepted}
                    className="mt-1"
                  />
                  <span className="text-gray-700">
                    I confirm that all information provided is accurate and I
                    agree to the terms and conditions
                  </span>
                </label>

                {!verification.termsAccepted && termsAccepted && (
                  <button
                    onClick={() => acceptTermsMutation.mutate()}
                    disabled={acceptTermsMutation.isPending}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {acceptTermsMutation.isPending
                      ? "Accepting..."
                      : "Accept Terms"}
                  </button>
                )}

                {verification.termsAccepted && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Terms accepted on{" "}
                      {new Date(
                        verification.termsAcceptedAt!
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Verification */}
            <div className="text-center pt-6">
              {canSubmit && (
                <button
                  onClick={() => submitVerificationMutation.mutate()}
                  disabled={submitVerificationMutation.isPending}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitVerificationMutation.isPending
                    ? "Submitting..."
                    : "Submit for Verification"}
                </button>
              )}

              {verification.verificationStatus === "Pending" && (
                <div className="text-yellow-600 font-semibold">
                  Verification submitted and pending review
                </div>
              )}

              {verification.verificationStatus === "Approved" && (
                <div className="text-green-600 font-semibold">
                  Verification approved! You can now start selling.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Upload Component
interface DocumentUploadProps {
  title: string;
  description?: string;
  documentType: string;
  currentImage?: string;
  selectedFile?: File;
  preview?: string;
  onFileSelect: (documentType: string, file: File) => void;
  onUpload: (documentType: string) => void;
  isUploading: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  title,
  description,
  documentType,
  currentImage,
  selectedFile,
  preview,
  onFileSelect,
  onUpload,
  isUploading,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
      <div className="text-center">
        <h4 className="font-semibold mb-2">{title}</h4>
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}

        {currentImage && !preview && (
          <div className="mb-4">
            <img
              src={currentImage}
              alt={title}
              className="max-w-full h-32 object-cover mx-auto rounded"
            />
            <div className="flex items-center justify-center space-x-2 text-green-600 mt-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Uploaded</span>
            </div>
          </div>
        )}

        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt={title}
              className="max-w-full h-32 object-cover mx-auto rounded"
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(documentType, file);
          }}
          className="hidden"
        />

        <div className="space-y-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors mx-auto"
          >
            <Upload className="w-4 h-4" />
            <span>{currentImage ? "Replace" : "Select"} File</span>
          </button>

          {selectedFile && (
            <button
              onClick={() => onUpload(documentType)}
              disabled={isUploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Max file size: 5MB. Accepted formats: JPG, PNG
        </p>
      </div>
    </div>
  );
};

export default VerificationPage;
