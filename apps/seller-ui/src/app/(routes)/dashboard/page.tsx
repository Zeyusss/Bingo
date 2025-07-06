'use client';

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
    </div>
  )
}

export default Page
