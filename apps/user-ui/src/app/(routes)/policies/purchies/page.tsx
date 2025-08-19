
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const sections = [
    { id: "section1", title: "Purchase Protection for Sellers" },
    { id: "section2", title: "Order Eligibility Requirements" },
   
   
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

     
      <main className="ml-[300px] p-8 space-y-12 scroll-smooth">
     <div className="bg-[url('/assets/polices_homepage.webp')] bg-cover bg-center w-[100%] h-96 rounded-lg shadow-lg mb-8 flex flex-col items-start justify-center gap-10">
  <h1 className="text-[80px] text-white font-bold drop-shadow-lg ml-20"></h1> 
 <div> <p className="text-gray-400 ml-20 "><span className="text-white"></span></p></div>
</div>
<section className="pb-[70px]">
  <h1 className="text-gray-700 font-bold text-2xl ml-2">Purchase Protection For Sellers </h1>
    <p className="text-gray-500 text-[16px] ml-4">
       -Bingo's Purchase Protection program was built to ensure that buyers and sellers have a positive experience on Bingo. For eligible sellers, our program can <br />   &nbsp; offer a little extra peace of mind when cases arise. Bingo may cover buyer refunds for orders on any case arising from a qualified order. This page explains  <br />   &nbsp;&nbsp;how the Purchase Protection program works, and the types of items and transactions subject to the program.
      </p><br/>
      <p className="text-gray-500 text-[16px] ml-4">
       -These terms are part of our Terms of Use. To qualify for the Bingo Purchase Protection program for sellers, you agree to these terms and our Terms of Use.  <br />   &nbsp;&nbsp;The Bingo Purchase Protection program for sellers is not an insurance policy, a warranty, nor a guarantee. Bingo will decide, in its sole discretion, if a  <br />   &nbsp;&nbsp;transaction is granted protection under the Bingo Purchase Protection program or not. Bingo reserves the right to change, suspend, or discontinue the <br />   &nbsp; program at any time, for any reason, and we will not be liable to you for the effect that any changes to the program may have on you. You have no legal <br />   &nbsp; claim under the program. In the event that Bingo does not refund the buyer, this will not affect the buyer's right to make claims against your shop. Your <br />   &nbsp; legal rights remain intact.
      </p>
      <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10">
  <li>About Bingo's Purchase Protection program for sellers</li>
  <li>Eligibility Requirements</li>
</ol>
</section>
{/* section1 */}
        <section id="section1" className="pt-[100px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">About Bingo's Purchase Protection program for sellers</h2>
      <p className="text-gray-500 text-[16px] ml-4">-We understand that things can still go wrong even if a seller has taken all of the necessary steps to ensure a good buyer experience. Under Bingo's <br />   &nbsp; Purchase Protection program for sellers, Bingo helps qualified sellers resolve eligible cases. In these cases, where an order meets all of our requirements, <br />   &nbsp; Bingo may refund buyers for orders and sellers will not be held responsible. For more information about cases, please refer to our Cases Policy.
Bingo's  <br />   &nbsp;&nbsp;Purchase Protection program for sellers applies to cases where the item does not arrive, or where there are disputes about listing accuracy. In general, it <br />   &nbsp; will not apply to cases concerning damaged items, however Bingo may cover a seller’s first case related to a damaged item in each calendar year.</p>
<br/><br/>
<p className="text-gray-500 text-[16px] ml-4">-For cases where the item does not arrive, Bingo Purchase Protection protects sellers for orders that are shipped within the stated processing time, but <br /> &nbsp;ultimately not received at their final destination or not received by the later date of the Estimated Delivery Date. Sellers who meet the eligibility criteria <br /> &nbsp;outlined here may not be held financially responsible for such cases that result in a buyer refund.</p><br/><br/>
<p className="text-gray-500 text-[16px] ml-4">-For disputes about listing accuracy, Bingo Purchase Protection protects sellers for orders that match the listing description and photos, where a buyer <br /> &nbsp;claims it does not. Bingo does not cover orders that differ from the listing description, so, we strongly recommend using accurate photos and descriptions <br /> &nbsp;when listing an item.</p><br/><br/>
<p className="text-gray-500 text-[16px] ml-4">-For cases where the item arrives damaged, Bingo Purchase Protection supports sellers with their first eligible case starting August 1, 2022 and once for<br /> &nbsp; each calendar year (January to December) thereafter. Otherwise, sellers are responsible for resolving cases where the buyer has reported that an item has <br /> &nbsp;&nbsp;arrived damaged. For this reason, we recommend packaging all items securely, and purchasing shipping insurance</p><br/><br/>
<p className="text-gray-500 text-[16px] ml-4">-Sellers are also responsible for their independent warranty or return requirements under local applicable law.</p><br/><br/>,
   
      

        </section>
{/* section2 */}
        <section id="section2" className="pt-[100px] pb-[50px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700"> Order Eligibility Requirements</h2>
     <p className="text-gray-500 text-[16px] ml-4">
-Sellers are automatically covered under Bingo's Purchase Protection program if they take the steps detailed below. Here's what you need to do to make <br />   &nbsp; sure your orders are covered:
</p>

<ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10">
 <li>Use valid tracking and/or, where available, a shipping label purchased on Bingo. If not using Shipping Labels on Bingo, mark your order as shipped after you send it out, and provide Bingo with a valid tracking number on the order that shows the order route and delivery progress.</li>
  <li>Use Bingo's payment platform, Bingo Payments, where available. Please note that Bingo Payments is only available in certain countries. If Bingo Payments is not yet available to you, you will not be eligible for Purchase Protection for Sellers. For PayPal transactions, buyers will be directed to handle cases through PayPal.</li>
  <li>Ship the order to the address provided on Bingo. If your buyer provides an alternate shipping address through Messages, be mindful of fraud or scams. You may choose to cancel and refund the order and ask the buyer to purchase the item again with the corrected shipping address.</li>
  <li>Package your order carefully to avoid damage in transit.</li>
  <li>Include processing times on your listing and ship your order within those stated processing times. You must also have an Estimated Delivery Date (EDD) for a listing, which includes transit times and, where applicable, zip code. Informal agreements through Bingo Messages to change the shipping date will not qualify; we use the processing times you set for each listing to determine the ship-by date.</li>
  <li>Fill out all of your Shop Policies (it's especially important to have policies for returns, exchanges, and custom orders). Your Shop Policies have to comply with Bingo's policies, as well as your local laws.</li>
  <li>Keep your shop in good standing (that means you're not violating any of Bingo's policies).</li>
</ol>
<br />

<p className="text-gray-500 text-[16px] ml-4">
 -Sellers are responsible for refunding costs for orders that fall outside of these requirements, or are damaged in transit following the first case covered by <br />   &nbsp; Bingo. Bingo strongly recommends purchasing insurance when fulfilling your order for these reasons.
</p>

<p className="text-gray-500 text-[16px] ml-4">
 -If a seller has obtained third party insurance, or has carrier, and/or payment processor coverage, we ask that they first submit a claim to their primary  <br />   &nbsp;coverage. Bingo reserves the right to process a refund only where other coverages do not apply.
</p>
 
        </section>
       

     
      </main>
    </div>
  );
}
