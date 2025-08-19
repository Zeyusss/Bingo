

import React from "react";
import { ShieldCheck, FileText, Users, ShoppingBag, AlertCircle, Gavel } from "lucide-react";

export default function Page() {
  const policies = [
    { title: "Prohibited Items", href: "/policies/prohibites", icon: AlertCircle },
    { title: "Intellectual Property Policy", href: "/policies/intellectual", icon: FileText },
    { title: "Off-Platform", href: "/policies/off-platform", icon: ShieldCheck },
    { title: "Content Moderation", href: "/policies/content-policy", icon: FileText },
    { title: "Handmade Policy", href: "/policies/handmade", icon: Users },
    { title: "Purchase Protection For Sellers", href: "/policies/purchies", icon: ShoppingBag },
    { title: "Community Policy", href: "/policies/commuinty", icon: Users },
    { title: "Buyer Policy", href: "/policies/buyer-policy", icon: ShoppingBag },
    { title: "Cases Policy", href: "/policies/cases", icon: Gavel },
    { title: "Discrimination and Hateful Content Policy", href: "/policies/discrimination", icon: AlertCircle },
    { title: "Seller Policy", href: "/policies/seller-policy", icon: ShieldCheck },
  ];

  return (
    <div>
      <div className="w-[100%]">
        <img src="./assets/policy2-612x612.jpg" className="w-[100%] h-[500px]"/>
        {/* <div className="bg-[url('/assets/policy2-612x612.jpg')] bg-cover bg-center w-[100%] h-[400px] rounded-lg shadow-lg mb-8 flex flex-col items-start justify-center gap-10"></div> */}
      </div>
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center">Our Policies</h1>
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {policies.map((policy,index) => {
          const Icon = policy.icon;
          const lastcard = index === policies.length - 1;
          return (
            <a
              key={policy.href}
              href={policy.href}
              
             className={`flex items-start gap-3 p-5 border border-gray-300 rounded-2xl shadow-sm hover:shadow-md hover:bg-gray-50 transition
          ${lastcard ? "lg:col-span-2" : ""}`}
      >
            
              <Icon className="w-6 h-6 text-blue-600 mt-1" />
              <span className="font-medium text-lg">{policy.title}</span>
            </a>
          );
        })}
      </div>
    </div>
    </div>
  );
}
