'use client'
import Link from 'next/link'
import React from 'react'
import {Search} from "lucide-react"
import ProfileIcon from '../../assets/svgs/profile-icon'
import HeartIcon from '../../assets/svgs/heart-icon'
import { CartBagIconComponent } from '../../assets/svgs/cart-icon';
import Headerbottom from './Header-bottom'
import useUser from '../../hooks/userUser'
import '../../styles/root.css';
const Header = () => {
    const {user,isLoading} = useUser();
  return (
    <div className ='w-full'>
    <div className='w-[80%] m-auto flex items-center justify-between py-4'>
    <div>
        <Link href={"/"}>
        <span className='text-2xl font-500 text-black'>Bingo</span>
        </Link>
    </div>
<div className='w-[50%] relative'>
    <input className='w-full font-Poppins font-medium border-[2.5px] outline-none h-[55px] px-4 border-black rounded' type="text" placeholder='Search For Products...' />
    <div className='w-[60px] cursor-pointer flex items-center justify-center h-[55px] absolute top-0 right-0 bg-black rounded'>
    <Search color='#fff'/>
    </div>
</div>
<div className='flex items-center gap-8'>
<div className='flex items-center gap-2'>
    {!isLoading && user ? (
        <>
        <Link href={"/profile"}
        className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-gray-300'
        >
            <ProfileIcon/>
</Link>
<Link href={"/login"} >
<span className='block font-medium text-gray-600'>Hello,</span>
<span className='font-semibold text-black'>{user?.name?.split(" ")[0]}</span>
</Link>
        </> 
    ) : (
        <>
        <Link href={"/login"}
    className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-gray-300'>
<ProfileIcon/>
</Link>
<Link href={"/login"} >
<span className='block font-medium text-gray-600'>Hello,</span>
<span className='font-semibold text-black'>{isLoading ? "..." : "Sign In"}</span>
</Link>
</>
    )}

</div>
<div className='flex items-center gap-5'>
<Link href={"/wishlist"} className='relative'>
<HeartIcon/>
<div className='w-6 h-6 border-2 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] border-white bg-black'>
<span className='text-white font-medium text-sm'>0</span>
</div>
</Link>
<Link href={"/cart"} className='relative'>
<CartBagIconComponent/>
<div className='w-6 h-6 border-2 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] border-white bg-black'>
<span className='text-white font-medium text-sm'>0</span>
</div>
</Link>
</div>
</div>
    </div>
    <div className='border-b border-gray-300'/>
    <Headerbottom/>
    </div>
    )
}

export default Header
