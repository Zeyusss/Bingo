"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import useSeller from "../../hooks/useSeller";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";

const EditProfilePage = () => {
  const { seller, isLoading } = useSeller();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!seller && !isLoading) {
      router.push("/login");
    }
    
    if (seller?.shop) {
      setName(seller.shop.name || "");
      setBio(seller.shop.bio || "");
      setAddress(seller.shop.address || "");
      setOpeningHours(seller.shop.opening_hours || "");
    }
  }, [seller, isLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      const response = await axiosInstance.put("/seller/api/edit-profile", {
        name,
        bio,
        address,
        opening_hours: openingHours,
      });
      
      if (response.data.success) {
        setSaveSuccess(true);
        // Refresh seller data
        queryClient.invalidateQueries({ queryKey: ["seller"] });
        // Redirect back to profile after a short delay
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setSaveError(response.data.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err.response?.data?.message || "An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Edit Shop Profile</h1>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Shop Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your shop name"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Shop Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell customers about your shop"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Shop Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your shop address"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Opening Hours
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mon - Sat: 9 AM - 6 PM"
                required
              />
            </div>
            
            {saveError && (
              <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">
                {saveError}
              </div>
            )}
            
            {saveSuccess && (
              <div className="text-green-400 text-sm p-3 bg-green-900/20 rounded-lg flex items-center gap-2">
                <CheckCircle size={18} />
                Profile updated successfully!
              </div>
            )}
            
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
                disabled={isSaving}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
