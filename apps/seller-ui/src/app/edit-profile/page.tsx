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
        queryClient.invalidateQueries({ queryKey: ["seller"] });
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
      <div className="min-h-screen bg-[#F4F2EF] flex items-center justify-center" style={{
        backgroundImage: "url('/assets/wd-furniture-background.webp')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto", 
      }}>
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2EF] p-4 md:p-8" style={{
      backgroundImage: "url('/assets/wd-furniture-background.webp')",
      backgroundRepeat: "repeat",
      backgroundSize: "auto", 
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-black font-medium border border-gray-200"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-black font-[Poppins]">Edit Shop Profile</h1>
        </div>
        
        <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium font-[Poppins]">
                Shop Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-[Work Sans]"
                placeholder="Enter your shop name"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium font-[Poppins]">
                Shop Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-[Work Sans] resize-none"
                placeholder="Tell customers about your shop"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium font-[Poppins]">
                Shop Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-[Work Sans]"
                placeholder="Enter your shop address"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium font-[Poppins]">
                Opening Hours
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-[Work Sans]"
                placeholder="e.g., Mon - Sat: 9 AM - 6 PM"
                required
              />
            </div>
            
            {saveError && (
              <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg border border-red-200 font-[Work Sans]">
                {saveError}
              </div>
            )}
            
            {saveSuccess && (
              <div className="text-green-600 text-sm p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2 font-[Work Sans]">
                <CheckCircle size={18} />
                Profile updated successfully!
              </div>
            )}
            
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-100 text-black rounded-full font-medium hover:bg-gray-200 transition-colors border border-gray-200 font-[Poppins]"
                disabled={isSaving}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-[Poppins]"
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
