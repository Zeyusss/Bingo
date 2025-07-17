"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { countries } from "apps/user-ui/src/utils/countries";
import { Plus, X, MapPin, Edit, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const ShippingAddressSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [editAddress, setEditAddress] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: "Home",
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "Egypt",
      isDefault: false,
    },
  });

  const { mutate: addAddress } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosInstance.post("/api/add-address", payload);
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
      reset();
      setShowModal(false);
    },
  });

  const { mutate: editAddressMutate } = useMutation({
    mutationFn: async ({ addressId, ...payload }: any) => {
      const res = await axiosInstance.put(`/api/edit-address/${addressId}`, payload);
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
      reset();
      setShowModal(false);
      setEditAddress(null);
    },
  });

  const { mutate: deleteAddress } = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/delete-address/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
    },
  });

  const { mutate: setDefaultAddress } = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.put(`/api/set-default-address/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      console.log('Set default success', data);
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
    },
  });

  const onSubmit = async (data: any) => {
    if (editAddress) {
      editAddressMutate({ addressId: editAddress.id, ...data });
    } else {
      addAddress({
        ...data,
        isDefault: data?.isDefault === "true" || data?.isDefault === true,
      });
    }
  };


  const handleEdit = (address: any) => {
    setEditAddress(address);
    setShowModal(true);
    Object.entries(address).forEach(([key, value]) => {
      setValue(key as any, value);
    });
  };


  const handleAdd = () => {
    setEditAddress(null);
    reset();
    setShowModal(true);
  };

  console.log('Addresses:', addresses);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 mt-1">Manage your delivery addresses</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          disabled={addresses.length >= 3}
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : addresses.length === 0 ? (
          <div className="text-gray-500">No addresses found.</div>
        ) : (
          [...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map((address: any) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${address.isDefault
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {address.label}
                    </span>
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDefaultAddress(address.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    disabled={address.isDefault}
                  >
                    {address.isDefault ? "Default" : "Set as Default"}
                  </button>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAddress(address.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <p className="font-medium text-gray-900">{address.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {address.street}
                </p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state} {address.zip}
                </p>
                <p className="text-sm text-gray-600">{address.country}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => { setShowModal(false); setEditAddress(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {editAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {editAddress ? "Edit your shipping address" : "Add a new shipping address for your orders"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Label Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Label
                </label>
                <select
                  {...register("label")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  placeholder="Enter your full name"
                  {...register("name", { required: "Name is required" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  placeholder="Enter street address"
                  {...register("street", { required: "Street address is required" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {errors.street && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.street.message}
                  </p>
                )}
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    placeholder="Enter city"
                    {...register("city", { required: "City is required" })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    placeholder="Enter state"
                    {...register("state", { required: "State is required" })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              {/* ZIP and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    placeholder="Enter ZIP code"
                    {...register("zip", { required: "ZIP code is required" })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {errors.zip && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.zip.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    {...register("country", { required: "Country is required" })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                  {countries.map((country)=>(
                    <option key={country} value={country}>{country}</option>
                  ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  {...register("isDefault")}
                  className="w-4 h-4 text-blue-600 bg-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default address
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditAddress(null); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editAddress ? "Save Changes" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressSection;