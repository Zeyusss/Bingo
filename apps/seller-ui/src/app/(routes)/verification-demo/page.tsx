"use client";
import React from "react";
import { CheckCircle, AlertTriangle, Clock, Shield } from "lucide-react";

const VerificationTestPage = () => {
  // Mock seller data to demonstrate different verification states
  const mockSellers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      isVerified: true,
      verificationStatus: "Approved",
      shop: { name: "John's Electronics" },
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      isVerified: false,
      verificationStatus: "Pending",
      shop: { name: "Jane's Fashion" },
    },
    {
      id: "3",
      name: "Bob Wilson",
      email: "bob@example.com",
      isVerified: false,
      verificationStatus: "Rejected",
      shop: { name: "Bob's Books" },
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      isVerified: false,
      verificationStatus: "RequiresResubmission",
      shop: { name: "Alice's Art" },
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="text-green-500" size={20} />;
      case "Pending":
        return <Clock className="text-yellow-500" size={20} />;
      case "Rejected":
        return <AlertTriangle className="text-red-500" size={20} />;
      case "RequiresResubmission":
        return <Shield className="text-orange-500" size={20} />;
      default:
        return <AlertTriangle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "RequiresResubmission":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDashboardAccess = (isVerified: boolean) => {
    return isVerified ? (
      <span className="text-green-600 font-medium">✓ Full Access</span>
    ) : (
      <span className="text-red-600 font-medium">✗ Restricted</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Seller Identity Verification System
          </h1>
          <p className="text-gray-600 mb-8">
            Demo of the new seller verification system showing different
            verification states
          </p>

          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Shield className="text-blue-600 mb-2" size={32} />
              <h3 className="font-semibold text-blue-900">ID Verification</h3>
              <p className="text-blue-700 text-sm">
                Front & back ID photos required
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="text-green-600 mb-2" size={32} />
              <h3 className="font-semibold text-green-900">Contract Signing</h3>
              <p className="text-green-700 text-sm">
                Digital contract signature
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <AlertTriangle className="text-purple-600 mb-2" size={32} />
              <h3 className="font-semibold text-purple-900">Personal Photo</h3>
              <p className="text-purple-700 text-sm">
                Clear identity confirmation
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <Clock className="text-orange-600 mb-2" size={32} />
              <h3 className="font-semibold text-orange-900">Admin Review</h3>
              <p className="text-orange-700 text-sm">
                Manual verification process
              </p>
            </div>
          </div>

          {/* Verification States Demo */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Seller Verification States
          </h2>

          <div className="space-y-4">
            {mockSellers.map((seller) => (
              <div
                key={seller.id}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-bold text-gray-600">
                        {seller.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {seller.name}
                      </h3>
                      <p className="text-gray-600">{seller.email}</p>
                      <p className="text-sm text-gray-500">
                        {seller.shop.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Verification Status
                      </p>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(
                          seller.verificationStatus
                        )}`}
                      >
                        {getStatusIcon(seller.verificationStatus)}
                        <span className="font-medium">
                          {seller.verificationStatus}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Dashboard Access</p>
                      {getDashboardAccess(seller.isVerified)}
                    </div>
                  </div>
                </div>

                {/* Action buttons based on status */}
                <div className="mt-4 flex gap-2">
                  {!seller.isVerified && (
                    <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Complete Verification
                    </button>
                  )}
                  {seller.isVerified && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Access Dashboard
                    </button>
                  )}
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Implementation Notes */}
          <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Implementation Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Backend Features
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Enhanced Prisma schema with verification fields</li>
                  <li>✓ Seller verification API endpoints</li>
                  <li>✓ Admin verification management APIs</li>
                  <li>✓ Middleware for verified seller checks</li>
                  <li>✓ Contract generation and download</li>
                  <li>✓ Image upload for verification documents</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Frontend Features
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Settings page for verification management</li>
                  <li>✓ Step-by-step verification process</li>
                  <li>✓ Dashboard protection for unverified sellers</li>
                  <li>✓ Admin verification review interface</li>
                  <li>✓ Verification status indicators</li>
                  <li>✓ Document upload with preview</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Required Verification Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">ID</span>
                </div>
                <p className="font-medium text-blue-900">ID Front</p>
                <p className="text-sm text-blue-700">
                  Government issued ID front side
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">ID</span>
                </div>
                <p className="font-medium text-blue-900">ID Back</p>
                <p className="text-sm text-blue-700">
                  Government issued ID back side
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">📄</span>
                </div>
                <p className="font-medium text-blue-900">Signed Contract</p>
                <p className="text-sm text-blue-700">
                  Downloaded and signed contract
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">👤</span>
                </div>
                <p className="font-medium text-blue-900">Personal Photo</p>
                <p className="text-sm text-blue-700">Clear photo of yourself</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationTestPage;
