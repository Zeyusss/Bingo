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
  contractSignedImage?: string;
  personalImage?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationNotes?: string;
}

const VerificationPage = () => {
  const { seller, isLoading } = useSeller();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState({
    idFront: null as string | null,
    idBack: null as string | null,
    contract: null as string | null,
    personal: null as string | null,
  });

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

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({
      documentType,
      imageData,
    }: {
      documentType: string;
      imageData: string;
    }) => {
      const res = await axiosInstance.post(
        "/seller/api/verification/upload-document",
        {
          documentType,
          imageData,
        }
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      setUploadedFiles((prev) => ({
        ...prev,
        [variables.documentType]: data.imageUrl,
      }));
      refetchVerification();
    },
  });

  // Submit verification mutation
  const submitVerificationMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/seller/api/verification/submit");
      return res.data;
    },
    onSuccess: () => {
      refetchVerification();
      queryClient.invalidateQueries({ queryKey: ["seller"] });
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
      const link = document.createElement("a");
      link.href = url;
      link.download = "seller_verification_contract.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download contract:", error);
    }
  };

  const handleFileUpload = (file: File, documentType: string) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadDocumentMutation.mutate({ documentType, imageData: base64 });
    };
    reader.readAsDataURL(file);
  };

  const canSubmit = () => {
    return (
      (verification?.idFrontImage || uploadedFiles.idFront) &&
      (verification?.idBackImage || uploadedFiles.idBack) &&
      (verification?.contractSignedImage || uploadedFiles.contract) &&
      (verification?.personalImage || uploadedFiles.personal)
    );
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
      title: "Contract",
      description: "Download, sign, and upload contract",
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
                  {verification?.idFrontImage || uploadedFiles.idFront ? (
                    <div className="space-y-3">
                      <Image
                        src={
                          verification?.idFrontImage || uploadedFiles.idFront!
                        }
                        alt="ID Front"
                        width={200}
                        height={120}
                        className="mx-auto rounded border"
                      />
                      <p className="text-green-400">✓ Uploaded</p>
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
                          if (file) handleFileUpload(file, "idFront");
                        }}
                        className="hidden"
                        id="idFront"
                      />
                      <label
                        htmlFor="idFront"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
                      >
                        Choose File
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
                  {verification?.idBackImage || uploadedFiles.idBack ? (
                    <div className="space-y-3">
                      <Image
                        src={verification?.idBackImage || uploadedFiles.idBack!}
                        alt="ID Back"
                        width={200}
                        height={120}
                        className="mx-auto rounded border"
                      />
                      <p className="text-green-400">✓ Uploaded</p>
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
                          if (file) handleFileUpload(file, "idBack");
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
                Contract Verification
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
                  <h4 className="font-semibold text-blue-100 mb-2">
                    Instructions:
                  </h4>
                  <ol className="list-decimal list-inside text-blue-200 space-y-1">
                    <li>Download the verification contract</li>
                    <li>Print the contract and sign it clearly</li>
                    <li>Take a clear photo of the signed contract</li>
                    <li>Upload the photo below</li>
                  </ol>
                </div>

                <button
                  onClick={downloadContract}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  <Download size={20} />
                  Download Contract
                </button>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    Signed Contract
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    {verification?.contractSignedImage ||
                    uploadedFiles.contract ? (
                      <div className="space-y-3">
                        <Image
                          src={
                            verification?.contractSignedImage ||
                            uploadedFiles.contract!
                          }
                          alt="Signed Contract"
                          width={200}
                          height={120}
                          className="mx-auto rounded border"
                        />
                        <p className="text-green-400">✓ Uploaded</p>
                      </div>
                    ) : (
                      <div>
                        <Upload
                          size={48}
                          className="mx-auto text-gray-400 mb-3"
                        />
                        <p className="text-gray-400 mb-3">
                          Upload signed contract photo
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "contract");
                          }}
                          className="hidden"
                          id="contract"
                        />
                        <label
                          htmlFor="contract"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
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
                  {verification?.personalImage || uploadedFiles.personal ? (
                    <div className="space-y-3">
                      <Image
                        src={
                          verification?.personalImage || uploadedFiles.personal!
                        }
                        alt="Personal Photo"
                        width={200}
                        height={200}
                        className="mx-auto rounded-full border"
                      />
                      <p className="text-green-400">✓ Uploaded</p>
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
                          if (file) handleFileUpload(file, "personal");
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
                    image: verification?.idFrontImage || uploadedFiles.idFront,
                  },
                  {
                    title: "ID Back",
                    image: verification?.idBackImage || uploadedFiles.idBack,
                  },
                  {
                    title: "Signed Contract",
                    image:
                      verification?.contractSignedImage ||
                      uploadedFiles.contract,
                  },
                  {
                    title: "Personal Photo",
                    image:
                      verification?.personalImage || uploadedFiles.personal,
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
                        <p className="text-green-400 text-sm">✓ Ready</p>
                      </div>
                    ) : (
                      <p className="text-red-400 text-sm">✗ Missing</p>
                    )}
                  </div>
                ))}
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
    </div>
  );
};

export default VerificationPage;
