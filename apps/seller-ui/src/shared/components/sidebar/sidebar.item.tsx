import Link from 'next/link';
import React from 'react'

interface Props{
    title: string;
    icon: React.ReactNode;
    isActive?: boolean;
    href?: string;
    onClick?: () => void;
}

const SidebarItem = ({ icon, title, isActive, href, onClick }: Props) => {
  const itemContent = (
    <div
      className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
        ${isActive
          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
      `}
    >
      <span className={`flex items-center justify-center w-5 h-5 transition-colors duration-200
        ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}
      `}>
        {icon}
      </span>
      <span className={`text-sm font-medium transition-colors duration-200
        ${isActive ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"}
      `}>
        {title}
      </span>
    </div>
  );

  if (onClick) {
    return (
      <div className="mb-1" onClick={onClick}>
        {itemContent}
      </div>
    );
  }

  return (
    <Link href={href || '#'} className="mb-1 block">
      {itemContent}
    </Link>
  );
}

export default SidebarItem
