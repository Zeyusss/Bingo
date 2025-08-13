"use client";
import { useEffect, useState, useRef } from 'react';
import React from "react";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaTwitter } from 'react-icons/fa';
// import { HeartIcon } from '@heroicons/react/24/outline'; // Commented out - not used and missing dependency
import { FaPlay } from 'react-icons/fa';

type TeamMember = {
  id: number;
  name: string;
  role: string;
  photo: string;
  bio: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
};

const teamMembers: TeamMember[] = [
    {
    id: 1,
    name: "Zeyad Mohamed",
    role: "Front-end Developer",
    photo: "/assets/zeyad.jpg",
    bio: " 3+ years of experience in Web Development",
    facebook: "https://www.facebook.com/zeyad",
    linkedin: "https://www.linkedin.com/in/zeyad",
    instagram: "https://www.instagram.com/zeyad",
    twitter: "https://twitter.com/zeyad",
  },

  {
    id: 2,
    name: "Mostafa Amin",
    role: "Front-end Developer",
    photo: "/assets/zeyad.jpg",
    bio: "3+ years of experience in Web Development.",
    facebook: "https://www.facebook.com/zeyad",
    linkedin: "https://www.linkedin.com/in/zeyad",
    instagram: "https://www.instagram.com/zeyad",
    twitter: "https://twitter.com/zeyad",
  },
  {
    id: 3,
    name: "Sohila Abdelkhalik",
    role: "Front-end Developer",
    photo: "/assets/zeyad.jpg",
    bio: "3+ years of experience in Web Development.",
    facebook: "https://www.facebook.com/zeyad",
    linkedin: "https://www.linkedin.com/in/zeyad",
    instagram: "https://www.instagram.com/zeyad",
    twitter: "https://twitter.com/zeyad",
  },
  {
    id: 4,
    name: "Mahmoud Mohamed",
    role: "Flutter Developer",
    photo: "/assets/zeyad.jpg",
    bio: "3+ years of experience in Mobile Development.",
    facebook: "https://www.facebook.com/zeyad",
    linkedin: "https://www.linkedin.com/in/zeyad",
    instagram: "https://www.instagram.com/zeyad",
    twitter: "https://twitter.com/zeyad",
  },
  {
    id: 5,
    name: "Alshimaa Salah",
    role: "Flutter Developer",
    photo: "/assets/zeyad.jpg",
    bio: "3+ years of experience in Mobile Development.",
    facebook: "https://www.facebook.com/zeyad",
    linkedin: "https://www.linkedin.com/in/zeyad",
    instagram: "https://www.instagram.com/zeyad",
    twitter: "https://twitter.com/zeyad",
  },
];

