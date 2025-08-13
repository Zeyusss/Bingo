"use client";
import React from 'react'
import { useEffect,  useRef,useState } from 'react';
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaTwitter } from 'react-icons/fa';
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


export default function page() {
   const [showVideo, setShowVideo] = useState(false);
      const scrollYRef = useRef(0);

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


<div>
 <section className="relative w-full h-[400px]">
  <img
    src="./assets/w-our-team-top-opt.jpg"
    alt="Our Team"
    className="w-full h-full object-cover"
  />
  <h1 className="absolute top-[100px] left-[60px] text-white text-2xl md:text-4xl font-semibold px-4 leading-snug">
    There are no <span className='text-red-400'>secrets to success</span>. It is the <br />
    result of preparation, hard work, and <br />
    learning from failure.
  </h1>
</section>

 <section className="w-full mx-auto flex flex-col md:flex-row justify-evenly gap-6 md:gap-2 px-4 mt-16 w-[80%]">
          <div className='flex flex-row gap-5'>
           <img
  src="/assets/w-our-team-img-2-opt-1.jpg.webp"
  alt="About Us"
  className="w-[50%] object-cover rounded-lg"
/>
             <img
  src="/assets/w-our-team-img-1-opt-1.jpg.webp"
  alt="About Us"
  className="w-[50%] object-cover rounded-lg"
/>
          </div>
          <div className="flex flex-col mr-3  ">
            <p className="text-red-400  mt-6 mb-4 font-semibold">
SEEMINGLY ELEGANT DESIGN</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">We love what we do</h1>
            <p className="text-gray-500 mb-4 italic">Authorities in our business will tell in no uncertain terms that Lorem
              <br /> Ipsum is that huge, huge no no to forswear forever. Not so fast, I’d say,<br />
              there are some redeeming factors in favor of greeking text.</p>
            <p className="text-gray-600 mb-4 text-[16px]">You begin with a text, you sculpt information, you chisel away what’s
              <br /> not needed, you come to the point, make things clear, add value, you’re a
              <br /> content person, you like words.
              
            </p>
            <p className="text-gray-600 mb-4 text-[16px]">A seemingly elegant design can quickly begin to bloat with <br />unexpected content or break under the weight of actual activity.
              convallis condimentum.

            </p>
          

                
            



              
            
          </div>
        </section>

        <section className='mt-16 w-[80%] mx-auto'>
          <h4 className='text-red-400 text-center'>DEPENDING ON THE STATE</h4>
          <div className="flex items-center ">
  <hr className="flex-grow border-t border-gray-300" />
  <h1 className="mx-4 text-[40px] font-semibold text-gray-700">
    Professionals only
  </h1>
  <hr className="flex-grow border-t border-gray-300" />
</div>
<p className='text-center text-gray-420'> Convallis ullamcorper aliquet ultrices orci cum vestibulum lobortis erat.</p>
  <div className="flex flex-wrap justify-center gap-20  mt-12">
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
              src="/assets/w-our-team-video-bg-opt.jpg.webp"
              alt="Video Preview"
              width={1200}
              height={675}
              className="w-full h-auto object-cover rounded-[40px]"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white text-center px-4 rounded-[40px]">
              {/* <h3 className="text-3xl font-bold mb-4">
                How we start our business
              </h3> */}
              <button
                onClick={() => setShowVideo(true)}
                className="p-4 bg-white rounded-full shadow text-black hover:scale-110 transition"
              >
                <FaPlay className="w-8 h-8" />
              </button>
            </div>
          </div>
        
        
        
        <div className="md:w-1/2">
            <p className="text-red-400">
             DESIGN DIRECTION THEY REQUIRE
            </p>
            <h1 className='text-black text-[32px]'>Our working progress</h1>
            <p className='text-gray-500 text-[16px] mt-4 mb-4'>
              Commercial publishing platforms and content management systems ensure <br /> that you can show different text, different data using the same template. <br /> When it's about controlling hundreds of articles, product pages.
            </p>

             <div className="flex flex-col md:flex-row gap-2">
 
  <div className="flex flex-row gap-6 items-start">
   <img
  src="/assets/w-our-team-presentation.svg"
  alt="Presentation"
  className="w-12 h-12 object-contain"
  style={{ filter:  'invert(67%) sepia(67%) saturate(550%) hue-rotate(314deg) brightness(90%) contrast(97%)' }}
/>
    <div className="flex flex-col">
      <h1 className="text-black text-[24px] font-semibold leading-tight">
        Multiple variations
      </h1>
      <p className="text-gray-500 text-[16px] mt-2">
        Hierarchies of information, weight, emphasis.
      </p>
    </div>
  </div>

 
  <div className="flex flex-row gap-6 items-start">
  <img
  src="/assets/w-our-team-rocket.svg"
  alt="Rocket"
  className="w-12 h-12 object-contain"
  style={{
    filter: 'invert(67%) sepia(67%) saturate(592%) hue-rotate(314deg) brightness(90%) contrast(97%)'
  }}
/>
    <div className="flex flex-col">
      <h1 className="text-black text-[24px] font-semibold leading-tight">
        Experienced team
      </h1>
      <p className="text-gray-400 text-[16px] mt-2">
       Subtle cues that also have visual and emotional.
      </p>
    </div>
  </div>
</div>
</div>
 </section>


 <section className='mt-[-200px]'>
          <div className="w-full min-h-screen flex items-center  text-gray-800 dark:bg-gray-50 dark:text-black ">
            <div className="max-w-full py-5 mt-10 mb-20 mx-auto overflow-hidden">
            
              <div className="flex flex-col gap-3">
                
                <div style={{ maskImage: "linear-gradient(to left, transparent 0%, black 20%, black 80%, transparent 95%)" }}>
                  <div className="relative flex justify-around gap-5 overflow-hidden shrink-0">
                    <div className="max-w-full mx-auto">
                      <div className="px-4 md:px-10 mx-auto w-full">
                        <div
                          className="animate-scrollReverse flex flex-nowrap w-max min-w-full hover:[animation-play-state:paused] overflow-hidden relative gap-5 justify-around shrink-0">

                          <div
                           className="flex flex-col justify-between h-[160px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[200px] sm:w-[220px] w-[140px] bg-gray-100 rounded-lg shadow-md">

  <a
  className="px-5 py-5 tracking-tight text-lg md:text-[40px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=vitra"
>
  VITRA
</a>
<p className='text-center tracking-[8px] italic mb-[40px] '>Vitra</p>

                          </div>

                          <div
                           className="flex flex-col justify-between h-[160px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[200px] sm:w-[220px] w-[140px] bg-gray-100 rounded-lg shadow-md">
     <a
  className="px-5 py-5 tracking-tight text-lg md:text-[30px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=rosenthal"
>
  ROSENTHAL
</a>
<p className='text-center tracking-[8px] italic mb-[30px] '>Rosenthal</p>
                        
                          </div>

                          <div
                            className="flex flex-col justify-between h-[160px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[200px] sm:w-[220px] w-[140px] bg-gray-100 rounded-lg shadow-md">
                                                                          <a
  className="px-5 py-5 tracking-tight text-lg md:text-[40px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=packit"
>
 PACKIT
</a>
<p className='text-center tracking-[8px] italic mb-[30px] '>packit</p>
                         
                          </div>

                          <div
                            className="flex flex-col justify-between h-[160px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[200px] sm:w-[220px] w-[140px] bg-gray-100 rounded-lg shadow-md">
      <a
  className="px-5 py-5 tracking-tight text-lg md:text-[40px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=niche"
>
  NICHE
</a>
<p className='text-center tracking-[8px] italic mb-[30px] '>Niche</p>
                          
                          </div>
                          
                           <div
                            className="flex flex-col justify-between h-[160px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[200px] sm:w-[220px] w-[140px] bg-gray-100 rounded-lg shadow-md">
                     <a
  className="px-5 py-5 tracking-tight text-lg md:text-[40px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=joseph-joseph"
>
  JOSEPH 
</a>
<p className='text-center tracking-[8px] italic mb-[30px] '>Joseph</p>
   
                          </div>
                          
                           <div
                            className="flex flex-col justify-between h-[160px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[200px] sm:w-[220px] w-[140px] bg-gray-100 rounded-lg shadow-md">
    <a
  className="px-5 py-5 tracking-tight text-lg md:text-[30px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=magisso"
>
  MAGISSO
</a>
<p className='text-center tracking-[8px] italic mb-[30px] '>Magisso</p>
    
                          </div>

                    <div
                            className="flex flex-col justify-between h-[160px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[200px] sm:w-[220px] w-[140px] bg-gray-100 rounded-lg shadow-md">
                                                 <a
  className="px-5 py-5 tracking-tight text-lg md:text-[40px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=louis-poulsen"
>
  LOUIS 
</a>
<p className='text-center tracking-[8px] italic mb-[30px] '>louis-Poulsen</p>
                 
                          </div>

       
                     <div
                           className="flex flex-col justify-between h-[160px] border-[1px] border-gray/100  shrink-0 grow-0 md:w-[200px] sm:w-[220px] w-[140px] bg-gray-100 rounded-lg shadow-md">
                                                 <a
  className="px-5 py-5 tracking-tight text-lg md:text-[40px] font-extrabold mt-[30px] text-center"
  href="https://woodmart.xtemos.com/shop/?filter_brand=klober"
>
  KLÖBER
</a>
<p className='text-center tracking-[8px] italic mb-[30px] '>Klöber</p>
    
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

  )
}