"use client";
import React, { useState, useRef } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  editType: "cover" | "avatar" | null;
  onUploadSuccess: (imageUrl: string, type: "cover" | "avatar") => void;
}

const ImageUploadModal = ({ isOpen, onClose, editType, onUploadSuccess }: ImageUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !editType) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match("image.*")) {
        setError("Please select an image file (JPEG, PNG, etc.)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }

      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !editType) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });
      
      // Upload to ImageKit
      const uploadResponse = await axiosInstance.post("/seller/api/upload-image", {
        file: base64,
        fileName: selectedFile.name,
        folder: "shop_profiles",
      });
      
      if (uploadResponse.data.success) {
        // Update profile picture
        const updateResponse = await axiosInstance.put("/seller/api/update-image", {
          editType,
          imageUrl: uploadResponse.data.url,
          fileId: uploadResponse.data.file_id,
        });
        
        if (updateResponse.data.success) {
          onUploadSuccess(uploadResponse.data.url, editType);
          onClose();
        } else {
          setError("Failed to update profile picture");
        }
      } else {
        setError("Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const closeModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 relative">
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-2">
          Upload {editType === "cover" ? "Cover Photo" : "Avatar"}
        </h2>
        
        <p className="text-gray-400 mb-6">
          Choose an image to update your {editType === "cover" ? "cover photo" : "avatar"}
        </p>
        
        <div 
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition mb-6"
          onClick={triggerFileInput}
        >
          {previewUrl ? (
            <div className="relative w-full h-48">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <Upload size={32} className="text-gray-400" />
              <p className="text-gray-400">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">Max file size: 5MB</p>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        
        {error && (
          <div className="text-red-400 text-sm mb-4 text-center">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={closeModal}
            className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
            disabled={isUploading}
          >
            Cancel
          </button>
          
          <button
            onClick={handleUpload}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
