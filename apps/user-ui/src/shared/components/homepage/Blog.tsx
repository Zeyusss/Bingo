"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const articles = [
  {
    image: "/assets/blog/blog-1.jpg",
    category: "Decoration",
    date: "26 May 2023",
    title: "In the heart of Valencia",
    excerpt:
      "As an alternative theory, (and because Latin scholars do this sort of thing) someone tracked down a ...",
    authorName: "Mr. Mackay",
    authorImage: "/assets/blog/avatar-blog.jpg",
    comments: 0,
  },
  {
    image: "/assets/blog/blog-2.jpg",
    category: "Furniture",
    date: "09 May 2023",
    title: "Ethimo mountain style",
    excerpt:
      "So how did the classical Latin become so incoherent? According to McClintock, a 15th century typeset...",
    authorName: "Mr. Mackay",
    authorImage: "/assets/blog/avatar-blog.jpg",
    comments: 0,
  },
  {
    image: "/assets/blog/blog-3.jpg",
    category: "Wooden accessories",
    date: "30 Apr 2023",
    title: "For clear thinking",
    excerpt:
      "The passage experienced a surge in popularity during the 1960s when Letraset used it on their dry-tr...",
    authorName: "Mr. Mackay",
    authorImage: "/assets/blog/avatar-blog.jpg",
    comments: 0,
  },
  {
    image: "/assets/blog/blog-4.jpg",
    category: "Design trends",
    date: "18 Apr 2023",
    title: "The clean series",
    excerpt:
      "So when is it okay to use lorem ipsum? First, lorem ipsum works well for staging. It’s like the prop...",
    authorName: "Mr. Mackay",
    authorImage: "/assets/blog/avatar-blog.jpg",
    comments: 0,
  },
];

const Blog = () => {
  return (
    <section className="py-16 px-4 md:px-20 lg:px-28 font-worksans">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1c]">
          Latest articles
        </h2>
        <a
          href="/blog"
          className="bg-white text-[#1c1c1c] font-semibold text-sm px-5 py-2 rounded-full shadow-sm hover:shadow-md transition flex items-center gap-2"
        >
          Visit the Blog →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((article, index) => (
          <div
            key={index}
            className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col group"
          >
            {/* Image with overlays */}
            <div className="relative overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                width={500}
                height={300}
                className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Author (bottom-left) */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-sm font-medium z-10">
                <Image
                  src={article.authorImage}
                  alt={article.authorName}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
                {article.authorName}
              </div>

              {/* Share and Comment Icons */}
              <div className="absolute bottom-3 right-3 flex items-center gap-3 text-white z-10">
                {/* Share */}
                <div className="relative group/share">
                  <Share2 className="w-4 h-4 cursor-pointer hover:text-orange-400 transition" />
                  <div className="absolute bottom-8 right-0 bg-black text-white text-xs rounded-full px-3 py-2 flex gap-3 items-center opacity-0 group-hover/share:opacity-100 transition duration-200 z-20 shadow-lg">
                    <Facebook className="w-4 h-4 cursor-pointer hover:text-orange-400" />
                    <Twitter className="w-4 h-4 cursor-pointer hover:text-orange-400" />
                    <Instagram className="w-4 h-4 cursor-pointer hover:text-orange-400" />
                    <Linkedin className="w-4 h-4 cursor-pointer hover:text-orange-400" />
                  </div>
                </div>

                {/* Comment */}
                <div className="relative group/comment cursor-pointer">
                  <MessageCircle className="w-4 h-4 hover:text-orange-400 transition" />
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {article.comments}
                  </span>
                  <div className="absolute bottom-8 right-0 bg-black text-white text-xs rounded px-3 py-2 opacity-0 group-hover/comment:opacity-100 transition duration-200 z-20 shadow-lg">
                    Comments are empty
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col justify-between flex-grow">
              <p className="text-sm text-gray-500 mb-1">
                {article.category} / {article.date}
              </p>
              <h3 className="text-md font-semibold text-[#1c1c1c] mb-1">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{article.excerpt}</p>
              <a
                href="#"
                className="text-[#ff8a00] font-semibold text-sm hover:underline mt-auto"
              >
                Continue reading
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Blog;
