"use client";
import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  FileText,
  Loader2,
  AlertTriangle,
  Eye,
  X,
} from "lucide-react";
import { useMyBlogs, useDeleteBlog, Blog } from "../../../../hooks/useBlogs";
import { useRouter } from "next/navigation";

const BlogPage = () => {
  const { data: blogs, isLoading, isError, error } = useMyBlogs();
  const deleteBlogMutation = useDeleteBlog();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);
  const router = useRouter();


  useEffect(() => {
    if (viewingBlog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [viewingBlog]);

  const handleDelete = (blogId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this blog post? This action cannot be undone."
      )
    ) {
      setDeletingId(blogId);
      deleteBlogMutation.mutate(blogId, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const handleEdit = (blog: Blog) => {
    if (blog.status !== "Accepted") {
      alert("Only published blogs can be edited");
      return;
    }
    router.push(`/dashboard/blog/edit/${blog.id}`);
  };

  const getStatusChip = (status: Blog["status"]) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "Accepted":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Published
          </span>
        );
      case "Pending":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Pending
          </span>
        );
      case "Rejected":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Rejected
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            Unknown
          </span>
        );
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          <p className="ml-4 text-lg text-gray-600">Loading your blogs...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center p-20 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="mt-4 text-lg font-semibold text-red-700">
            Failed to load blogs
          </p>
          <p className="mt-1 text-sm text-red-600">
            {(error as Error)?.message || "An unknown error occurred"}
          </p>
        </div>
      );
    }

    if (!blogs || blogs.length === 0) {
      return (
        <div className="text-center p-20">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No blogs yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first blog post.
          </p>
        </div>
      );
    }

    return (
      <ul className="divide-y divide-gray-200">
        {blogs.map((blog) => (
          <li key={blog.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {blog.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated on{" "}
                  {new Date(blog.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4 ml-4">
                {getStatusChip(blog.status)}
                <button
                  onClick={() => setViewingBlog(blog)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center"
                  title="View blog post"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleEdit(blog)}
                  className={`text-sm font-medium ${
                    blog.status === "Accepted"
                      ? "text-sky-600 hover:text-sky-800"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  title={
                    blog.status !== "Accepted"
                      ? "Only published blogs can be edited"
                      : "Edit blog post"
                  }
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  disabled={deletingId === blog.id}
                  className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === blog.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-sky-600" />
            Manage Your Blogs
          </h1>
          <button
            onClick={() => router.push("/dashboard/blog/create")}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
            Create New Post
          </button>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Blog View Modal - Updated with fixes */}
      {viewingBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {viewingBlog.title}
              </h2>
              <button
                onClick={() => setViewingBlog(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Fixed Image Display */}
              {viewingBlog.coverImage && (
                <div className="w-full mb-6 bg-gray-100 rounded-lg overflow-hidden flex justify-center">
                  <div className="max-w-full max-h-[500px]">
                    <img
                      src={viewingBlog.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Fixed Content Display */}
              <div className="prose max-w-none break-words whitespace-pre-wrap">
                <div
                  dangerouslySetInnerHTML={{ __html: viewingBlog.content }}
                />
              </div>

              <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                <p>
                  Created: {new Date(viewingBlog.createdAt).toLocaleString()}
                </p>
                <p>
                  Last updated:{" "}
                  {new Date(viewingBlog.updatedAt).toLocaleString()}
                </p>
                <p>Status: {viewingBlog.status}</p>
              </div>
            </div>
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={() => setViewingBlog(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
