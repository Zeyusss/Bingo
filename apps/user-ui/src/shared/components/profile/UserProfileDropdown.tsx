"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, User, Package, MessageCircle, MapPin, Lock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import useUser from "../../../hooks/useUser";
import { useAuthStore } from "../../../store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../store";
import axiosInstance from "../../../utils/axiosInstance";
import ProfileIcon from "../../../assets/svgs/profile-icon";

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { setLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/logout-user");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      const { clearSessionData } = useStore.getState();
      clearSessionData();
      
      setLoggedIn(false);
      setIsOpen(false);
      router.push("/login");
    } catch (error) {
      console.error('Logout failed:', error);
   
      setLoggedIn(false);
      localStorage.removeItem('token');
      setIsOpen(false);
      router.push("/login");
    }
  };

  const menuItems = [
    { icon: User, label: "My Profile", path: "/profile" },
    { icon: Package, label: "My Orders", path: "/profile?tab=My Orders" },
    { icon: MessageCircle, label: "Inbox", path: "/inbox" },
    { icon: MapPin, label: "Shipping Address", path: "/profile?tab=Shipping Address" },
    { icon: Lock, label: "Change Password", path: "/profile?tab=Change Password" },
  ];

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-full bg-gray-100 flex items-center gap-2 border border-gray-200 hover:bg-gray-200 transition-all duration-200"
      >
        <ProfileIcon />
        <span className="text-sm font-medium">{user?.name?.split(" ")[0]}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Caret Arrow */}
          <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45"></div>
          
          {/* User Info Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <ProfileIcon />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors group"
              >
                <item.icon className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{item.label}</span>
              </button>
            ))}
            
            {/* Divider */}
            <div className="border-t border-gray-100 my-2"></div>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 transition-colors group"
            >
              <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
              <span className="text-sm text-gray-700 group-hover:text-red-600">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
