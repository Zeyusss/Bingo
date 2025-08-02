'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteDiscountCodeModal from 'apps/seller-ui/src/shared/components/modals/delete.discount-codes';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { AxiosError } from 'axios';
import { Plus, Trash } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from "react-hot-toast";
import { Input } from "apps/seller-ui/src/shared/components/ui/input";
import { Button } from "apps/seller-ui/src/shared/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "apps/seller-ui/src/shared/components/ui/table";
import { Skeleton } from "apps/seller-ui/src/shared/components/ui/skeleton";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();
  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    }
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      discountCode: "",
    }
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post("/product/api/create-discount-code", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      reset();
      setShowModal(false);
    }
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId) => {
      await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      setShowDeleteModal(false);
    }
  });

  const handleDeleteClick = (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  }

  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only create up to 8 discount codes.");
      return;
    }
    createDiscountCodeMutation.mutate(data);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
          <p className="text-gray-600 mt-1">Manage your shop discounts</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Discount
        </Button>
      </div>

      <div className="text-sm text-gray-500">
        {discountCodes.length} active discount codes
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-full h-10" />
            ))}
          </div>
        ) : discountCodes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No Discount Codes Available!</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountCodes.map((discount: any) => (
                <TableRow key={discount.id}>
                  <TableCell>{discount.public_name}</TableCell>
                  <TableCell className="capitalize">
                    {discount.discountType === "percentage" ? "Percentage (%)" : "Flat ($)"}
                  </TableCell>
                  <TableCell>
                    {discount.discountType === "percentage"
                      ? `${discount.discountValue}%`
                      : `$${discount.discountValue}`}
                  </TableCell>
                  <TableCell>{discount.discountCode}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(discount)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[95vw] max-w-md border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900">Create Discount Code</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-gray-900">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input {...register("public_name", { required: "Title is required" })} placeholder="Enter title" />
                {errors.public_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.public_name.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select {...field} className="w-full px-3 py-2 border rounded-md bg-white">
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat ($)</option>
                    </select>
                  )}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Discount Value</label>
                <Input
                  type="number"
                  min={1}
                  {...register("discountValue", { required: "Value is required" })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Discount Code</label>
                <Input
                  {...register("discountCode", { required: "Code is required" })}
                  placeholder="e.g. SUMMER20"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={createDiscountCodeMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {createDiscountCodeMutation.isPending ? "Creating..." : "Create"}
              </Button>
              {createDiscountCodeMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                  {(createDiscountCodeMutation.error as AxiosError<{ message: string }>)?.response?.data?.message || "Something went wrong"}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteDiscountCodeMutation.mutate(selectedDiscount.id)}
        />
      )}
    </div>
  );
}

export default Page;
