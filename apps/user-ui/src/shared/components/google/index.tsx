import React from 'react'

const GoogleButton = () => {
  return (
    <div className='w-full flex justify-center'>
        <div className='h-[46px] cursor-pointer border border-blue-100 flex items-center gap-2 px-3 rounded-[4px] my-2 bg-[rgba(210,227,252,0.3)]'>
 <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 533.5 544.3"
    width={24}
    height={24}
  >
    <path
      fill="#4285f4"
      d="M533.5 278.4c0-17.4-1.4-34-4.1-50.2H272v95.1h146.9c-6.3 34.2-25 63.2-53.2 82.6v68h85.9c50.3-46.4 81.9-114.8 81.9-195.5z"
    />
    <path
      fill="#34a853"
      d="M272 544.3c72.6 0 133.6-24 178.1-65.2l-85.9-68c-23.9 16.1-54.5 25.7-92.2 25.7-70.9 0-131-47.9-152.4-112.2h-90.4v70.5C103.8 482 181.2 544.3 272 544.3z"
    />
    <path
      fill="#fbbc04"
      d="M119.6 324.6c-10.5-30.7-10.5-63.8 0-94.5V159.6H29.2c-30.9 61.7-30.9 134.5 0 196.2l90.4-70.5z"
    />
    <path
      fill="#ea4335"
      d="M272 107.7c39.4-.6 77.2 14.4 106 42.4l79.1-79.1C410.7 24.6 343.5-1.4 272 0 181.2 0 103.8 62.3 58.8 159.6l90.4 70.5c21.3-64.3 81.5-112.2 152.8-112.4z"
    />
  </svg>
  <span className='text-[16px] opacity-[.8] font-Poppins'>
Sign In With Google
  </span>
        </div>
    </div>
  )
}

export default GoogleButton
