"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Modal } from "../../shared/components/ui/modal";
import { Modal as ConfirmModal } from "../../shared/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/components/ui/table";
import { toast } from "react-hot-toast";
import { useQuery as useReactQuery } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller" | "user";
  createdAt: string;
  isBlocked?: boolean;
}

interface EditUserData {
  name: string;
  email: string;
  role: "admin" | "seller" | "user";
}

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [roleFilter, setRoleFilter] = useState<
    "all" | "admin" | "seller" | "user"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({
    name: "",
    email: "",
    role: "user",
    phone_number: "",
    country: "",
  });
  const [showDeleted, setShowDeleted] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | {
    type: "block" | "delete";
    entity: any;
  }>(null);
  const [viewEntity, setViewEntity] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const [viewEntityType, setViewEntityType] = useState<
    "user" | "seller" | null
  >(null);
  const [viewEntityId, setViewEntityId] = useState<string | null>(null);
  const [productPage, setProductPage] = useState(1);
  const productPageSize = 5;

  const { data: viewDetails, isLoading: isViewLoading } = useReactQuery({
    queryKey: ["view-details", viewEntityType, viewEntityId],
    queryFn: async () => {
      if (!viewEntityType || !viewEntityId) return null;
      if (viewEntityType === "user") {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/users/${viewEntityId}/details`,
          { withCredentials: true }
        );
        return { type: "user", data: res.data.user };
      } else if (viewEntityType === "seller") {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/sellers/${viewEntityId}/details`,
          { withCredentials: true }
        );
        return {
          type: "seller",
          data: res.data.seller,
          totalShopSales: res.data.totalShopSales,
          uniqueBuyersCount: res.data.uniqueBuyersCount,
          totalProductValue: res.data.totalProductValue,
          totalPurchasesAnalytics: res.data.totalPurchasesAnalytics,
        };
      }
      return null;
    },
    enabled: !!viewEntityType && !!viewEntityId,
  });

  const { data, isLoading, error } = useQuery<{
    users: any[];
    sellers: any[];
    meta: any;
  }>({
    queryKey: [roleFilter, page, limit, showDeleted],
    queryFn: async () => {
      if (roleFilter === "seller") {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/get-all-sellers?page=${page}&limit=${limit}&showDeleted=${showDeleted}`,
          { withCredentials: true }
        );
        return { sellers: res.data.data, users: [], meta: res.data.meta };
      } else if (roleFilter === "all") {
        const [usersRes, sellersRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/get-all-users?page=${page}&limit=${limit}&showDeleted=${showDeleted}`,
            { withCredentials: true }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/get-all-sellers?page=${page}&limit=${limit}&showDeleted=${showDeleted}`,
            { withCredentials: true }
          ),
        ]);
        return {
          users: usersRes.data.data,
          sellers: sellersRes.data.data,
          meta: {
            totalUsers: usersRes.data.meta.totalUsers,
            totalSellers: sellersRes.data.meta.totalSellers,
          },
        };
      } else {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/get-all-users?page=${page}&limit=${limit}&showDeleted=${showDeleted}`,
          { withCredentials: true }
        );
        return { users: res.data.data, sellers: [], meta: res.data.meta };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const entities =
    roleFilter === "all"
      ? [
          ...(data?.users?.filter((u) => !!u.isDeleted === showDeleted) || []),
          ...(data?.sellers?.filter((s) => !!s.isDeleted === showDeleted) ||
            []),
        ]
      : roleFilter === "seller"
      ? (data?.sellers || []).filter((s) => !!s.isDeleted === showDeleted)
      : (data?.users || []).filter((u) => !!u.isDeleted === showDeleted);

  const meta = data?.meta || {};

  const filteredEntities = useMemo(() => {
    return entities.filter((entity: any) => {
      const matchesSearch =
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "seller" &&
          (!entity.role || entity.role === "seller")) ||
        (roleFilter === "user" && entity.role === "user") ||
        (roleFilter === "admin" && entity.role === "admin");
      const matchesDeleted = !!entity.isDeleted === showDeleted;
      const matchesBlocked = showBlocked ? entity.isBlocked : true;
      return matchesSearch && matchesRole && matchesDeleted && matchesBlocked;
    });
  }, [entities, searchTerm, roleFilter, showDeleted, showBlocked]);

  const blockMutation = useMutation({
    mutationFn: async ({
      id,
      isBlocked,
      entity,
    }: {
      id: string;
      isBlocked: boolean;
      entity: any;
    }) => {
      if (entity.role === "seller" || !entity.role) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/sellers/${id}/block`,
          { isBlocked },
          { withCredentials: true }
        );
        return response.data;
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/users/${id}/block`,
          { isBlocked },
          { withCredentials: true }
        );
        return response.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [roleFilter === "seller" ? "sellers" : "users"],
      });
      toast.success(data?.message || "Status updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (entity: any) => {
      if (entity.role === "seller" || !entity.role) {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/sellers/${entity.id}`,
          { withCredentials: true }
        );
        return response.data;
      } else {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/users/${entity.id}`,
          { withCredentials: true }
        );
        return response.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [roleFilter === "seller" ? "sellers" : "users"],
      });
      toast.success(data?.message || "Deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      prevRole,
      entity,
    }: {
      id: string;
      data: any;
      prevRole?: string;
      entity?: any;
    }) => {
      const isSeller =
        entity &&
        (entity.role === "seller" || !entity.role || entity.phone_number);
      const isUser = entity && entity.role === "user";
      if (isSeller) {
        if (data.role === "user" && prevRole !== "user") {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/sellers/${id}/demote-to-user`,
            {},
            { withCredentials: true }
          );
          return response.data;
        } else if (data.role === "admin" && prevRole !== "admin") {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/sellers/${id}/promote-to-admin`,
            {},
            { withCredentials: true }
          );
          return response.data;
        } else {
          const response = await axios.put(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/sellers/${id}`,
            data,
            { withCredentials: true }
          );
          return response.data;
        }
      } else if (isUser || entity?.role === "admin") {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/users/${id}`,
          data,
          { withCredentials: true }
        );
        return response.data;
      } else {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/users/${id}`,
          data,
          { withCredentials: true }
        );
        return response.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [roleFilter === "seller" ? "sellers" : "users"],
      });
      setIsEditModalOpen(false);
      setSelectedEntity(null);
      if (data?.message) toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "An error occurred");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (entity: any) => {
      if (entity.role === "seller" || !entity.role) {
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/sellers/${entity.id}/restore`,
          {},
          { withCredentials: true }
        );
        return response.data;
      } else {
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/users/${entity.id}/restore`,
          {},
          { withCredentials: true }
        );
        return response.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [roleFilter === "seller" ? "sellers" : "users"],
      });
      toast.success(data?.message || "Restored");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to restore");
    },
  });

  const handleEditEntity = (entity: any) => {
    setSelectedEntity(entity);
    setEditFormData({
      name: entity.name,
      email: entity.email,
      role: "", 
      phone_number: entity.phone_number || "",
      country: entity.country || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEntity = () => {
    if (selectedEntity) {
      if (
        selectedEntity.role !== "seller" &&
        editFormData.role === "seller" &&
        (!editFormData.phone_number || !editFormData.country)
      ) {
        alert("Phone number and country are required to promote to seller.");
        return;
      }

      if (
        (selectedEntity.role !== "seller" && editFormData.role === "seller") ||
        (selectedEntity.role === "seller" && editFormData.role === "user")
      ) {
        const action =
          selectedEntity.role === "seller"
            ? "demote this seller to user"
            : "promote this user to seller";
        if (
          !window.confirm(
            `Are you sure you want to ${action}? This action cannot be undone.`
          )
        ) {
          return;
        }
      }
      updateMutation.mutate({
        id: selectedEntity.id,
        data: editFormData,
        prevRole: selectedEntity.role,
        entity: selectedEntity,
      });
    }
  };

  const handleBlockEntity = (id: string, isBlocked: boolean, entity: any) => {
    setConfirmAction({
      type: "block",
      entity: { ...entity, _wasBlocked: isBlocked, isBlocked: !isBlocked },
    });
  };

  const handleDeleteEntity = (entity: any) => {
    setConfirmAction({ type: "delete", entity });
  };

  const getRoleBadgeColor = (role?: string) => {
    if (!role) return "bg-blue-100 text-blue-800";
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "seller":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading users</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all users, sellers, and admins
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredEntities.length} of {meta.totalUsers || entities.length}{" "}
          users
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={() => setShowDeleted((v) => !v)}
            id="show-deleted-toggle"
          />
          <label htmlFor="show-deleted-toggle" className="text-sm">
            Show Deleted
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showBlocked}
            onChange={() => setShowBlocked((v) => !v)}
            id="show-blocked-toggle"
          />
          <label htmlFor="show-blocked-toggle" className="text-sm">
            Show Blocked
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredEntities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredEntities.map((entity: any) => {
                return (
                  <TableRow key={entity.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {entity.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entity.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          entity.role
                        )}`}
                      >
                        {entity.role
                          ? entity.role.charAt(0).toUpperCase() +
                            entity.role.slice(1)
                          : "Seller"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entity.isDeleted
                            ? "bg-gray-400 text-white"
                            : entity.isBlocked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {entity.isDeleted
                          ? "Deleted"
                          : entity.isBlocked
                          ? "Blocked"
                          : "Active"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(entity.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEntity(entity)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewEntityType(
                              entity.role === "seller" || !entity.role
                                ? "seller"
                                : "user"
                            );
                            setViewEntityId(entity.id);
                            setProductPage(1);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleBlockEntity(
                              entity.id,
                              entity.isBlocked || false,
                              entity
                            )
                          }
                          className={
                            entity.isBlocked
                              ? "text-green-600 hover:text-green-800"
                              : "text-orange-600 hover:text-orange-800"
                          }
                        >
                          {entity.isBlocked ? "Unblock" : "Block"}
                        </Button>
                        {/* Hide delete button if already deleted */}
                        {!entity.isDeleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntity(entity)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                        {showDeleted && entity.isDeleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => restoreMutation.mutate(entity)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Restore
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {meta.currentPage || page} of {meta.totalPages || 1}
        </span>
        <button
          onClick={() =>
            setPage((p) =>
              meta.totalPages ? Math.min(meta.totalPages, p + 1) : p + 1
            )
          }
          disabled={meta.totalPages ? page >= meta.totalPages : false}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEntity(null);
        }}
        title="Edit User"
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
                setEditFormData((prev: any) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="User name"
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
                setEditFormData((prev: any) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder="User email"
            />
          </div>
          {/* In the edit modal, update the role dropdown: */}
          <select
            value={editFormData.role || ""}
            onChange={(e) =>
              setEditFormData((prev: any) => ({
                ...prev,
                role: e.target.value as any,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select the role
            </option>
            {/* User: can only promote to admin */}
            {selectedEntity?.role === "user" && (
              <option value="admin">Admin</option>
            )}
            {/* Admin: can only demote to user */}
            {selectedEntity?.role === "admin" && (
              <option value="user">User</option>
            )}
            {/* Seller: can be demoted to user or promoted to admin */}
            {(selectedEntity?.role === "seller" || !selectedEntity?.role) && (
              <>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </>
            )}
          </select>
          {/* Remove all UI/logic for promoting user to seller (no phone/country fields, no promote-to-seller mutation) */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedEntity(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEntity}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.type === "delete"
            ? "Confirm Delete"
            : confirmAction?.entity?._wasBlocked
            ? "Confirm Unblock"
            : "Confirm Block"
        }
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {confirmAction?.type === "delete"
              ? `Are you sure you want to delete this ${
                  confirmAction?.entity?.role === "seller" ||
                  !confirmAction?.entity?.role
                    ? "seller"
                    : "user"
                }? This action cannot be undone.`
              : confirmAction?.entity?._wasBlocked
              ? "Are you sure you want to unblock this user/seller?"
              : "Are you sure you want to block this user/seller?"}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={
                confirmAction?.type === "delete" ? "destructive" : "default"
              }
              onClick={() => {
                if (confirmAction?.type === "delete") {
                  deleteMutation.mutate(confirmAction.entity);
                } else if (confirmAction?.type === "block") {
                  blockMutation.mutate({
                    id: confirmAction.entity.id,
                    isBlocked: confirmAction.entity.isBlocked,
                    entity: confirmAction.entity,
                  });
                }
                setConfirmAction(null);
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </ConfirmModal>
      <Modal
        isOpen={!!viewEntityType && !!viewEntityId}
        onClose={() => {
          setViewEntityType(null);
          setViewEntityId(null);
        }}
        title={
          viewDetails?.type === "seller"
            ? "Seller Details"
            : viewDetails?.type === "user"
            ? "User Details"
            : "Details"
        }
        size="xl"
      >
        {isViewLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : viewDetails?.type === "seller" && viewDetails.data ? (
          ((() => {
            const totalShopSales =
              viewDetails &&
              "totalShopSales" in viewDetails &&
              typeof viewDetails.totalShopSales === "number"
                ? viewDetails.totalShopSales
                : 0;
            const uniqueBuyersCount =
              viewDetails && "uniqueBuyersCount" in viewDetails
                ? viewDetails.uniqueBuyersCount
                : 0;
            const totalProductValue =
              viewDetails &&
              "totalProductValue" in viewDetails &&
              typeof viewDetails.totalProductValue === "number"
                ? viewDetails.totalProductValue
                : 0;
            const totalPurchasesAnalytics =
              viewDetails &&
              "totalPurchasesAnalytics" in viewDetails &&
              typeof viewDetails.totalPurchasesAnalytics === "number"
                ? viewDetails.totalPurchasesAnalytics
                : 0;
            if (!viewDetails || !viewDetails.data) return <></>;
            return (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="mb-2">
                  <h3 className="font-bold text-lg mb-1">Seller Info</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <b>Name:</b> {viewDetails.data.name}
                    </div>
                    <div>
                      <b>Email:</b> {viewDetails.data.email}
                    </div>
                    <div>
                      <b>Phone:</b> {viewDetails.data.phone_number}
                    </div>
                    <div>
                      <b>Country:</b> {viewDetails.data.country}
                    </div>
                    <div>
                      <b>Created At:</b>{" "}
                      {new Date(viewDetails.data.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <b>Blocked:</b>{" "}
                      {viewDetails.data.isBlocked ? "Yes" : "No"}
                    </div>
                    <div>
                      <b>Deleted:</b>{" "}
                      {viewDetails.data.isDeleted ? "Yes" : "No"}
                    </div>
                    {viewDetails.data.blockedAt && (
                      <div>
                        <b>Blocked At:</b>{" "}
                        {new Date(viewDetails.data.blockedAt).toLocaleString()}
                      </div>
                    )}
                    {viewDetails.data.deletedAt && (
                      <div>
                        <b>Deleted At:</b>{" "}
                        {new Date(viewDetails.data.deletedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                {viewDetails.data.shop && (
                  <div className="mb-2">
                    <h3 className="font-bold text-lg mb-1">Shop Info</h3>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <b>Name:</b> {viewDetails.data.shop.name}
                      </div>
                      <div>
                        <b>Address:</b> {viewDetails.data.shop.address}
                      </div>
                      <div>
                        <b>Category:</b>{" "}
                        {viewDetails.data.shop.category?.join(", ")}
                      </div>
                      <div>
                        <b>Ratings:</b> {viewDetails.data.shop.ratings ?? "-"}
                      </div>
                      <div>
                        <b>Followers:</b>{" "}
                        {viewDetails.data.shop.followers?.length ?? 0}
                      </div>
                      <div>
                        <b>Created At:</b>{" "}
                        {new Date(
                          viewDetails.data.shop.createdAt
                        ).toLocaleString()}
                      </div>
                      <div>
                        <b>Total Shop Sales:</b> ${totalShopSales.toFixed(2)}
                      </div>
                      <div>
                        <b>Unique Buyers:</b> {Number(uniqueBuyersCount)}
                      </div>
                      <div>
                        <b>Total Shop Product Value:</b> $
                        {totalProductValue.toFixed(2)}
                      </div>
                    </div>
                    <div className="mb-2">
                      <b>Bio:</b> {viewDetails.data.shop.bio || "-"}
                    </div>
                    <div className="mb-2">
                      <b>Products:</b> {viewDetails.data.shop.products.length}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Products List</h4>
                      {viewDetails.data.shop.products.length === 0 ? (
                        <div className="text-gray-500">No products</div>
                      ) : (
                        <>
                          <table className="w-full text-sm border">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2">Title</th>
                                <th className="p-2">Category</th>
                                <th className="p-2">Price</th>
                                <th className="p-2">Created</th>
                              </tr>
                            </thead>
                            <tbody>
                              {viewDetails.data.shop.products
                                .slice(
                                  (productPage - 1) * productPageSize,
                                  productPage * productPageSize
                                )
                                .map((prod: any) => (
                                  <tr key={prod.id} className="border-t">
                                    <td className="p-2">{prod.title}</td>
                                    <td className="p-2">{prod.category}</td>
                                    <td className="p-2">${prod.sale_price}</td>
                                    <td className="p-2">
                                      {new Date(
                                        prod.createdAt
                                      ).toLocaleDateString()}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          <div className="flex justify-end items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                setProductPage((p) => Math.max(1, p - 1))
                              }
                              disabled={productPage === 1}
                              className="px-2 py-1 border rounded disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <span>
                              Page {productPage} of{" "}
                              {Math.ceil(
                                viewDetails.data.shop.products.length /
                                  productPageSize
                              )}
                            </span>
                            <button
                              onClick={() =>
                                setProductPage((p) =>
                                  Math.min(
                                    Math.ceil(
                                      viewDetails.data.shop.products.length /
                                        productPageSize
                                    ),
                                    p + 1
                                  )
                                )
                              }
                              disabled={
                                productPage >=
                                Math.ceil(
                                  viewDetails.data.shop.products.length /
                                    productPageSize
                                )
                              }
                              className="px-2 py-1 border rounded disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })() as React.ReactNode)
        ) : viewDetails?.type === "user" && viewDetails.data ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="mb-2">
              <h3 className="font-bold text-lg mb-1">User Info</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <b>Name:</b> {viewDetails.data.name}
                </div>
                <div>
                  <b>Email:</b> {viewDetails.data.email}
                </div>
                <div>
                  <b>Role:</b> {viewDetails.data.role}
                </div>
                <div>
                  <b>Created At:</b>{" "}
                  {new Date(viewDetails.data.createdAt).toLocaleString()}
                </div>
                <div>
                  <b>Blocked:</b> {viewDetails.data.isBlocked ? "Yes" : "No"}
                </div>
                <div>
                  <b>Deleted:</b> {viewDetails.data.isDeleted ? "Yes" : "No"}
                </div>
                {viewDetails.data.blockedAt && (
                  <div>
                    <b>Blocked At:</b>{" "}
                    {new Date(viewDetails.data.blockedAt).toLocaleString()}
                  </div>
                )}
                {viewDetails.data.deletedAt && (
                  <div>
                    <b>Deleted At:</b>{" "}
                    {new Date(viewDetails.data.deletedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-2">
              <b>Orders:</b> {viewDetails.data.orders.length}
              <br />
              <b>Total Spent:</b> $
              {viewDetails.data.orders
                .reduce((sum: number, o: any) => sum + (o.total || 0), 0)
                .toFixed(2)}
            </div>
            <div>
              <h4 className="font-semibold mb-1">Recent Orders</h4>
              {viewDetails.data.orders.length === 0 ? (
                <div className="text-gray-500">No orders</div>
              ) : (
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Order ID</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewDetails.data.orders.slice(0, 5).map((order: any) => (
                      <tr key={order.id} className="border-t">
                        <td className="p-2">{order.id}</td>
                        <td className="p-2">${order.total}</td>
                        <td className="p-2">{order.status}</td>
                        <td className="p-2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No details available.</div>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;
