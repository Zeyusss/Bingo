"use client";
import React, { useState, useEffect } from "react";
import {
  useAllBlogs,
  usePublishBlog,
  useRejectBlog,
  useCommentReports,
  useReviewCommentReport,
} from "../../../hooks/useBlogs";
import { Eye, X, Check, XCircle, AlertTriangle, Trash2 } from "lucide-react";

const AdminBlogReviewPage = () => {
  const [activeTab, setActiveTab] = useState<"blogs" | "reports">("blogs");
  const [filter, setFilter] = useState<
    "Pending" | "Accepted" | "Rejected" | undefined
  >();
  const [reportFilter, setReportFilter] = useState<
    "PENDING" | "REVIEWED" | "DISMISSED" | undefined
  >();
  const { data: blogs, isLoading, error } = useAllBlogs(filter);
  const { data: reports, isLoading: isLoadingReports } = useCommentReports(reportFilter);
  const { mutate: publishBlog, isPending: isPublishing } = usePublishBlog();
  const { mutate: rejectBlog, isPending: isRejecting } = useRejectBlog();
  const { mutate: reviewReport, isPending: isReviewing } = useReviewCommentReport();
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);


  useEffect(() => {
    if (selectedBlog || selectedReport) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedBlog, selectedReport]);

  const handlePublish = (blogId: string) => {
    if (!isPublishing) {
      publishBlog(blogId);
      setSelectedBlog(null);
    }
  };

  const handleReject = (blogId: string) => {
    if (!isRejecting) {
      rejectBlog(blogId);
      setSelectedBlog(null);
    }
  };

  return (
    <div className="mx-auto p-4 md:p-6">
      <div className="bg-white border-b border-gray-200 mb-6 shadow-sm rounded-md">
      <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-Poppins">
                  Blog
                </h1>
                <p className="text-sm text-gray-500 font-Roboto">
                  Monitor your Blog's activity
                </p>
              </div>
            </div>
          </div>
      </div>
      </div>


      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("blogs")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "blogs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Blog Reviews
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reports"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Comment Reports
          </button>
        </nav>
      </div>

      {/* Blog Reviews Tab */}
      {activeTab === "blogs" && (
        <>
          {/* Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter(undefined)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !filter ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              All
            </button>
        <button
          onClick={() => setFilter("Pending")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "Pending"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("Accepted")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "Accepted"
              ? "bg-green-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Accepted
        </button>
        <button
          onClick={() => setFilter("Rejected")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "Rejected"
              ? "bg-red-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading blogs...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <p className="text-red-600">Error fetching blogs: {error.message}</p>
        </div>
      )}

      {/* Blog Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs && blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {blog.author?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {blog.author?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold 
                          ${
                            blog.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                          }
                          ${
                            blog.status === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                          ${
                            blog.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : ""
                          }`}
                        >
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            onClick={() => setSelectedBlog(blog)}
                            className="text-blue-600 hover:text-blue-900 flex items-center p-1 rounded hover:bg-blue-50"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {blog.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handlePublish(blog.id)}
                                disabled={isPublishing || isRejecting}
                                className="text-green-600 hover:text-green-900 disabled:text-gray-400 p-1 rounded hover:bg-green-50"
                                title="Accept blog"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(blog.id)}
                                disabled={isPublishing || isRejecting}
                                className="text-red-600 hover:text-red-900 disabled:text-gray-400 p-1 rounded hover:bg-red-50"
                                title="Reject blog"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No blogs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blog View Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedBlog.title}
              </h2>
              <button
                onClick={() => setSelectedBlog(null)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              {selectedBlog.coverImage && (
                <div className="mb-6 rounded-lg overflow-hidden bg-gray-100 flex justify-center">
                  <img
                    src={selectedBlog.coverImage}
                    alt="Cover Preview"
                    className="max-w-full max-h-96 object-contain"
                  />
                </div>
              )}

              <div className="prose max-w-none break-words whitespace-pre-wrap">
                <div
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>

              <div className="mt-8 pt-4 border-t text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Author:</p>
                    <p>
                      {selectedBlog.author?.name || "N/A"} (
                      {selectedBlog.author?.email || "N/A"})
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Status:</p>
                    <p>{selectedBlog.status}</p>
                  </div>
                  <div>
                    <p className="font-medium">Created:</p>
                    <p>{new Date(selectedBlog.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Last Updated:</p>
                    <p>{new Date(selectedBlog.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t p-4 flex justify-end space-x-3">
              {selectedBlog.status === "Pending" && (
                <>
                  <button
                    onClick={() => handlePublish(selectedBlog.id)}
                    disabled={isPublishing}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {isPublishing ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    onClick={() => handleReject(selectedBlog.id)}
                    disabled={isRejecting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 transition-colors flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {isRejecting ? "Rejecting..." : "Reject"}
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedBlog(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Comment Reports Tab */}
      {activeTab === "reports" && (
        <>
          {/* Report Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setReportFilter(undefined)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !reportFilter ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setReportFilter("PENDING")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                reportFilter === "PENDING"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setReportFilter("REVIEWED")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                reportFilter === "REVIEWED"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Reviewed
            </button>
            <button
              onClick={() => setReportFilter("DISMISSED")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                reportFilter === "DISMISSED"
                  ? "bg-gray-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Dismissed
            </button>
          </div>

          {/* Loading State */}
          {isLoadingReports && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading reports...</span>
            </div>
          )}

          {/* Reports List */}
          {!isLoadingReports && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {reports && reports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reporter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-900 truncate" title={report.comment.content}>
                                {report.comment.content}
                              </p>
                              <p className="text-xs text-gray-500">
                                by {report.comment.user.name} on "{report.comment.blog.title}"
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{report.reporter.name}</div>
                            <div className="text-xs text-gray-500">{report.reporter.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 capitalize">
                              {report.reason.replace('_', ' ')}
                            </div>
                            {report.description && (
                              <div className="text-xs text-gray-500 mt-1" title={report.description}>
                                {report.description.length > 50 
                                  ? `${report.description.substring(0, 50)}...` 
                                  : report.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              report.status === "PENDING" 
                                ? "bg-yellow-100 text-yellow-800"
                                : report.status === "REVIEWED"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                                title="View full details"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                              {report.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => reviewReport({ 
                                      reportId: report.id, 
                                      action: "REVIEWED", 
                                      deleteComment: true 
                                    })}
                                    disabled={isReviewing}
                                    className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 disabled:bg-gray-300"
                                    title="Delete comment and mark as reviewed"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => reviewReport({ 
                                      reportId: report.id, 
                                      action: "DISMISSED" 
                                    })}
                                    disabled={isReviewing}
                                    className="inline-flex items-center px-2 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 disabled:bg-gray-300"
                                    title="Dismiss report (keep comment)"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </button>
                                </>
                              )}
                            </div>
                            {report.status !== "PENDING" && (
                              <div className="text-xs text-gray-500 mt-1">
                                {report.status === "REVIEWED" ? "Comment deleted" : "Report dismissed"}
                                {report.reviewedAt && (
                                  <div>on {new Date(report.reviewedAt).toLocaleDateString()}</div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {reportFilter 
                      ? `No ${reportFilter.toLowerCase()} reports at this time.`
                      : "No comment reports have been submitted yet."
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Comment Report Details
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="space-y-6">
                {/* Comment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Reported Comment</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 mb-2">{selectedReport.comment.content}</p>
                    <div className="text-sm text-gray-600">
                      <p><strong>Author:</strong> {selectedReport.comment.user.name} ({selectedReport.comment.user.email})</p>
                      <p><strong>Blog Post:</strong> "{selectedReport.comment.blog.title}"</p>
                    </div>
                  </div>
                </div>

                {/* Report Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Report Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reporter:</p>
                      <p className="text-gray-900">{selectedReport.reporter.name}</p>
                      <p className="text-sm text-gray-600">{selectedReport.reporter.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reason:</p>
                      <p className="text-gray-900 capitalize">{selectedReport.reason.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status:</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedReport.status === "PENDING" 
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedReport.status === "REVIEWED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reported On:</p>
                      <p className="text-gray-900">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedReport.description && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Additional Details:</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-900">{selectedReport.description}</p>
                      </div>
                    </div>
                  )}

                  {selectedReport.reviewedAt && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">Reviewed On:</p>
                      <p className="text-gray-900">{new Date(selectedReport.reviewedAt).toLocaleString()}</p>
                      {selectedReport.reviewer && (
                        <p className="text-sm text-gray-600">by {selectedReport.reviewer.name}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedReport.status === "PENDING" && (
              <div className="border-t p-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    reviewReport({ 
                      reportId: selectedReport.id, 
                      action: "REVIEWED", 
                      deleteComment: true 
                    });
                    setSelectedReport(null);
                  }}
                  disabled={isReviewing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {isReviewing ? "Deleting..." : "Delete Comment"}
                </button>
                <button
                  onClick={() => {
                    reviewReport({ 
                      reportId: selectedReport.id, 
                      action: "DISMISSED" 
                    });
                    setSelectedReport(null);
                  }}
                  disabled={isReviewing}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 transition-colors flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  {isReviewing ? "Dismissing..." : "Dismiss Report"}
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogReviewPage;
