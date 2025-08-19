"use client";
import { Facebook, Instagram, Youtube, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

const Footer = () => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axiosInstance.get("/product/api/categories-with-count");
        const categoryNames = data.categories.map((cat: any) => cat.name);
        setCategories(categoryNames.slice(0, 10)); 
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white pt-16 pb-6 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500 opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
      
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
        {/* Logo & Socials */}
        <div className="space-y-6">
          <Link href="/" className="text-3xl font-bold flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">BINGO</span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            Discover unique handcrafted treasures from talented artisans worldwide. Quality, creativity, and passion in every piece.
          </p>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">Follow Us:</h4>
            <div className="flex gap-3">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 group"
              >
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-600 transition-all duration-300 group"
              >
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-300 group"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 group"
              >
                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Useful Links */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold mb-4 text-orange-400">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/about-us" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                <span className="w-1 h-1 bg-orange-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                <span className="w-1 h-1 bg-orange-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/our-team" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                <span className="w-1 h-1 bg-orange-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                Our Team
              </Link>
            </li>
            <li>
              <Link href="/blogs" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                <span className="w-1 h-1 bg-orange-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                Blog
              </Link>
            </li>
            <li>
              <Link href="/policies" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                <span className="w-1 h-1 bg-orange-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                Policies
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold mb-4 text-orange-400">Shop Categories</h4>
          <div className="grid grid-cols-1 gap-y-3 text-sm">
            <ul className="space-y-3">
              {categories.slice(0, 6).map((category) => (
                <li key={category}>
                  <Link href={`/products?categories=${encodeURIComponent(category)}`} className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-orange-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact & App */}
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">Contact Info</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>📧 support@bingo-awaken.com</p>
              <p>📞 +20 123 456 7890</p>
              <p>📍 Cairo, Egypt</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">
              Download Our App
            </h4>
            <p className="text-sm text-gray-300 mb-4">
              Get 15% off your first purchase
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="https://play.google.com/store/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform duration-200"
              >
                <Image
                  src="/assets/Footer/google-play.svg"
                  alt="Google Play"
                  width={140}
                  height={42}
                />
              </Link>
              <Link
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform duration-200"
              >
                <Image
                  src="/assets/Footer/app-store.svg"
                  alt="App Store"
                  width={140}
                  height={42}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mt-12 pt-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-screen-xl mx-auto">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-400">
              © 2025 <span className="font-semibold text-orange-400">BINGO</span> - Handcrafted with ❤️
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Premium E-commerce Solutions by BINGO TEAM
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Secure Payments:</span>
            <Image
              src="/assets/Footer/payments.png"
              alt="Payment Methods"
              width={200}
              height={20}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
