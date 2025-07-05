import React from 'react'

const Page = () => {
  return (
    <div>
      <h1
        className="text-3xl font-extrabold mb-2"
        style={{ color: 'var(--heading)', letterSpacing: '-0.02em' }}
      >
        Dashboard
      </h1>
      <div
        className="mb-6"
        style={{
          height: 3,
          width: 48,
          background: 'var(--primary)',
          borderRadius: 2,
        }}
      />
      <p className="text-lg mb-8" style={{ color: 'var(--text)' }}>
        Welcome to your seller dashboard. Here you can manage your shop, view analytics, and more.
      </p>
      <div className="bg-[var(--background)] shadow rounded-xl p-6 border border-[var(--border)] mb-6">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--heading)' }}>
          Sales Overview
        </h2>
        <p className="text-sm" style={{ color: 'var(--text)' }}>
          Your sales performance for this month.
        </p>
        {/* ...chart or stats... */}
      </div>
    </div>
  )
}

export default Page
