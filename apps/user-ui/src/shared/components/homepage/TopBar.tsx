"use client";
import { ChevronDown, Phone } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import EurIcon from "../../../assets/images/flags/eu.svg";
import UsdIcon from "../../../assets/images/flags/us.svg";
import EgpIcon from "../../../assets/images/flags/eg.svg";
import ExpertsImage from "../../../assets/images/experts/contact-expert.png";

const CURRENCIES = [
  { code: "EUR", label: "EUR", icon: EurIcon },
  { code: "USD", label: "USD", icon: UsdIcon },
  { code: "EGP", label: "EGP", icon: EgpIcon },
];

const TopBar = () => {
  const [currency, setCurrency] = useState("EUR");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentIcon = CURRENCIES.find((c) => c.code === currency)?.icon;


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="hidden lg:flex w-full bg-gray-100 border-b text-sm font-Poppins text-gray-800 z-[20] relative">
      <div className="w-[95%] m-auto flex justify-between items-center py-2">
        <div className="flex items-center gap-4 relative">
          <div
            ref={dropdownRef}
            className="flex items-center gap-2 cursor-pointer relative"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <Image src={currentIcon!} alt={currency} width={20} height={14} />
            <span className="font-medium">{currency}</span>
            <ChevronDown size={14} />
            {showDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-white border shadow rounded w-36 z-50 overflow-hidden">
                {CURRENCIES.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors hover:bg-orange-100 hover:text-orange-600"
                    onClick={() => {
                      setCurrency(c.code);
                      setShowDropdown(false);
                    }}
                  >
                    <Image src={c.icon} alt={c.code} width={20} height={14} />
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <span className="text-gray-300">|</span>
          <Link href="#" className="hover:text-orange-500 transition-colors font-medium">
          Policies
          </Link>
          <Link href="#" className="hover:text-orange-500 transition-colors font-medium">
          About Us
          </Link>
          <Link href="#" className="hover:text-orange-500 transition-colors font-medium">
          Our Team
          </Link>
        </div>


        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-medium">
            <Phone size={16} />
            <span>(686) 492-1044</span>
          </div>
          <span className="text-gray-300">|</span>
          <Link
            href="/contact"
            className="flex items-center gap-2 hover:text-orange-500 transition-colors font-medium"
          >
            <Image
              src={ExpertsImage}
              alt="Experts"
              width={65}
              height={22}
              quality={100}
              priority
              className="object-contain"
            />
            <span className="text-sm">Contact with an expert</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
