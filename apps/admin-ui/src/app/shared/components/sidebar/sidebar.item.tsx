import Link from 'next/link';
import React from 'react'
interface Props{
    title:string;
    icon: React.ReactNode;
    isActive?:boolean;
    href:string;
}

const SidebarItem = ({icon,title,isActive,href}:Props) => {
  return (
<Link href={href} className='my-2 block'>
  <div
    className={`flex items-center gap-3 w-full min-h-12 px-6   py-3 rounded-[var(--sidebar-radius)] cursor-pointer transition
      ${isActive
        ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] shadow-sm"
        : "hover:bg-[var(--sidebar-hover)] text-[var(--heading)]"}
    `}
    style={{
      marginBottom: 6,
      borderRadius: 'var(--sidebar-radius)',
    }}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}>
      {icon}
    </span>
    <h5 className={`text-lg font-semibold ${isActive ? "text-[var(--sidebar-active-text)]" : "text-[var(--heading)]"}`}>
      {title}
    </h5>
  </div>
</Link>
  )
}

export default SidebarItem
