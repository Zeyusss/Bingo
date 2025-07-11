'use client';
import { AlignLeft, ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { navItems } from '../../configs/constants';
import Link from 'next/link';
import ProfileIcon from '../../assets/svgs/profile-icon';
import HeartIcon from '../../assets/svgs/heart-icon';
import { CartBagIconComponent } from '../../assets/svgs/cart-icon';
import useUser from '../../hooks/userUser';

const Headerbottom = () => {
    const [show,setShow] = useState(false)
    const [isSticky,setIsSticky] = useState(false)
    const {user,isLoading} = useUser();



useEffect(()=>{
const handleScroll = ()=>{
    if(window.scrollY > 100){
        setIsSticky(true)
    }else{
        setIsSticky(false)
    }
}
window.addEventListener("scroll",handleScroll)
return()=> window.removeEventListener("scroll",handleScroll)
},[])
    return (
    <div className={`w-full transition-all duration-300 ${isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"}`}>
    <div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? "pt-3" : "py-0"}`}>
{/* {All DropDowns} */}
<div className={`w-[260px] ${isSticky && '-mb-2'} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-black `}
onClick={()=> setShow(!show)}
>
<div className='flex items-center gap-2'>
<AlignLeft color='white'/>
<span className='text-white font-medium'>All Categories</span>
</div>
<ChevronDown color='white'/>
</div>
{/* {Drop Down Menu} */}
{show && (
    <div className={`absolute left-0 ${isSticky ? "top-[70px]" : "top-[50px]"} w-[260px] h-[400px] bg-black`}>

    </div>
)}
{/* {Nav Links} */}
<div className='flex items-center'>
{navItems.map((i:NavItemsTypes,index:number)=>(
    <Link className='px-5 font-medium text-lg text-black' href={i.href} key={index}>
{i.title}
    </Link>
)
    )}
</div>
<div>
    {isSticky && (
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
    )}
</div>
    </div>
    </div>
    )
}

export default Headerbottom
