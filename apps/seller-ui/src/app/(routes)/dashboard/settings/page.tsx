"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";


interface DeleteShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deletionDate: string) => void;
}

interface RestoreShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteShopModal: React.FC<DeleteShopModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [deletionDate, setDeletionDate] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = () => {
    if (confirmText === "DELETE MY SHOP" && deletionDate) {
      const selectedDate = new Date(deletionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        alert("Please select a future date for deletion.");
        return;
      }
      
      onConfirm(deletionDate);
      setConfirmText("");
      setDeletionDate("");
      onClose();
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Schedule Shop Deletion
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Warning: This action cannot be undone
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Scheduling your shop for deletion will permanently remove:
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    <li>All your products and inventory</li>
                    <li>All order history and customer data</li>
                    <li>All shop images and content</li>
                    <li>Your seller account and profile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deletion Date
            </label>
            <input
              type="date"
              value={deletionDate}
              onChange={(e) => setDeletionDate(e.target.value)}
              min={minDateString}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your shop will be permanently deleted on this date
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "DELETE MY SHOP" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE MY SHOP"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!deletionDate || confirmText !== "DELETE MY SHOP"}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule Deletion
          </button>
        </div>
      </div>
    </div>
  );
};

const RestoreShopModal: React.FC<RestoreShopModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = () => {
    if (confirmText === "RESTORE MY SHOP") {
      onConfirm();
      setConfirmText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-green-900 mb-4">
          Restore Your Shop
        </h2>
        
        <div className="mb-4">
          <p className="text-sm text-green-700 mb-4">
            This will cancel your scheduled shop deletion and restore your shop to full functionality.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <h4 className="font-medium text-green-800 mb-2">What happens when you restore:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Your shop will be immediately reactivated</li>
              <li>• All scheduled deletion will be cancelled</li>
              <li>• Your products will remain available to customers</li>
              <li>• You can continue normal shop operations</li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type "RESTORE MY SHOP" to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="RESTORE MY SHOP"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== "RESTORE MY SHOP"}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Restore Shop
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);


  const deleteShopMutation = useMutation({
    mutationFn: async (deletionDate: string) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const apiUrl = `${baseUrl}/seller/api/delete`;
      
      const response = await axios.delete(apiUrl, {
        data: { deletionDate },
        withCredentials: true,
      });
      
      return response.data;
    },
    onSuccess: () => {
      toast.success("Shop deletion scheduled successfully. You can restore it before the deletion date if needed.");
      setIsDeleteModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to schedule shop deletion"
      );
    },
  });

  const restoreShopMutation = useMutation({
    mutationFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const apiUrl = `${baseUrl}/seller/api/restore`;
      
      const response = await axios.put(apiUrl, {}, {
        withCredentials: true,
      });
      
      return response.data;
    },
    onSuccess: () => {
      toast.success("Shop restored successfully! Your shop is now active again.");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to restore shop"
      );
    },
  });

  const handleDeleteShop = (deletionDate: string) => {
    deleteShopMutation.mutate(deletionDate);
  };

  const handleRestoreShop = () => {
    restoreShopMutation.mutate();
    setIsRestoreModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F1EE] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your shop preferences and account settings
            </p>
          </div>

          <div className="p-6">
            {/* General Settings Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                General Settings
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  General shop settings and preferences will be available here in future updates.
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-gray-200 pt-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-medium text-red-900 mb-2">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-700 mb-4">
                  Once you schedule your shop for deletion, there is no going back. 
                  Please be certain before proceeding.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-red-900">
                        Delete Shop
                      </h3>
                      <p className="text-sm text-red-600">
                        Permanently delete your shop and all associated data
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      disabled={deleteShopMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {deleteShopMutation.isPending ? "Scheduling..." : "Delete Shop"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-red-200 pt-4">
                    <div>
                      <h3 className="text-sm font-medium text-green-900">
                        Restore Shop
                      </h3>
                      <p className="text-sm text-green-600">
                        Cancel scheduled deletion and restore your shop
                      </p>
                    </div>
                    <button
                      onClick={() => setIsRestoreModalOpen(true)}
                      disabled={restoreShopMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {restoreShopMutation.isPending ? "Restoring..." : "Restore Shop"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteShopModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteShop}
      />

      <RestoreShopModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={handleRestoreShop}
      />
    </div>
  );
};

export default SettingsPage;
