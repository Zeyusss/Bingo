"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Loader2, Camera, AlertTriangle, CheckCircle } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import Image from "next/image";

interface ProfilePictureUploadProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onUploadSuccess: (imageUrl: string) => void;
}

const ProfilePictureUpload = ({ 
  isOpen, 
  onClose, 
  currentAvatar, 
  onUploadSuccess 
}: ProfilePictureUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [eligibilityData, setEligibilityData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    if (isOpen) {
      checkEligibility();
    }
  }, [isOpen]);

  const checkEligibility = async () => {
    setIsCheckingEligibility(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get("/api/profile-picture-eligibility");
      setEligibilityData(response.data);
      
      if (!response.data.canChange) {
        setError(`You can change your profile picture in ${response.data.daysRemaining} days`);
      }
    } catch (err: any) {
      console.error("Eligibility check error:", err);
      setError("Failed to check eligibility. Please try again.");
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      
      if (!file.type.match("image.*")) {
        setError("Please select an image file (JPEG, PNG, etc.)");
        return;
      }

      
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !eligibilityData?.canChange) return;
    
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });
      
      
      const uploadResponse = await axiosInstance.post("/api/upload-user-image", {
        file: base64,
        fileName: selectedFile.name,
        folder: "user_profiles",
      });
      
      if (uploadResponse.data.success) {
        
        const updateResponse = await axiosInstance.put("/api/update-profile-picture", {
          imageUrl: uploadResponse.data.url,
          fileId: uploadResponse.data.file_id,
        });
        
        if (updateResponse.data.success) {
          setSuccess("Profile picture updated successfully!");
          onUploadSuccess(uploadResponse.data.url);
          
          
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setError("Failed to update profile picture");
        }
      } else {
        setError("Failed to upload image");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      if (err.response?.status === 413) {
        setError("File size too large. Please choose a smaller image.");
      } else {
        setError(err.response?.data?.message || "An error occurred during upload");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (eligibilityData?.canChange) {
      fileInputRef.current?.click();
    }
  };

  const closeModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    setEligibilityData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Change Profile Picture</h2>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {isCheckingEligibility ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
              <span className="text-gray-600">Checking eligibility...</span>
            </div>
          ) : !eligibilityData?.canChange ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cannot Change Profile Picture</h3>
              <p className="text-gray-600 mb-4">
                You can only change your profile picture once every 90 days.
              </p>
              {eligibilityData?.daysRemaining > 0 && (
                <p className="text-sm text-red-600">
                  You can change your profile picture in {eligibilityData.daysRemaining} days.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current</p>
                  <div className="relative">
                    <Image
                      src={currentAvatar || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"}
                      alt="Current Profile"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full border-4 border-gray-200 shadow-sm object-cover"
                    />
                  </div>
                </div>
                {previewUrl && (
                  <div className="text-orange-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}

                {previewUrl && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                    <div className="relative">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full border-4 border-orange-200 shadow-sm object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  selectedFile
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div>
                    <CheckCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">Image Selected</p>
                    <p className="text-sm text-gray-600">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">Choose New Photo</p>
                    <p className="text-sm text-gray-600">Click to select an image</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports JPEG, PNG • Max 5MB
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading || !eligibilityData?.canChange}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Update Photo
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
