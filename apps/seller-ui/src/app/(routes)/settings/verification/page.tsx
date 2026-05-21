"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  FileText,
  User,
  CreditCard,

} from "lucide-react";
import Image from "next/image";
import axiosInstance from "../../../../utils/axiosInstance";
import useSeller from "../../../../hooks/useSeller";

interface VerificationData {
  id: string;
  isVerified: boolean;
  verificationStatus:
    | "None"
    | "Pending"
    | "Approved"
    | "Rejected"
    | "RequiresResubmission";
  idFrontImage?: string;
  idBackImage?: string;
  personalImage?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationNotes?: string;
}

const VerificationPage = () => {
  const { seller, isLoading } = useSeller();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);

  // Store selected files and their previews
  const [selectedFiles, setSelectedFiles] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    personal: null as File | null,
  });

  const [filePreviews, setFilePreviews] = useState({
    idFront: null as string | null,
    idBack: null as string | null,
    personal: null as string | null,
  });

  const [uploadingFiles, setUploadingFiles] = useState({
    idFront: false,
    idBack: false,
    personal: false,
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    if (!seller && !isLoading) {
      router.push("/login");
    }
  }, [seller, isLoading]);

  // Fetch verification status
  const { data: verification, refetch: refetchVerification } = useQuery({
    queryKey: ["verification-status"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/api/verification/status");
      return res.data.verification as VerificationData;
    },
    enabled: !!seller,
    staleTime: 1000 * 60 * 5,
  });

  // Sync terms accepted state with backend data
  useEffect(() => {
    if (verification?.termsAccepted) {
      setTermsAccepted(true);
    }
  }, [verification?.termsAccepted]);

  // Upload file immediately when selected
  const uploadFileMutation = useMutation({
    mutationFn: async ({
      file,
      documentType,
    }: {
      file: File;
      documentType: string;
    }) => {
      // Set uploading state
      setUploadingFiles((prev) => ({ ...prev, [documentType]: true }));

      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const response = await axiosInstance.post(
              "/seller/api/verification/upload-document",
              {
                documentType: documentType,
                imageData: reader.result as string,
              }
            );
            resolve(response.data);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    onSuccess: (data, variables) => {
      // Clear uploading state
      setUploadingFiles((prev) => ({
        ...prev,
        [variables.documentType]: false,
      }));
      // Refetch verification status to get updated file URLs
      refetchVerification();
    },
    onError: (error, variables) => {
      // Clear uploading state
      setUploadingFiles((prev) => ({
        ...prev,
        [variables.documentType]: false,
      }));
      console.error("File upload failed:", error);
      // You can add toast notification here
    },
  });

  // Handle file selection, preview generation, and immediate upload
  const handleFileSelect = (
    file: File,
    documentType: keyof typeof selectedFiles
  ) => {
    // Update selected files
    setSelectedFiles((prev) => ({
      ...prev,
      [documentType]: file,
    }));

    // Generate preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreviews((prev) => ({
        ...prev,
        [documentType]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);

    // Upload immediately
    uploadFileMutation.mutate({ file, documentType });
  };

  // Remove/replace file
  const removeFile = (documentType: keyof typeof selectedFiles) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [documentType]: null,
    }));
    setFilePreviews((prev) => ({
      ...prev,
      [documentType]: null,
    }));
  };

  // Accept terms mutation
  const acceptTermsMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(
        "/seller/api/verification/accept-terms",
        {
          confirmed: true,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      setTermsAccepted(true);
      refetchVerification();
    },
    onError: (error) => {
      console.error("Failed to accept terms:", error);
      setTermsAccepted(false);
      // Show error modal or toast here if needed
    },
  });

  // Submit verification mutation - simplified since files are uploaded immediately
  const submitVerificationMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/seller/api/verification/submit");
      return res.data;
    },
    onSuccess: () => {
      refetchVerification();
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      // Clear selected files after successful submission
      setSelectedFiles({
        idFront: null,
        idBack: null,
        personal: null,
      });
      setFilePreviews({
        idFront: null,
        idBack: null,
        personal: null,
      });
    },
    onError: (error) => {
      console.error("Verification submission failed:", error);
      // You can add toast notification here
    },
  });

  const canSubmit = () => {
    // Check if all required documents are uploaded to the backend (not just selected locally)
    return (
      verification?.idFrontImage &&
      verification?.idBackImage &&
      verification?.personalImage &&
      termsAccepted
    );
  };

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
    } catch (error) {
      console.error("Failed to download contract:", error);
      // Fallback to the existing terms content
      const termsContent = `
SELLER VERIFICATION TERMS AND CONDITIONS

By accepting these terms, you agree to:

1. Provide accurate and truthful information during the verification process
2. Upload clear, readable images of required identification documents
3. Comply with all platform policies and guidelines
4. Maintain professional conduct as a seller on our platform
5. Accept responsibility for all products and services you offer

For full terms and conditions, please visit our website or contact support.

Date: ${new Date().toLocaleDateString()}
    `;

      const blob = new Blob([termsContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "seller-verification-terms.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleTermsAcceptance = () => {
    // Show first confirmation modal instead of alert
    setShowTermsModal(true);
  };

  const handleFirstConfirmation = () => {
    setShowTermsModal(false);
    setShowConfirmationModal(true);
  };

  const handleFinalConfirmation = () => {
    setShowConfirmationModal(false);
    // Call backend to accept terms
    acceptTermsMutation.mutate();
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (verification?.verificationStatus) {
      case "Approved":
        return <CheckCircle className="text-green-500" size={24} />;
      case "Rejected":
        return <AlertCircle className="text-red-500" size={24} />;
      case "Pending":
        return <Clock className="text-yellow-500" size={24} />;
      case "RequiresResubmission":
        return <AlertCircle className="text-orange-500" size={24} />;
      case "None":
      default:
        return <Shield className="text-blue-500" size={24} />;
    }
  };

  const getStatusMessage = () => {
    switch (verification?.verificationStatus) {
      case "Approved":
        return "Your identity has been verified successfully!";
      case "Rejected":
        return `Verification rejected. ${
          verification.verificationNotes || "Please review and resubmit."
        }`;
      case "Pending":
        return "Your verification is under review. We'll notify you once it's processed.";
      case "RequiresResubmission":
        return `Verification requires resubmission. ${
          verification.verificationNotes ||
          "Please update your documents and resubmit."
        }`;
      case "None":
      default:
        return "Complete your identity verification to start selling.";
    }
  };

  const steps = [
    {
      number: 1,
      title: "ID Documents",
      description: "Upload front and back of your ID",
      icon: CreditCard,
    },
    {
      number: 2,
      title: "Terms & Conditions",
      description: "Download and accept verification terms",
      icon: FileText,
    },
    {
      number: 3,
      title: "Personal Photo",
      description: "Upload a clear photo of yourself",
      icon: User,
    },
    {
      number: 4,
      title: "Review & Submit",
      description: "Review all documents and submit",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="w-full px-6 pt-6">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Settings</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Status Banner */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-semibold text-white">
                Verification Status
              </h2>
              <p className="text-gray-300 mt-1">{getStatusMessage()}</p>
              {verification?.verificationSubmittedAt && (
                <p className="text-gray-400 text-sm mt-2">
                  Submitted:{" "}
                  {new Date(
                    verification.verificationSubmittedAt
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= step.number
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-600 text-gray-400"
                  }`}
                >
                  <step.icon size={20} />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-20 h-0.5 mx-2 ${
                      currentStep > step.number ? "bg-blue-600" : "bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">
              {steps[currentStep - 1]?.title}
            </h3>
            <p className="text-gray-400">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800 rounded-lg p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Upload ID Documents
              </h3>

              {/* ID Front */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  ID Front Side
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {verification?.idFrontImage || filePreviews.idFront ? (
                    <div className="space-y-3">
                      <Image
                        src={
                          filePreviews.idFront || verification?.idFrontImage!
                        }
                        alt="ID Front"
                        width={200}
                        height={120}
                        className="mx-auto rounded border"
                      />
                      <div className="flex gap-2 justify-center">
                        {filePreviews.idFront ? (
                          <>
                            <p className="text-yellow-400">
                              📋 Ready to upload
                            </p>
                            <button
                              onClick={() => removeFile("idFront")}
                              className="text-red-400 hover:text-red-300 text-sm underline"
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <p className="text-green-400">✓ Uploaded</p>
                        )}
                      </div>
                      {/* Replace/Change option */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file, "idFront");
                          }}
                          className="hidden"
                          id="idFrontReplace"
                        />
                        <label
                          htmlFor="idFrontReplace"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded cursor-pointer text-sm"
                        >
                          Change Image
                        </label>
                      </div>
                    </div>
                  ) : uploadingFiles.idFront ? (
                    <div>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                      <p className="text-blue-400 mb-3">
                        Uploading ID front side...
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload
                        size={48}
                        className="mx-auto text-gray-400 mb-3"
                      />
                      <p className="text-gray-400 mb-3">
                        Click to upload front side of ID
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file, "idFront");
                        }}
                        className="hidden"
                        id="idFront"
                        disabled={uploadingFiles.idFront}
                      />
                      <label
                        htmlFor="idFront"
                        className={`px-4 py-2 rounded cursor-pointer ${
                          uploadingFiles.idFront
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {uploadingFiles.idFront
                          ? "Uploading..."
                          : "Choose File"}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* ID Back */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  ID Back Side
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {verification?.idBackImage || filePreviews.idBack ? (
                    <div className="space-y-3">
                      <Image
                        src={verification?.idBackImage || filePreviews.idBack!}
                        alt="ID Back"
                        width={200}
                        height={120}
                        className="mx-auto rounded border"
                      />
                      <div className="flex gap-2 justify-center">
                        {filePreviews.idBack ? (
                          <>
                            <p className="text-yellow-400">
                              📋 Ready to upload
                            </p>
                            <button
                              onClick={() => removeFile("idBack")}
                              className="text-red-400 hover:text-red-300 text-sm underline"
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <p className="text-green-400">✓ Uploaded</p>
                        )}
                      </div>
                      {/* Replace/Change option */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file, "idBack");
                          }}
                          className="hidden"
                          id="idBackReplace"
                        />
                        <label
                          htmlFor="idBackReplace"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded cursor-pointer text-sm"
                        >
                          Change Image
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload
                        size={48}
                        className="mx-auto text-gray-400 mb-3"
                      />
                      <p className="text-gray-400 mb-3">
                        Click to upload back side of ID
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file, "idBack");
                        }}
                        className="hidden"
                        id="idBack"
                      />
                      <label
                        htmlFor="idBack"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Terms & Conditions Acceptance
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
                  <h4 className="font-semibold text-blue-100 mb-2">
                    Terms and Conditions:
                  </h4>
                  <p className="text-blue-200 mb-3">
                    Please download and read our verification terms and
                    conditions, then confirm your acceptance below.
                  </p>
                </div>

                <button
                  onClick={downloadContract}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  <Download size={20} />
                  Download Terms & Conditions
                </button>

                <div className="p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      checked={termsAccepted}
                      disabled={verification?.termsAccepted} // Disable if already accepted on backend
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleTermsAcceptance();
                        } else {
                          // Don't allow unchecking if it was accepted from backend
                          if (!verification?.termsAccepted) {
                            setTermsAccepted(false);
                          }
                        }
                      }}
                      className="mt-1 w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label
                      htmlFor="termsAccepted"
                      className="text-gray-300 leading-relaxed"
                    >
                      I have read, understood, and agree to the verification
                      terms and conditions. I confirm that all information
                      provided is accurate and that I understand the
                      verification requirements for becoming a seller on this
                      platform.
                    </label>
                  </div>

                  {termsAccepted && (
                    <div className="mt-3 p-3 bg-green-900/30 border border-green-600 rounded-lg">
                      <p className="text-green-400 text-sm flex items-center gap-2">
                        <span>✓</span>
                        Terms accepted and confirmed
                        {verification?.termsAcceptedAt && (
                          <span className="text-green-300 ml-2">
                            on{" "}
                            {new Date(
                              verification.termsAcceptedAt
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Personal Photo
              </h3>

              <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                <h4 className="font-semibold text-yellow-100 mb-2">
                  Photo Requirements:
                </h4>
                <ul className="list-disc list-inside text-yellow-200 space-y-1">
                  <li>Clear, well-lit photo of yourself</li>
                  <li>Face should be clearly visible</li>
                  <li>No sunglasses or face coverings</li>
                  <li>High quality image (not blurry)</li>
                </ul>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Personal Photo
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {verification?.personalImage || filePreviews.personal ? (
                    <div className="space-y-3">
                      <Image
                        src={
                          verification?.personalImage || filePreviews.personal!
                        }
                        alt="Personal Photo"
                        width={200}
                        height={200}
                        className="mx-auto rounded-full border"
                      />
                      <div className="flex gap-2 justify-center">
                        {filePreviews.personal ? (
                          <>
                            <p className="text-yellow-400">
                              📋 Ready to upload
                            </p>
                            <button
                              onClick={() => removeFile("personal")}
                              className="text-red-400 hover:text-red-300 text-sm underline"
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <p className="text-green-400">✓ Uploaded</p>
                        )}
                      </div>
                      {/* Replace/Change option */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file, "personal");
                          }}
                          className="hidden"
                          id="personalReplace"
                        />
                        <label
                          htmlFor="personalReplace"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded cursor-pointer text-sm"
                        >
                          Change Image
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload
                        size={48}
                        className="mx-auto text-gray-400 mb-3"
                      />
                      <p className="text-gray-400 mb-3">
                        Upload your personal photo
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file, "personal");
                        }}
                        className="hidden"
                        id="personal"
                      />
                      <label
                        htmlFor="personal"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Review & Submit
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "ID Front",
                    image: verification?.idFrontImage || filePreviews.idFront,
                    hasNewFile: !!selectedFiles.idFront,
                  },
                  {
                    title: "ID Back",
                    image: verification?.idBackImage || filePreviews.idBack,
                    hasNewFile: !!selectedFiles.idBack,
                  },
                  {
                    title: "Personal Photo",
                    image: verification?.personalImage || filePreviews.personal,
                    hasNewFile: !!selectedFiles.personal,
                  },
                ].map((doc, index) => (
                  <div
                    key={index}
                    className="border border-gray-600 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-white mb-2">{doc.title}</h4>
                    {doc.image ? (
                      <div className="space-y-2">
                        <Image
                          src={doc.image}
                          alt={doc.title}
                          width={150}
                          height={100}
                          className="rounded border"
                        />
                        <div className="flex items-center gap-2">
                          {doc.hasNewFile ? (
                            <p className="text-yellow-400 text-sm">
                              📋 Ready to upload
                            </p>
                          ) : (
                            <p className="text-green-400 text-sm">
                              ✓ Already uploaded
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-red-400 text-sm">✗ Missing</p>
                    )}
                  </div>
                ))}

                {/* Terms Acceptance Status */}
                <div className="border border-gray-600 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">
                    Terms & Conditions
                  </h4>
                  {termsAccepted ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-600 rounded-lg">
                        <span className="text-green-400">✓</span>
                        <span className="text-green-400 text-sm">
                          Terms accepted and confirmed
                        </span>
                      </div>
                      <p className="text-green-400 text-sm">✓ Accepted</p>
                    </div>
                  ) : (
                    <p className="text-red-400 text-sm">✗ Not accepted</p>
                  )}
                </div>
              </div>

              {canSubmit() &&
                verification?.verificationStatus !== "Pending" &&
                verification?.verificationStatus !== "Approved" && (
                  <button
                    onClick={() => submitVerificationMutation.mutate()}
                    disabled={submitVerificationMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition"
                  >
                    {submitVerificationMutation.isPending
                      ? "Submitting..."
                      : verification?.verificationStatus === "None"
                      ? "Submit for Review"
                      : verification?.verificationStatus ===
                        "RequiresResubmission"
                      ? "Resubmit for Review"
                      : "Submit for Review"}
                  </button>
                )}

              {/* Show helpful message if can't submit */}
              {!canSubmit() &&
                verification?.verificationStatus !== "Pending" &&
                verification?.verificationStatus !== "Approved" && (
                  <div className="p-4 bg-orange-900/50 border border-orange-700 rounded-lg text-center">
                    <AlertCircle
                      className="mx-auto text-orange-400 mb-2"
                      size={24}
                    />
                    <p className="text-orange-100 font-medium mb-2">
                      Complete Required Steps
                    </p>
                    <p className="text-orange-200 text-sm">
                      {!verification?.idFrontImage && "• Upload ID front side"}
                      <br />
                      {!verification?.idBackImage && "• Upload ID back side"}
                      <br />
                      {!verification?.personalImage &&
                        "• Upload personal photo"}
                      <br />
                      {!termsAccepted && "• Accept terms and conditions"}
                    </p>
                  </div>
                )}

              {verification?.verificationStatus === "Pending" && (
                <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg text-center">
                  <Clock className="mx-auto text-yellow-400 mb-2" size={32} />
                  <p className="text-yellow-100 font-medium">
                    Verification Submitted
                  </p>
                  <p className="text-yellow-200 text-sm">
                    We're reviewing your documents. You'll be notified once the
                    review is complete.
                  </p>
                </div>
              )}

              {verification?.verificationStatus === "Approved" && (
                <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg text-center">
                  <CheckCircle
                    className="mx-auto text-green-400 mb-2"
                    size={32}
                  />
                  <p className="text-green-100 font-medium">
                    Verification Approved
                  </p>
                  <p className="text-green-200 text-sm">
                    Your identity has been verified. You can now access all
                    selling features.
                  </p>
                </div>
              )}

              {verification?.verificationStatus === "Rejected" && (
                <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-center">
                  <AlertCircle
                    className="mx-auto text-red-400 mb-2"
                    size={32}
                  />
                  <p className="text-red-100 font-medium">
                    Verification Rejected
                  </p>
                  <p className="text-red-200 text-sm">
                    {verification.verificationNotes ||
                      "Please review your documents and contact support."}
                  </p>
                </div>
              )}

              {verification?.verificationStatus === "RequiresResubmission" && (
                <div className="p-4 bg-orange-900/50 border border-orange-700 rounded-lg text-center">
                  <AlertCircle
                    className="mx-auto text-orange-400 mb-2"
                    size={32}
                  />
                  <p className="text-orange-100 font-medium">
                    Resubmission Required
                  </p>
                  <p className="text-orange-200 text-sm">
                    {verification.verificationNotes ||
                      "Please update your documents and resubmit."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition"
          >
            Previous
          </button>

          <button
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={currentStep === 4}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Terms Confirmation Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Confirm Terms Acceptance
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Are you sure you want to accept the verification terms and
              conditions?
              <br />
              <br />
              Please confirm that you have read and understood all terms before
              proceeding. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFirstConfirmation}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-green-600 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-red-green mb-4">
              Final Confirmation Required
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              <strong className="text-green-400">Final confirmation:</strong> Do
              you fully accept all terms and conditions for seller verification?
              <br />
              <br />
              By clicking "Accept Terms", you agree to be bound by these terms
              and this action is irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalConfirmation}
                disabled={acceptTermsMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
              >
                {acceptTermsMutation.isPending
                  ? "Processing..."
                  : "Accept Terms"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