const About: React.FC = () => {
  const target = 2025;
  const target2 = 2000;
  const target3 = 190;
  const target4 = 1;
  const target5 = 21;
  const target6 = 750;

  const [count, setCount] = useState<number>(0);
  const [count2, setCount2] = useState<number>(0);
  const [count3, setCount3] = useState<number>(0);
  const [count4, setCount4] = useState<number>(0);
  const [count5, setCount5] = useState<number>(0);
  const [count6, setCount6] = useState<number>(0);
  const [started, setStarted] = useState(false);
   const [showVideo, setShowVideo] = useState(false);
    const scrollYRef = useRef(0);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleScroll() {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;


      if (rect.top <= windowHeight * 0.75) {
        setStarted(true);
      }
    }

    window.addEventListener("scroll", handleScroll);


    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (count < target && started) {
      const timer = setTimeout(() => {
        setCount(count + 5);
      }, 0.5);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [count, target, started]);

  useEffect(() => {
    if (count2 < target2 && started) {
      const timer = setTimeout(() => {
        setCount2(count2 + 5);
      }, .5);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [count2, target2, started]);

  useEffect(() => {
    if (count3 < target3 && started) {
      const timer = setTimeout(() => {
        setCount3(count3 + 1);
      }, 5);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [count3, target3, started]);

  useEffect(() => {
    if (count4 < target4 && started) {
      const timer = setTimeout(() => {
        setCount4(count4 + 1);
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [count4, target4, started]);

  useEffect(() => {
    if (count5 < target5 && started) {
      const timer = setTimeout(() => {
        setCount5(count5 + 1);
      }, 140);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [count5, target5, started]);

  useEffect(() => {
    if (count6 < target6 && started) {
      const timer = setTimeout(() => {
        setCount6(count6 + 4);
      }, 1);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [count6, target6, started]);


   
  
    useEffect(() => {
      if (!showVideo) return;
  
    
      scrollYRef.current = window.scrollY;
  
      const { style } = document.body;
      const prev = {
        overflow: style.overflow,
        position: style.position,
        top: style.top,
        width: style.width,
      };
  
      style.overflow = "hidden";
      style.position = "fixed";
      style.top = `-${scrollYRef.current}px`;
      style.width = "100%";
  
      return () => {
        
        style.overflow = prev.overflow;
        style.position = prev.position;
        style.top = prev.top;
        style.width = prev.width;
        window.scrollTo(0, scrollYRef.current);
      };
    }, [showVideo]);

  return (

    <div className="min-h-screen    ">
      {/* <div className="  w-[100%]"> */}
      

        <section className="mb-20 text-gray-700 text-lg w-[100%] ">

<div className="bg-[url('/assets/w-our-team-top-opt.jpg')] bg-cover bg-center w-[100%] h-96 rounded-lg shadow-lg mb-8 flex flex-col items-start justify-center gap-10">
  <h1 className="text-[80px] text-white font-bold drop-shadow-lg ml-20">About Us</h1> 
 <div> <p className="text-gray-400 ml-20 ">Home<span className="text-white">/About Us</span></p></div>
</div>

        </section>
        <section className="w-full mx-auto flex flex-col md:flex-row justify-evenly gap-6 md:gap-2 px-4">
          <div className='flex flex-row gap-5'>
           <img
  src="/assets/il_500x500.3503205565_cn8f.webp"
  alt="About Us"
  className="w-[45%] object-cover rounded-lg"
/>
             <img
  src="/assets/OIP (1).webp"
  alt="About Us"
  className="w-[45%] object-cover rounded-lg"
/>
          </div>
          <div className="flex flex-col mr-3 w-[50%] ">
            <p className="text-gray-500  mt-6 mb-4 font-semibold">SEEMINGLY ELEGANT DESIGN</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About our online store</h1>
            <p className="text-gray-500 mb-4 italic">Risus suspendisse a orci penatibus a felis suscipit consectetur
              <br /> vestibulum sodales dui cum ultricies lacus interdum.</p>
            <p className="text-gray-600 mb-4 text-[16px]">One morning, when Gregor Samsa woke from troubled dreams,he
              <br /> found himself transformed in his bed into a horrible vermin.He lay on
              <br /> his armour-like back, and if he lifted his head a little he could see his
              <br /> brown belly, slightly domed and divided by arches into stiff.
            </p>
            <p className="text-gray-600 mb-4 text-[16px]">Dictumst per ante cras suscipit nascetur ullamcorper in nullam  <br />fermentum condimentum torquent iaculis reden posuere potenti <br /> viverra condimentum dictumst id tellus suspendisse <br />
              convallis condimentum.

            </p>
            <hr className="border-gray-300 w-[90%]" />
            <div className="flex flex-row justify-between mt-4 w-[90%]">
              <p className="italic">Developed by <strong className="text-red-400">B</strong>ingo @ 2025.</p>
              <div className="flex flex-row gap-1">
                <a
                  href="https://www.facebook.com/yourpage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-700 transition w-6 h-6 rounded border flex items-center justify-center bg-gray-200"
                  aria-label="Facebook"
                >
                  <FaFacebookF size={15} />
                </a>

                <a
                  href="https://www.linkedin.com/in/yourprofile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-700 transition w-6 h-6 rounded border flex items-center justify-center bg-gray-200"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn size={15} />
                </a>



                <a
                  href="https://twitter.com/yourprofile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-700 transition w-6 h-6 rounded border flex items-center justify-center bg-gray-200"
                  aria-label="X Twitter"
                >
                  <FaTwitter size={15} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="  mt-20 w-[90%] mx-auto">
          
          <h2 className="text-4xl font-semibold text-gray-700 mb-8 text-center"> <strong className="text-red-500">O</strong>ur Team</h2>
          <p className="text-center  italic mb-6">Explore product collections from our vendors</p>
          <div className="flex flex-wrap justify-center gap-20 ">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="w-[300px] h-[400px] bg-gray-100 rounded-lg shadow-md p-6 flex flex-col items-center relative group cursor-default transition-transform hover:-translate-y-2 hover:shadow-lg"
              >
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-[200px] h-[300px] border-4 border-gray-400 mb-4 object-cover rounded"
                />
                <h3 className="text-lg font-semibold text-gray-900 text-center">{member.name}</h3>
                <p className="text-gray-600 text-sm text-center">{member.role}</p>
                <p className="text-gray-500 text-xs text-center">{member.bio}</p>


                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity rounded-lg p-4 pointer-events-none group-hover:pointer-events-auto">
                  {member.facebook && (
                    <a
                      href={member.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 hover:text-blue-600 transition"
                      aria-label="Facebook"
                    >
                      <FaFacebookF size={28} />
                    </a>
                  )}

                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 hover:text-blue-700 transition"
                      aria-label="LinkedIn"
                    >
                      <FaLinkedinIn size={28} />
                    </a>
                  )}

                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 hover:text-pink-500 transition"
                      aria-label="Instagram"
                    >
                      <FaInstagram size={28} />
                    </a>
                  )}

                  {member.twitter && (
                    <a
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 hover:text-sky-500 transition"
                      aria-label="Twitter"
                    >
                      <FaTwitter size={28} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

        </section>

<section className="flex flex-col md:flex-row items-center justify-center gap-10 px-8 py-10  w-[100%] mx-auto min-h-screen">
   <div className="relative overflow-hidden rounded-[40px] w-full md:w-1/2">
    <img
      src="/assets/whychoosehandmade/choosing-video.webp"
      alt="Video Preview"
      width={1200}
      height={675}
      className="w-full h-auto object-cover rounded-[40px]"
    />
    <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white text-center px-4 rounded-[40px]">
      <h3 className="text-3xl font-bold mb-4">
        How we start our business
      </h3>
      <button
        onClick={() => setShowVideo(true)}
        className="p-4 bg-white rounded-full shadow text-black hover:scale-110 transition"
      >
        <FaPlay className="w-8 h-8" />
      </button>
    </div>
  </div>



<div className="md:w-1/2">
    <h1 className="text-4xl font-semibold text-black mb-4 pb-2  ml-14">
      Why choose handmade
    </h1>
    <ul className=" pl-6 space-y-2 text-gray-900">
      <li className="ml-8">- Unique, limited pieces that stand out from mass production.</li>
      <li className="ml-8">- Superior materials and careful construction for long-lasting use.</li>
      <li className="ml-8">- Ethical and often local production that supports small makers.</li>
      <li className="ml-8">- Designs that blend form and function — crafted for comfort and beauty.</li>
    </ul>
  </div>

</section>






    
        <section className="flex flex-row justify-between">
          <div className="relative w-full ">
            <img
              src="/assets/w-about-us1-infobox-bg-opt.jpg"
              alt="About Us"
              className="w-full h-[600px] flex flex-row justify-between "
            />
            <div className="absolute  top-20 left-20 pt-14 ">
              <p className="text-gray-300 text-lg font-semibold mb-6 italic">
                DEVELOPED BY <strong className="text-red-400">B</strong>INGO @ 2025.
              </p>
              <h1 className="text-gray-300 text-4xl font-bold mb-6 mt-7 leading-relaxed">We work through every <br/> aspect at the planning</h1>
              <p className="text-gray-300 text-lg italic flex items-center gap-1">
  We do it for you with love ❤️
</p>
            </div>
            <div className="absolute top-20 right-6 grid grid-cols-2  p-8 ">
              <div className="text-gray-300 border-r  border-gray-200  border-b text-center text-2xl p-8" ref={sectionRef}>
                <h1 className="text-center">{count}</h1>
                <p>FOUNDING YEAR</p>
              </div>
              <div className="text-gray-300  border-gray-200  border-b text-center text-2xl p-8" ref={sectionRef}>
                <h1 className="text-center">{count2}</h1>
                <p>HAPPY COSTUMERS</p>
              </div>
              <div className="text-gray-300 border-r  border-gray-200  border-b text-center text-2xl p-8" ref={sectionRef} >
                <h1 className="text-center">{count3}</h1>
                <p>COMPANY WORK WITH US</p>
              </div>
              <div className="text-gray-300   border-gray-200  border-b text-center text-2xl p-8" ref={sectionRef}>
                <h1 className="text-center">{count4}</h1>
                <p>OFFICES</p>
              </div>
              <div className="text-gray-300 border-r border-gray-200  text-center text-2xl p-8" ref={sectionRef}>
                <h1 className="text-center">{count5}</h1>
                <p>TEAM MEMBERS</p>
              </div>
              <div className="text-gray-300  border-gray-200  text-center text-2xl p-8" ref={sectionRef}>
                <h1 className="text-center">{count6}</h1>
                <p>PROJECTS COMPLETED</p>
              </div>
            </div>
          </div>
        </section>


        <section>
          <div className="w-full min-h-screen flex items-center   text-gray-800 dark:bg-gray-50 dark:text-black ">
            <div className="max-w-full py-5 mt-10 mb-20 mx-auto overflow-hidden">
              {/* <div className="w-full flex items-center flex-col gap-1 justify-center mb-16 px-4">
                <p className="text-sm sm:text-lg font-semibold text-rose-600">Words That Matter</p>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center font-semibold">See Why Clients Keep Coming
                  Back</h3>
              </div> */}
              <div className="flex flex-col gap-3">
                
                <div style={{ maskImage: "linear-gradient(to left, transparent 0%, black 20%, black 80%, transparent 95%)" }}>
                  <div className="relative flex justify-around gap-5 overflow-hidden shrink-0">
                    <div className="max-w-full mx-auto">
                      <div className="px-4 md:px-10 mx-auto w-full">
                        <div
                          className="animate-scrollReverse flex flex-nowrap w-max min-w-full hover:[animation-play-state:paused] overflow-hidden relative gap-5 justify-around shrink-0">
                        
                          <div
                           className="flex flex-col justify-between h-[220px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[400px] sm:w-[320px] w-[240px] bg-gray-100 rounded-lg shadow-md">

  <a
  className="px-5 py-5 tracking-tight text-lg md:text-[80px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=vitra"
>
  VITRA
</a>
<p className='text-center tracking-[8px] italic mb-[20px] '>Vitra</p>
 <div className="flex overflow-hidden h-[30%] md:h-[28%] gap-1 w-full border-t-[1.2px] dark:border-fuchsia-400 dark:border-black/40">

   <div className="flex items-center w-3/4 gap-3 px-4 py-3">
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-furniture1.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-furniture2.jpg.webp" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/stacking-chair-image3.jpg.webp" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-furniture-8-430x490.jpg.webp" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-furniture-4-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-accessories-11-430x492.jpg.webp" alt="avatar" />
</div>
                             <div className="w-[1px] bg-gray-900 dark:bg-black/50"></div>
                              <div className="flex items-center justify-center max-w-full mx-auto">
                                <a target="_blank" href="https://x.com/i/flow/login?redirect_after_login=xtemos_studio" className='text-black'>
                                  <svg width="30" stroke="currentColor" fill="currentColor" strokeWidth="0"
                                    viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full">
                                    <path
                                      d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z">
                                    </path>
                                  </svg></a>
                              </div>
                            </div>
                          </div>

                          <div
                           className="flex flex-col justify-between h-[220px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[400px] sm:w-[320px] w-[240px] bg-gray-100 rounded-lg shadow-md">
     <a
  className="px-5 py-5 tracking-tight text-lg md:text-[60px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=rosenthal"
>
  ROSENTHAL
</a>
<p className='text-center tracking-[8px] italic mb-[20px] '>Rosenthal</p>
                            <div
                            className="flex overflow-hidden h-[30%] md:h-[28%] gap-1 w-full border-t-[1.2px] dark:border-fuchsia-400 dark:border-black/40">
                              <div className="flex items-center w-3/4 gap-3 px-4 py-3">
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-furniture-17.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/furniture(14-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-light-(13)-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-furniture-(12)-430x490.jpg.webp" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/cooking12-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-accessories-(11)-430x492.jpg.webp" alt="avatar" />
</div>
                              <div className="w-[1px] bg-gray-900 dark:bg-black/50"></div>
                              <div className="flex items-center justify-center max-w-full mx-auto">
                                <a target="_blank" href="https://x.com/i/flow/login?redirect_after_login=xtemos_studio">
                                  <svg width="30" stroke="currentColor" fill="currentColor" strokeWidth="0"
                                    viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full">
                                    <path
                                      d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z">
                                    </path>
                                  </svg></a>
                              </div>
                            </div>
                          </div>

                          <div
                            className="flex flex-col justify-between h-[220px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[400px] sm:w-[320px] w-[240px] bg-gray-100 rounded-lg shadow-md">
                                                                          <a
  className="px-5 py-5 tracking-tight text-lg md:text-[80px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=packit"
>
 PACKIT
</a>
<p className='text-center tracking-[8px] italic mb-[20px] '>packit</p>
                            <div className="flex overflow-hidden h-[30%] md:h-[28%] gap-1 w-full border-t-[1.2px] dark:border-fuchsia-400 dark:border-black/40">
    <div className="flex items-center w-3/4 gap-3 px-4 py-3">
  <img className="w-10 h-10 rounded border border-gray" src="/assets/furniture(25).jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/furniture(24)-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/light10_1-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/furniture(22)-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-light-(21)-2-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-furniture-(20).jpg.webp" alt="avatar" />
</div>
                              <div className="w-[1px] bg-gray-900 dark:bg-black/50"></div>
                              <div className="flex items-center justify-center max-w-full mx-auto">
                                <a target="_blank" href="https://x.com/i/flow/login?redirect_after_login=xtemos_studio">
                                  <svg width="30" stroke="currentColor" fill="currentColor" strokeWidth="0"
                                    viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full">
                                    <path
                                      d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z">
                                    </path>
                                  </svg></a>
                              </div>
                            </div>
                          </div>

                          <div
                            className="flex flex-col justify-between h-[220px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[400px] sm:w-[320px] w-[240px] bg-gray-100 rounded-lg shadow-md">
      <a
  className="px-5 py-5 tracking-tight text-lg md:text-[80px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=niche"
>
  NICHE
</a>
<p className='text-center tracking-[8px] italic mb-[20px] '>Niche</p>
                           <div className="flex overflow-hidden h-[30%] md:h-[28%] gap-1 w-full border-t-[1.2px] dark:border-fuchsia-400 dark:border-black/40">
                              <div className="flex items-center w-3/4 gap-3 px-4 py-3">
  <img className="w-10 h-10 rounded border border-gray" src="/assets/prod-lamp-3-4-2.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/prod-lamp-2-1-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/prod-lamp-2-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/prod-lamp-4-1-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/prod-lamp-3-1-2-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/light8_2-opt-430x491.jpg.webp" alt="avatar" />
</div>
                           <div className="w-[1px] bg-gray-900 dark:bg-black/50"></div>
                              <div className="flex items-center justify-center max-w-full mx-auto">
                                <a target="_blank" href="https://x.com/i/flow/login?redirect_after_login=xtemos_studio">
                                  <svg width="30" stroke="currentColor" fill="currentColor" strokeWidth="0"
                                    viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full">
                                    <path
                                      d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z">
                                    </path>
                                  </svg></a>
                              </div>
                            </div>
                          </div>


                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{ maskImage: "linear-gradient(to left, transparent 0%, black 20%, black 80%, transparent 95%)", marginTop: "20px" }}
                    className="relative flex justify-around gap-5 overflow-hidden shrink-0">
                    <div className="max-w-full mx-auto">
                      <div className="px-4 md:px-10 mx-auto w-full">
                        <div
                          className="animate-scroll flex flex-nowrap w-max min-w-full hover:[animation-play-state:paused] overflow-hidden relative gap-5 justify-around shrink-0">

                           <div
                            className="flex flex-col justify-between h-[220px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[400px] sm:w-[320px] w-[240px] bg-gray-100 rounded-lg shadow-md">
                                                                            <a
  className="px-5 py-5 tracking-tight text-lg md:text-[80px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=joseph-joseph"
>
  JOSEPH 
</a>
<p className='text-center tracking-[8px] italic mb-[20px] '>Joseph</p>
                           <div className="flex overflow-hidden h-[30%] md:h-[28%] gap-1 w-full border-t-[1.2px] dark:border-fuchsia-400 dark:border-black/40">
                                                                                                             <div className="flex items-center w-3/4 gap-3 px-4 py-3">
  <img className="w-10 h-10 rounded border border-gray" src="/assets/toys4_2-430x490.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/toys1.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/toys10-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-furniture-977777-2-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/fproduct-furniture-3999999-2-430x490.jpg.webp" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/furniture888888888-430x491.jpg" alt="avatar" />
</div>
                            <div className="w-[1px] bg-gray-900 dark:bg-black/50"></div>
                              <div className="flex items-center justify-center max-w-full mx-auto">
                                <a target="_blank" href="https://x.com/i/flow/login?redirect_after_login=xtemos_studio">
                                  <svg width="30" stroke="currentColor" fill="currentColor" strokeWidth="0"
                                    viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full">
                                    <path
                                      d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z">
                                    </path>
                                  </svg></a>
                              </div>
                            </div>
                          </div>
                          
                           <div
                            className="flex flex-col justify-between h-[220px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[400px] sm:w-[320px] w-[240px] bg-gray-100 rounded-lg shadow-md">
    <a
  className="px-5 py-5 tracking-tight text-lg md:text-[65px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=magisso"
>
  MAGISSO
</a>
<p className='text-center tracking-[8px] italic mb-[20px] '>Magisso</p>
                            <div className="flex overflow-hidden h-[30%] md:h-[28%] gap-1 w-full border-t-[1.2px] dark:border-fuchsia-400 dark:border-black/40">
                                                       <div className="flex items-center w-3/4 gap-3 px-4 py-3">
  <img className="w-10 h-10 rounded border border-gray" src="/assets/accessories1.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/light4..jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product_cooking4-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/furniture99_4-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/furniture555-700x800.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product_cooking1-430x491.jpg" alt="avatar" />
</div>
                              <div className="w-[1px] bg-gray-900 dark:bg-black/50"></div>
                              <div className="flex items-center justify-center max-w-full mx-auto">
                                <a target="_blank" href="https://x.com/i/flow/login?redirect_after_login=xtemos_studio">
                                  <svg width="30" stroke="currentColor" fill="currentColor" strokeWidth="0"
                                    viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full">
                                    <path
                                      d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z">
                                    </path>
                                  </svg></a>
                              </div>
                            </div>
                          </div>

                    <div
                            className="flex flex-col justify-between h-[220px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[400px] sm:w-[320px] w-[240px] bg-gray-100 rounded-lg shadow-md">
                                                 <a
  className="px-5 py-5 tracking-tight text-lg md:text-[80px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=louis-poulsen"
>
  LOUIS 
</a>
<p className='text-center tracking-[8px] italic mb-[20px] '>louis-Poulsen</p>
                            <div className="flex overflow-hidden h-[30%] md:h-[28%] gap-1 w-full border-t-[1.2px] dark:border-fuchsia-400 dark:border-black/40">
                                                                                   <div className="flex items-center w-3/4 gap-3 px-4 py-3">
  <img className="w-10 h-10 rounded border border-gray" src="/assets/cooking11666-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/cooking9000-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/clocks9_3-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/clocks7.jpg.webp" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/furniture544_6-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/cooking74_2-430x491.jpg" alt="avatar" />
</div>
                              <div className="w-[1px] bg-gray-900 dark:bg-black/50"></div>
                              <div className="flex items-center justify-center max-w-full mx-auto">
                                <a target="_blank" href="https://x.com/i/flow/login?redirect_after_login=xtemos_studio">
                                  <svg width="30" stroke="currentColor" fill="currentColor" strokeWidth="0"
                                    viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full">
                                    <path
                                      d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z">
                                    </path>
                                  </svg></a>
                              </div>
                            </div>
                          </div>

       
                     <div
                           className="flex flex-col justify-between h-[220px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[400px] sm:w-[320px] w-[240px] bg-gray-100 rounded-lg shadow-md">
                                                 <a
  className="px-5 py-5 tracking-tight text-lg md:text-[80px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=klober"
>
  KLÖBER
</a>
<p className='text-center tracking-[8px] italic mb-[20px] '>Klöber</p>
      <div className="flex overflow-hidden h-[30%] md:h-[28%] gap-1 w-full border-t-[1.2px] dark:border-fuchsia-400 dark:border-black/40">
      <div className="flex items-center w-3/4 gap-3 px-4 py-3">
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-accessories-1000-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/cooking11666-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/cooking9000-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-furniture-4-200-430x491.jpg" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-accessories-8999-430x491.jpg.webp" alt="avatar" />
  <img className="w-10 h-10 rounded border border-gray" src="/assets/product-accessories-0000.jpg" alt="avatar" />
</div>
                             <div className="w-[1px] bg-gray-900 dark:bg-black/50"></div>
                              <div className="flex items-center justify-center max-w-full mx-auto">
                                <a target="_blank" href="https://x.com/i/flow/login?redirect_after_login=xtemos_studio">
                                  <svg width="30" stroke="currentColor" fill="currentColor" strokeWidth="0"
                                    viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full">
                                    <path
                                      d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z">
                                    </path>
                                  </svg></a>
                              </div>
                            </div>
                          </div>

                
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>



          </div>

        </section>



      </div>





    // </div>

  );
}

export default About;