import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ThumbsUp,
} from "lucide-react";
import enhancedAxiosInstance from "../../../utils/axiosInstance";

interface Blog {
  id: string;
  coverImage?: string;
  title: string;
  content: string;
  commentsCount?: number;
  createdAt?: string;
  lovesCount?: number;
  likesCount?: number;
  author?: {
    name?: string;
    shop?: {
      avatar?: {
        url?: string;
      };
    };
  };
}

// Helper function to format the date with a type annotation for dateString
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to truncate a string with a type annotation for text
const truncate = (text: string, length: number) => {
  if (!text) return "";
  // Remove HTML tags and decode HTML entities
  const plainText = text.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ");
  if (plainText.length <= length) return plainText;
  return plainText.substring(0, length) + "...";
};

// Main Blog component
const App = () => {
  // Explicitly type the blogs state as an array of Blog objects
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch blogs from the backend using the provided Axios instance
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await enhancedAxiosInstance.get("/blogs");
        const fetchedBlogs: Blog[] = response.data.data;
        setBlogs(fetchedBlogs);
      } catch (err) {
        setError("Failed to fetch blogs. Please try again later.");
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-worksans">
        <p className="text-gray-500">Loading latest articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 font-worksans">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="py-16 px-4 md:px-15 lg:px-20 font-worksans">
      {/* Header section with title and button */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1c]">
          Latest articles
        </h2>
        <a
          href="/blogs"
          className="bg-white text-[#1c1c1c] font-semibold text-sm px-5 py-2 rounded-full shadow-sm hover:shadow-md transition flex items-center gap-2"
        >
          Visit the Blog →
        </a>
      </div>

      {/* Grid for displaying blog articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.slice(0, 4).map((blog) => (
          <Link
            key={blog.id}
            href={`/blogs/${blog.id}`}
            className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col group transition-transform duration-300 hover:scale-[1.02]"
          >
            {/* Blog post image section */}
            <div className="relative overflow-hidden">
              <Image
                src={
                  blog.coverImage ||
                  "https://placehold.co/500x300/e0e0e0/555?text=No+Image"
                }
                alt={blog.title}
                width={500}
                height={300}
                className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Author and social icons overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-sm font-medium z-10">
                {blog.author?.shop?.avatar?.url ? (
                  <Image
                    src={blog.author.shop.avatar.url}
                    alt={blog.author.name || "Author"}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-semibold">
                    {blog.author?.name
                      ? blog.author.name[0].toUpperCase()
                      : "A"}
                  </div>
                )}
                {blog.author?.name || "Unknown Author"}
              </div>

              <div className="absolute bottom-3 right-3 flex items-center gap-3 text-white z-10">
                {/* Like icon and count */}
                <div className="relative group/love cursor-pointer">
                  <ThumbsUp className="w-4 h-4 hover:text-orange-500 transition" />
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {blog.likesCount || 0}
                  </span>
                  <div className="absolute bottom-8 right-0 bg-black text-white text-xs rounded px-3 py-2 opacity-0 group-hover/like:opacity-100 transition duration-200 z-20 shadow-lg whitespace-nowrap">
                    {blog.likesCount
                      ? `${blog.likesCount} loves`
                      : "No loves yet"}
                  </div>
                </div>

                {/* Share icon and dropdown */}
                <div className="relative group/share">
                  <Share2 className="w-4 h-4 cursor-pointer hover:text-orange-400 transition" />
                  <div className="absolute bottom-8 right-0 bg-black text-white text-xs rounded-full px-3 py-2 flex gap-3 items-center opacity-0 group-hover/share:opacity-100 transition duration-200 z-20 shadow-lg">
                    <Facebook className="w-4 h-4 cursor-pointer hover:text-orange-400" />
                    <Twitter className="w-4 h-4 cursor-pointer hover:text-orange-400" />
                    <Instagram className="w-4 h-4 cursor-pointer hover:text-orange-400" />
                    <Linkedin className="w-4 h-4 cursor-pointer hover:text-orange-400" />
                  </div>
                </div>

                {/* Comment icon and count */}
                <div className="relative group/comment cursor-pointer">
                  <MessageCircle className="w-4 h-4 hover:text-orange-400 transition" />
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {blog.commentsCount || 0}
                  </span>
                  <div className="absolute bottom-8 right-0 bg-black text-white text-xs rounded px-3 py-2 opacity-0 group-hover/comment:opacity-100 transition duration-200 z-20 shadow-lg whitespace-nowrap">
                    {blog.commentsCount
                      ? `${blog.commentsCount} comments`
                      : "Comments are empty"}
                  </div>
                </div>
              </div>
            </div>

            {/* Blog post content section */}
            <div className="p-5 flex flex-col justify-between flex-grow">
              <h3 className="text-lg font-semibold text-[#1c1c1c] mb-1 group-hover:text-orange-500 transition-colors">
                {blog.title}
              </h3>
              {/* Display the created date if available */}
              {blog.createdAt && (
                <p className="text-sm text-gray-500 mb-2">
                  {formatDate(blog.createdAt)}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-3">
                {truncate(blog.content, 120)}
              </p>
              <span className="text-[#ff8a00] font-semibold text-sm hover:underline mt-auto">
                Continue reading
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default App;
