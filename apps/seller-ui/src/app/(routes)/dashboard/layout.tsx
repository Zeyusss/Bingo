import SidebarBarWrapper from 'apps/seller-ui/src/shared/components/sidebar/sidebar'
import React from 'react'

const Layout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className='flex h-full min-h-screen' style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside
        className='w-[280px] min-w-[250px] max-w-[300px]'
        style={{
          borderRight: '1px solid var(--border)',
          background: 'var(--background)',
          padding: 'var(--sidebar-padding)',
          boxShadow: '2px 0 8px 0 rgba(175,18,57,0.04)',
          zIndex: 10,
        }}
      >
        <div className='sticky top-0'>
          <SidebarBarWrapper />
        </div>
      </aside>
      <main className='flex-1'>
        <div
          className='overflow-auto'
          style={{
            padding: 'var(--content-padding)',
            background: 'rgba(175,18,57,0.02)',
            minHeight: '100vh',
            borderRadius: '1.25rem 0 0 1.25rem',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
