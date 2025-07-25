"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Modal } from "../../shared/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/components/ui/table";

interface Seller {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isBlocked?: boolean;
}

interface EditSellerData {
  name: string;
  email: string;
}

const SellersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [editFormData, setEditFormData] = useState<EditSellerData>({
    name: "",
    email: "",
  });

  const queryClient = useQueryClient();

  const {
    data: sellers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sellers"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/get-all-sellers`,
        { withCredentials: true }
      );
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const blockSellerMutation = useMutation({
    mutationFn: async ({
      sellerId,
      isBlocked,
    }: {
      sellerId: string;
      isBlocked: boolean;
    }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/sellers/${sellerId}/block`,
        { isBlocked },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });
  const deleteSellerMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/sellers/${sellerId}`,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });

  const updateSellerMutation = useMutation({
    mutationFn: async ({
      sellerId,
      data,
    }: {
      sellerId: string;
      data: EditSellerData;
    }) => {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/sellers/${sellerId}`,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      setIsEditModalOpen(false);
      setSelectedSeller(null);
    },
  });

  const handleEditSeller = (seller: Seller) => {
    setSelectedSeller(seller);
    setEditFormData({
      name: seller.name,
      email: seller.email,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveSeller = () => {
    if (selectedSeller) {
      updateSellerMutation.mutate({
        sellerId: selectedSeller.id,
        data: editFormData,
      });
    }
  };

  const handleBlockSeller = (sellerId: string, isBlocked: boolean) => {
    blockSellerMutation.mutate({ sellerId, isBlocked: !isBlocked });
  };

  const handleDeleteSeller = (sellerId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this seller? This action cannot be undone."
      )
    ) {
      deleteSellerMutation.mutate(sellerId);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading sellers</h3>
          <p className="text-red-600 text-sm mt-1">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sellers Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all sellers</p>
        </div>
        <div className="text-sm text-gray-500">{sellers.length} sellers</div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search sellers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seller</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Loading sellers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sellers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  No sellers found
                </TableCell>
              </TableRow>
            ) : (
              sellers
                .filter(
                  (seller: Seller) =>
                    seller.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    seller.email
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((seller: Seller) => (
                  <TableRow key={seller.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {seller.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {seller.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          seller.isBlocked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {seller.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSeller(seller)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleBlockSeller(
                              seller.id,
                              seller.isBlocked || false
                            )
                          }
                          className={
                            seller.isBlocked
                              ? "text-green-600 hover:text-green-800"
                              : "text-orange-600 hover:text-orange-800"
                          }
                        >
                          {seller.isBlocked ? "Unblock" : "Block"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSeller(seller.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSeller(null);
        }}
        title="Edit Seller"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Seller name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={editFormData.email}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Seller email"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedSeller(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSeller}
              disabled={updateSellerMutation.isPending}
            >
              {updateSellerMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SellersPage;
