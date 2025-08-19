
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const sections = [
    { id: "section1", title: "Selling Handmade Items" },
    { id: "section2", title: " Using Production Assistance" },
    { id: "section3", title: "Being Transparent About Your Business" },
   
  ];

  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries.find((entry) => entry.isIntersecting);
        if (visibleSection) {
          setActiveId(visibleSection.target.id);
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex">
      
      <nav className="fixed left-0 top-30 w-[21%] p-4 rounded-lg  h-screen ">
        <h3 className="font-bold mb-3 text-2xl text-gray-700">Contents</h3>
        <ul className="space-y-2">
        
          {sections.map((item) => (
  <li key={item.id}>
    <a
      href={`#${item.id}`}
      className={`block px-1 py-2 rounded-lg transition-all duration-300 ${
        activeId === item.id
          ? "bg-gray-200 text-orange-600 font-bold shadow-md scale-105"
          : "text-gray-700 hover:text-orange-600 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            activeId === item.id ? "bg-orange-600" : "bg-gray-400"
          }`}
        ></div>
        <span >{item.title}</span>
      </div>
    </a>
  </li>
))}

        </ul>
      </nav>

     
      <main className="ml-[300px] p-8 space-y-8 scroll-smooth">
     <div className="bg-[url('/assets/polices_homepage.webp')] bg-cover bg-center w-[100%] h-96 rounded-lg shadow-lg mb-8 flex flex-col items-start justify-center gap-10">
  <h1 className="text-[80px] text-white font-bold drop-shadow-lg ml-20"></h1> 
 <div> <p className="text-gray-500 text-[16px] ml-4"><span className="text-white"></span></p></div>
</div>
<section className="pb-[100px]">
    <h1 className="text-2xl font-bold mb-4 text-gray-700">Handmade</h1>
  <p className="text-gray-500 text-[16px] ml-4"> -This policy is a part of our Terms of Use. By listing handmade items for sale through Bingo, you’re agreeing to this policy and our Terms of Use.</p>
  <br/>
  <ul className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-8">
  <li>The name of your production partner(s);</li>
  <li>The location of your production partner(s);</li>
  <li>Details about the nature of your partnership and design process; and</li>
  <li>A general description of the work your production partner does for you</li>
</ul>
</section>
  
     {/* section1 */}
        <section id="section1" className="pt-[100px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Selling Handmade Items</h2>
          <p className="text-gray-500 text-[16px] ml-4">-Handmade on Bingo is a spectrum. On one end, we have makers — sellers who are literally making their items with their own hands (or tools).<br />&nbsp; On the other end, we have designers — sellers who design their items but rely entirely on outside assistance or another business to help physically<br />&nbsp;&nbsp; produce them. Many handmade sellers fall in the middle of the spectrum because they are both making and designing their items.</p><br/>
      <p className="text-gray-500 text-[16px] ml-4">-Regardless of where you fall on this spectrum, you must be transparent about who is helping you and how your items are being made. Everything listed <br />&nbsp;&nbsp;as handmade must be made and/or designed by you, the seller. Reselling is prohibited in the handmade category. You may also have shop members who<br />&nbsp; help you run your business, as long as you, the seller, are making and/or designing your items.</p><br/>
      {/* <strong>Makers</strong> */}
      < strong className="text-gray-700 ml-6 text-bold text-[18px]">Makers</strong>
      <br/>
      <p className="text-gray-500 text-[16px] ml-4">-A maker is a seller who is physically making the items listed for sale in their Bingo shop. A maker might design their items in addition to making them,<br />&nbsp; or they might follow a pattern or template that they did not design. Regardless, makers must be creating their items with their own hands (or tools).</p><br/><br/>
      {/* <strong>Designers</strong> */}
      < strong className="text-gray-700 ml-6 text-bold text-[18px]">Designers</strong>
      <br/>
      <p className="text-gray-500 text-[16px] ml-4">-A designer is a seller who has come up with an original design, pattern, sketch, template, prototype, or plan to be produced by in-house shop members<br />&nbsp; or a production partner. Simple customization, such as selecting colors, shapes, or choosing from ready-made options is not considered design on Bingo.
<br />&nbsp;If you are a designer and you are using a production partner to help make your items, you must also disclose information about your production partner <br />&nbsp; in your listings. A production partner is anyone (who’s not a part of your Bingo shop) who helps you physically produce your items.
</p>
        </section>
{/* section2 */}
        <section id="section2" className="pt-[100px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Using Production Assistance</h2>
        <p className="text-gray-500 text-[16px] ml-4">-Designers may work with production partners to help make handmade items in certain circumstances. Keep in mind that people come to Bingo to <br />&nbsp;discover items that they might not find anywhere else. Your design and production process should lead to the creation of a unique item that would <br />&nbsp;not exist without you, the designer.</p><br/>
      <p className="text-gray-500 text-[16px] ml-4">-We expect your production partner to produce items themselves in their own facilities. A contractor or agent who outsources production may <br />&nbsp; not be used as a production partner. Examples of production services include, but are not limited to, printing, apparel printing, 3D-printing, <br />&nbsp;&nbsp;casting, plating, engraving, cutting and sewing, and finishing.</p><br/>
      <p className="text-gray-500 text-[16px] ml-4">-If you work with a production partner, you must disclose certain information in the listing process, including:</p><br/>
      <ul className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-8">
  <li>The name of your production partner(s);</li>
  <li>The location of your production partner(s);</li>
  <li>Details about the nature of your partnership and design process; and</li>
  <li>A general description of the work your production partner does for you</li>
</ul><br/>
<p className="text-gray-500 text-[16px] ml-4">-You may choose to keep the name of your production partner and details about your partnership and design process confidential (visible<br />&nbsp; only to  select Bingo employees), but the location and description of your production partner will appear on your About section and listings.</p><br/>
<p className="text-gray-500 text-[16px] ml-4">-We may reach out to you at any time with a more detailed inquiry about  your business. Please be prepared to provide additional details about<br />&nbsp; the origins of your business, your role in the design process, your production process, and your connection to your production partner, as well <br />&nbsp;&nbsp;as what efforts your production partner has made to follow our ethical expectations.</p><br/>
<p className="text-gray-500 text-[16px] ml-4">-We understand that you may wish to keep the details of your design and business practices confidential. Please be assured that Bingo will not<br />&nbsp; use the private information you provide us for any purpose other than reviewing your business to determine that you are in compliance with our policies.</p><br/>
<p className="text-gray-500 text-[16px] ml-4">-We reserve the right to reject any production partnerships that aren't in the letter or spirit of this policy or our ethical expectations.</p>
  
        </section>
{/* section3 */}
        <section id="section3" className="pt-[140px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Being Transparent About Your Business</h2>
           `
      <p className="text-gray-500 text-[16px] ml-4">-At Bingo, we value transparency. Transparency means that you honestly and accurately represent yourself, your items, and your business.<br />&nbsp; As a handmade seller, you agree to:</p><br/>
      <ul className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-8">
  <li>Disclose in your About section the names and roles of people who help make your items or run your business.</li>
  <li>Use your own words and photographs (not stock photos) to describe your items.</li>
  <li>
    Respond to any inquiries from us in a timely manner. 
    We may ask you how your items are made, what workspace, tools, and equipment you use; 
    and how you communicate and collaborate with the people who help you run your shop.
  </li>
</ul><br/>
<p className="text-gray-500 text-[16px] ml-4">-Remember: Our marketplace is built on trust. Providing false, inaccurate, or misleading information is prohibited by our Terms of Use. If we find that<br />&nbsp; you’re not being open and honest with us, we may suspend or terminate your account.

</p>
 
        </section>

     
      </main>
    </div>
  );
}
