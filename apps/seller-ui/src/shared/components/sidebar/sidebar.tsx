'use client';
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react'
import Box from '../box';
import { Sidebar } from './sidebar.styles';
import Link from 'next/link';
import Logo from 'apps/seller-ui/src/app/assets/svg/logo';
import SidebarItem from './sidebar.item';
import HomeIcon from 'apps/seller-ui/src/app/assets/icons/home';
import SidebarMenu from './sidebar.menu';
import { BellPlus, BellRing, CalendarPlus, ListOrdered, LogOut, Mail, PackageSearch, Settings, SquarePlus, TicketPercent } from 'lucide-react';
import PaymentIcon from 'apps/seller-ui/src/app/assets/icons/payment';

const SidebarBarWrapper = () => {
  const {activeSidebar,setActiveSidebar} = useSidebar();
const pathName = usePathname();
const {seller} = useSeller();

useEffect(()=>{
setActiveSidebar(pathName);
},[pathName,setActiveSidebar])

const getIconColor = (route:string) => activeSidebar === route ? "var(--background)" : "var(--disabled)"
  return (
    <Box css={{
      height: "100vh",
      zIndex: 202,
      position: "sticky",
      padding: "var(--sidebar-padding)",
      top: "0",
      overflowY: "scroll",
      scrollbarWidth: "none",
      background: 'var(--background)',
      borderRight: '1px solid var(--border)',
      borderRadius: 'var(--sidebar-radius)'
    }}
    className='sidebar-wrapper'
    >
      <Sidebar.Header style={{ paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
        <Box>
          <Link href={"/"} className='flex items-center gap-3 mb-2'>
            <Box style={{ width: 36, height: 36 }}>
              <Logo />
            </Box>
            <Box>
              <h3 className='text-xl font-bold pl-3' style={{ color: 'var(--heading)' }}>{seller?.shop?.name}</h3>
              <h5 className='font-medium text-xs pl-3' style={{ color: 'var(--text)' }}>
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className='block  h-full'>
        <Sidebar.Body className='body sidebar'>
          <SidebarItem
            title="Dashboard"
            icon={<HomeIcon fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href='/dashboard'
          />
          <div className=' block'>
          <SidebarMenu title='Main Menu'>
            <SidebarItem
            title="Orders"
            icon={<ListOrdered fill={getIconColor("/dashboard/orders")} />}
            isActive={activeSidebar === "/dashboard/orders"}
            href='/dashboard/orders'
          />
          <SidebarItem
            title="Payments"
            icon={<PaymentIcon fill={getIconColor("/dashboard/payments")} />}
            isActive={activeSidebar === "/dashboard/payments"}
            href='/dashboard/payments'
          />
            </SidebarMenu>
            <SidebarMenu title="Products">

            <SidebarItem
            isActive={activeSidebar === "/dashboard/create-product"}
            title="Create Product"
            href='/dashboard/create-product'
            icon={<SquarePlus size={24} color={getIconColor("/dashboard/create-product")} />}
          />

            <SidebarItem
            isActive={activeSidebar === "/dashboard/all-products"}
            title="All Products"
            href='/dashboard/all-products'
            icon={<PackageSearch size={22} color={getIconColor("/dashboard/all-products")} />}
          />
            </SidebarMenu>
            <SidebarMenu title='Events'>
            <SidebarItem
            isActive={activeSidebar === "/dashboard/create-event"}
            title="Create Event"
            href='/dashboard/create-event'
            icon={<CalendarPlus size={24} color={getIconColor("/dashboard/create-event")} />}
          />
          <SidebarItem
            isActive={activeSidebar === "/dashboard/all-events"}
            title="All Events"
            href='/dashboard/all-events'
            icon={<BellPlus size={24} color={getIconColor("/dashboard/all-events")} />}
          />
            </SidebarMenu>
            <SidebarMenu title='Management'>

        <SidebarItem
            isActive={activeSidebar === "/dashboard/notifications"}
            title="Notifications"
            href='/dashboard/notifications'
            icon={<BellRing size={24} color={getIconColor("/dashboard/notifications")} />}
          />
          
            <SidebarItem
            isActive={activeSidebar === "/dashboard/inbox"}
            title="Inbox"
            href='/dashboard/inbox'
            icon={<Mail size={20} color={getIconColor("/dashboard/inbox")} />}
          />
          
          <SidebarItem
            isActive={activeSidebar === "/dashboard/settings"}
            title="Settings"
            href='/dashboard/settings'
            icon={<Settings size={22} color={getIconColor("/dashboard/settings")} />}
          />
            </SidebarMenu>

            <SidebarMenu title='Extras'>

            <SidebarItem
            isActive={activeSidebar === "/dashboard/discount-codes"}
            title="Discount Codes"
            href='/dashboard/discount-codes'
            icon={<TicketPercent size={22} color={getIconColor("/dashboard/discount-codes")} />}
          />

          <SidebarItem
            isActive={activeSidebar === "/dashboard/logout"}
            title="Logout"
            href='/'
            icon={<LogOut size={20} color={getIconColor("/logout")} />}
          />
            </SidebarMenu>
          </div>
        </Sidebar.Body>

      </div>
    </Box>
  )
}

export default SidebarBarWrapper
