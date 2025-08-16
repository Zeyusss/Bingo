"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePublishedBlogs } from "../../../hooks/useBlogs";
import { Blog } from "../../../hooks/useBlogs";
import { format } from "date-fns";
import {
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
} from "lucide-react";


const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd MMM yyyy");
};

const truncate = (text: string, length: number) => {
  if (!text) return "";
 
  const plainText = text
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ") 
    .replace(/https?:\/\/[^\s]+/g, "") 
    .replace(/\s+/g, " ") 
    .trim();
  return plainText.length > length
    ? plainText.slice(0, length) + "..."
    : plainText;
};


const BlogCard = React.memo(({ blog }: { blog: Blog }) => {
  const [avatarSrc, setAvatarSrc] = useState(blog.author?.shop?.avatar?.url);
  const likesCount = blog._count?.likes ?? blog.likes?.length ?? 0;
  const commentsCount = blog._count?.comments ?? blog.comments?.length ?? 0;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/blogs/${blog.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: "Check out this blog post!",
          url: shareUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        console.log("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
        
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col h-full group hover:shadow-lg hover:-translate-y-1">
      <div className="relative overflow-hidden flex-shrink-0">
        <Link href={`/blogs/${blog.id}`} className="block">
          <Image
            src={blog.coverImage || "/assets/blog-placeholder.png"}
            alt={blog.title}
            width={500}
            height={300}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {blog.author && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-sm font-medium z-10 px-2 py-1 rounded-full max-w-[80%] overflow-hidden">
            {avatarSrc ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={avatarSrc}
                  alt={blog.author.name || "Author"}
                  fill
                  className="object-cover"
                  onError={() => setAvatarSrc(undefined)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-semibold">
                {blog.author.name?.[0]?.toUpperCase() || "A"}
              </div>
            )}
            <span className="truncate">
              {blog.author.name || "Unknown Author"}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-white z-10 shadow-sm">
          <Link
            href={`/blogs/${blog.id}#likes`}
            className="relative group p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            aria-label="View likes"
          >
            <Heart className="w-4 h-4 hover:text-orange-500 transition" />
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {likesCount}
            </span>
          </Link>

          <div className="relative group/share">
            <button
              onClick={handleShare}
              aria-label="Share blog post"
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            >
              <Share2 className="w-4 h-4 hover:text-orange-400 transition" />
            </button>
            <div className="absolute bottom-8 right-0 bg-black text-white text-xs rounded-full px-3 py-2 flex gap-3 items-center opacity-0 group-hover/share:opacity-100 transition duration-200 z-20 shadow-lg whitespace-nowrap">
              <Facebook className="w-4 h-4 cursor-pointer hover:text-orange-400" />
              <Twitter className="w-4 h-4 cursor-pointer hover:text-orange-400" />
              <Instagram className="w-4 h-4 cursor-pointer hover:text-orange-400" />
              <Linkedin className="w-4 h-4 cursor-pointer hover:text-orange-400" />
            </div>
          </div>

          <Link
            href={`/blogs/${blog.id}#comments`}
            className="relative group/comment p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            aria-label="View comments"
          >
            <MessageCircle className="w-4 h-4 hover:text-orange-400 transition" />
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {commentsCount}
            </span>
            <div className="absolute bottom-8 right-0 bg-black text-white text-xs rounded px-3 py-2 opacity-0 group-hover/comment:opacity-100 transition duration-200 z-20 shadow-lg whitespace-nowrap">
              {commentsCount === 0
                ? "No comments yet"
                : `${commentsCount} comment${commentsCount > 1 ? "s" : ""}`}
            </div>
          </Link>
        </div>
      </div>

      <div className="p-5 flex flex-col justify-between flex-grow">
        {blog.createdAt && (
          <div className="flex items-center text-xs text-gray-500 mb-2 font-medium">
            {formatDate(blog.createdAt)}
          </div>
        )}

        <Link href={`/blogs/${blog.id}`}>
          <h3 className="text-lg font-semibold text-[#1c1c1c] mb-1 line-clamp-2 break-words group-hover:text-orange-500 transition-colors">
            {blog.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-3 break-words line-clamp-3">
          {truncate(blog.content || "", 150)}
        </p>

        <Link
          href={`/blogs/${blog.id}`}
          className="text-[#ff8a00] font-semibold text-sm hover:underline mt-auto transition-colors duration-200"
        >
          Continue reading
        </Link>
      </div>
    </div>
  );
});

BlogCard.displayName = "BlogCard";


const BlogsPage = () => {
  const { data: blogs, isLoading, error, refetch } = usePublishedBlogs();
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 8;

  const sortedBlogs = blogs
    ? [...blogs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  const totalPages = Math.ceil(sortedBlogs.length / blogsPerPage);
  const paginatedBlogs = sortedBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  const changePage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="font-worksans">
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
          <h1 className="text-5xl font-bold mb-4">Explore Our Blog</h1>
          <p className="text-lg mb-6">
            Discover the latest articles and insights from our community.
          </p>
          <nav className="text-sm">
            <Link href="/" className="hover:underline opacity-80">
              Home
            </Link>
            <span className="mx-2 opacity-60">/</span>
            <span className="font-medium">Blogs</span>
          </nav>
        </div>
      </div>

      {/* Blog grid */}
      <div className="px-6 py-12 mx-auto max-w-screen-xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
              aria-label="Loading blogs"
            />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-orange-500 mb-4">
              {error.message || "Could not fetch blog posts"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              aria-label="Retry loading blog posts"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
              {paginatedBlogs.length ? (
                paginatedBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="bg-gray-50 p-8 rounded-lg">
                    <p className="text-xl text-gray-600 mb-4">
                      No blog posts available yet
                    </p>
                    <p className="text-gray-500">
                      Check back later for new articles
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  onClick={() => changePage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => changePage(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    changePage(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
