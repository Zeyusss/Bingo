"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  useBlogById,
  useToggleLike,
  useAddComment,
  useBlogComments,
  useBlogLikes,
  useUpdateComment,
  useDeleteComment,
  useRecentPosts,
  useReportComment,
} from "../../../../hooks/useBlogs";
import useUser from "../../../../hooks/useUser";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import Link from "next/link";
import { MessageCircle, Facebook, Twitter, Instagram, Linkedin, Copy, Check } from "lucide-react";


const BlogDetailPage = () => {
  const params = useParams();
  const blogId = params.blogId as string;

  const { data: blog, isLoading, error, refetch } = useBlogById(blogId);
  const { data: comments } = useBlogComments(blogId);
  const { data: likes } = useBlogLikes(blogId);
  const { data: recentPosts } = useRecentPosts();

  const sellerId = blog?.author.id;

  const { mutate: toggleLike, isPending: isLiking } = useToggleLike(blogId);
  const { mutate: addComment, isPending: isCommenting } = useAddComment(blogId);
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(blogId);
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(blogId);
  const { mutate: reportComment, isPending: isReporting } = useReportComment(blogId);

  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [reportingComment, setReportingComment] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const { user } = useUser();
  const userId = user?.id;

  const hasLiked = likes?.some((like) => like.userId === userId) || false;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a comment before posting");
      return;
    }
    if (!user) {
      toast.error("Please sign in to post a comment", {
        duration: 4000,
        icon: "🔐",
      });
      return;
    }
    addComment(comment, {
      onSuccess: () => {
        setComment("");
        
      },
    });
  };

  const handleLike = () => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }
    toggleLike();
  };

  const startEditing = (comment: { id: string; content: string }) => {
    setEditingCommentId(comment.id);
    setEditedComment(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditedComment("");
  };

  const handleUpdateComment = (commentId: string) => {
    if (!editedComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    updateComment(
      { commentId, content: editedComment },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditedComment("");
          
        },
      }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteComment(commentId, {
        onSuccess: () => {
          
        },
      });
    }
  };

  const startReporting = (commentId: string) => {
    setReportingComment(commentId);
    setReportReason("");
    setReportDescription("");
  };

  const cancelReporting = () => {
    setReportingComment(null);
    setReportReason("");
    setReportDescription("");
  };

  const handleReportComment = () => {
    if (!reportReason.trim()) {
      toast.error("Please select a reason for reporting");
      return;
    }
    if (!reportingComment) return;

    reportComment(
      { 
        commentId: reportingComment, 
        reason: reportReason, 
        description: reportDescription.trim() || undefined 
      },
      {
        onSuccess: () => {
          cancelReporting();
        },
      }
    );
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Unknown date" : format(date, "MMMM d, yyyy");
    } catch {
      return "Unknown date";
    }
  };

 
  const defaultAvatar = "/assets/default-avatar.svg";
  
 
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const blogTitle = blog?.title || '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blogTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    instagram: '#'
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-xl mb-4">
          {error.message || "Error loading blog post"}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          aria-label="Retry loading blog post"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-20">
        <p className="text-xl">Blog post not found</p>
      </div>
    );
  }

  return (
    <div className="font-sans">
            {/* Hero section */}
            <div className="relative h-[320px] md:h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('/assets/blog/bg-blog.webp')" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 opacity-10 pointer-events-none z-[5]">
          <div
            className="h-full w-full bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Explore MY Blog</h1>
          <p className="text-lg mb-6">
            Discover the latest articles and insights from My community.
          </p>
          <nav className="text-sm">
            <Link href="/blogs" className="hover:underline opacity-80">
              Blogs
            </Link>
            <span className="mx-2 opacity-60">/</span>
            <span className="font-medium" title={blog.title}>
              {blog.title.length > 40 ? `${blog.title.substring(0, 40)}...` : blog.title}
            </span>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article>
              {/* Post Header */}
              <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {blog.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Image
                      src={blog.author.shop?.avatar?.url || defaultAvatar}
                      alt={blog.author.name}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-orange-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== defaultAvatar) {
                          target.src = defaultAvatar;
                        }
                      }}
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-gray-900">
                        {blog.author.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Author
                      </span>
                    </div>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    <span>{comments?.length || 0} comments</span>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-10">
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <Image
                    src={blog.coverImage || "/assets/default-avatar.svg"}
                    alt={blog.title}
                    width={1200}
                    height={600}
                    className="w-full h-auto transition-transform duration-300 hover:scale-105"
                    priority
                  />
                </div>
              </div>

              {/* Article Content */}
              <div
                className="prose prose-lg prose-orange max-w-none text-gray-700 mb-12 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* Related Posts By Author */}
              {recentPosts && recentPosts.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">More from this Author</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recentPosts
                      .filter((post) => post.author.id === sellerId && post.id !== blogId)
                      .slice(0, 3)
                      .map((post) => (
                        <article key={post.id} className="bg-white rounded-lg overflow-hidden group">
                          <Link href={`/blogs/${post.id}`}>
                            <div className="relative h-56">
                              <Image
                                src={post.coverImage || "/assets/default-avatar.svg"}
                                alt={post.title}
                                layout="fill"
                                objectFit="cover"
                                className="transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          </Link>
                          <div className="p-6">
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                              <Link href={`/blogs/${post.id}`} className="line-clamp-2">
                                {post.title}
                              </Link>
                            </h3>
                          </div>
                        </article>
                      ))}
                  </div>
                </div>
              )}

              {/* Comments and Reply Section */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      hasLiked
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{hasLiked ? "Liked" : "Like"}</span>
                    <span className="ml-2 text-sm font-normal">
                      ({likes?.length || 0})
                    </span>
                  </button>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-600 hidden sm:block">Share:</span>
                    <a 
                      href={shareUrls.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a 
                      href={shareUrls.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-sky-500 transition-colors"
                      title="Share on Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => toast("Instagram doesn't support direct link sharing. Please copy the link and share manually.", {
                        icon: "ℹ️",
                        duration: 4000,
                      })}
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                      title="Instagram sharing info"
                    >
                      <Instagram className="w-5 h-5" />
                    </button>
                    <a 
                      href={shareUrls.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-700 transition-colors"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                      title="Copy link to clipboard"
                    >
                      {copySuccess ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {comments?.length || 0} Comments
                  </h2>
                  <div className="space-y-6">
                    {comments?.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-4">
                        <Image
                          src={comment.user.avatar?.url || defaultAvatar}
                          alt={comment.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== defaultAvatar) {
                              target.src = defaultAvatar;
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          {editingCommentId === comment.id ? (
                            <div>
                              <textarea
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                rows={3}
                              />
                              <div className="flex items-center space-x-2 mt-2">
                                <button
                                  onClick={() => handleUpdateComment(comment.id)}
                                  disabled={isUpdating}
                                  className="px-3 py-1 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600"
                                >
                                  {isUpdating ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-800 truncate max-w-[180px] inline-block" title={comment.user.name}>
                                    {comment.user.name}
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs">
                                  {userId === comment.user.id ? (
                                    <>
                                      <button
                                        onClick={() => startEditing(comment)}
                                        className="text-gray-500 hover:text-orange-600"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        disabled={isDeleting}
                                        className="text-gray-500 hover:text-red-600"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  ) : (
                                    user && (
                                      <button
                                        onClick={() => startReporting(comment.id)}
                                        className="text-gray-500 hover:text-red-600"
                                      >
                                        Report
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-700 mt-1">{comment.content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leave a Reply Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Leave a Reply</h3>
                  {!user && (
                    <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm">
                      <span className="font-medium">Please log in</span> to add a comment and join the discussion.
                    </p>
                  )}
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                        Comment *
                      </label>
                      <textarea
                        id="comment"
                        rows={6}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className={`px-6 py-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                          isCommenting || !comment.trim()
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                        disabled={isCommenting || !comment.trim()}
                      >
                        {isCommenting ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Recent Posts */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Recent Posts</h3>
                <div className="space-y-4">
                  {recentPosts?.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-center gap-4">
                      <Image
                        src={post.coverImage || "/assets/default-avatar.svg"}
                        alt={post.title}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-semibold hover:text-orange-500">
                          <Link 
                            href={`/blogs/${post.id}`} 
                            className="block truncate" 
                            title={post.title}
                          >
                            {post.title}
                          </Link>
                        </h4>
                        <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Comments */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Recent Comments</h3>
                <div className="space-y-4">
                  {comments?.slice(0, 3).map((comment) => (
                    <div key={comment.id} className="text-sm space-y-1">
                      <div className="flex flex-col">
                        <span 
                          className="font-semibold text-gray-800 truncate max-w-[160px]" 
                          title={comment.user.name}
                        >
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          commented on{" "}
                          <Link 
                            href={`/blogs/${blog.id}`} 
                            className="text-orange-500 hover:underline font-medium"
                            title={blog.title}
                          >
                            {blog.title.length > 30 ? `${blog.title.substring(0, 30)}...` : blog.title}
                          </Link>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Report Comment Modal */}
      {reportingComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Report Comment</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reporting *
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="hate_speech">Hate Speech</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="misinformation">Misinformation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="Provide additional context about why you're reporting this comment..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleReportComment}
                disabled={isReporting || !reportReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isReporting ? "Reporting..." : "Submit Report"}
              </button>
              <button
                onClick={cancelReporting}
                disabled={isReporting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetailPage;