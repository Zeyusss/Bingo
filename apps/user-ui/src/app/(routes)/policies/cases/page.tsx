
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const sections = [
    { id: "section1", title: "Opening a Case" },
    { id: "section2", title: "Case Eligibility" },
    { id: "section3", title: "Ineligible Disputes&Transactions" },
    { id: "section4", title: "Case Resolution" },
   

   
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
<section>
  <h1 className="text-gray-700 font-bold text-[22px]">Cases policies</h1>
  <ol className="list-decimal pl-5 space-y-1 text-gray-700 mt-2  ">
         <li>Opening a Case</li>
          <li>Case Eligibility</li> 
<li> Ineligible Disputes and Transactions</li>
<li> Case Resolution</li>
        </ol>
    
</section>
{/* section1 */}
        <section id="section1" className="pt-[100px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Opening a Case</h2>
          <p className="text-gray-500">When a buyer is looking to return an item, get a refund, or otherwise notify a seller of a problem with their order on Bingo, the first thing they must do is contact the seller directly via the Help with Order link within Purchases or inside the Buyer Page  and Reviews and let the seller know the issue. It is important for sellers to fill out their shop policies to address returns and refunds, and for buyers to read and understand those policies before ordering.
Sellers are expected to regularly respond to Messages, including Help with Order messages, from buyers. If a buyer has reached out to the seller by selecting Help with Order within the Purchases and Reviews section of their account, and hasn't heard back within 48 hours, or if the seller is unable to resolve the issue within 48 hours, buyers can open what’s known as a “case.” With Bingo’s case system, a buyer alerts Bingo that there is an issue with their order that they were unable to resolve with the seller within 48 hours, and Bingo will assist in the resolution of the case between the buyer and seller. This may include, but is not limited to, automatically closing the case and issuing a refund, or reviewing the case further to help both parties work together to resolve the issue.
Here are a couple of things to keep in mind:
</p>
            <ul className="list-disc list-inside text-gray-500 space-y-1 ml-4">
      <li>
   	A buyer must have an Bingo account to open a case. If a buyer purchases an item using guest checkout, they'll have to register for an account on Bingo before opening a case. 
      </li>
      <li>
      	A buyer can only use one method of dispute resolution against sellers on Bingo. If a buyer has filed a chargeback with their credit card company, they cannot also open a case. If a buyer files a chargeback after opening a case on Bingo, that Bingo case will be closed
      </li>
      <li>
        If a buyer paid through PayPal, Bingo may advise them to contact PayPal for a refund.
      </li>
      
    
    </ul>

        </section>
{/* section2 */}
   <section id="section2" className="pt-[100px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Case Eligibility</h2>
       <p className="text-gray-500 ml-2" >In order for a case to be opened with Bingo, an order must meet the following criteria:</p>
      
   <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2  ">
  <li>The order is within the eligible time frame to open a case, based on an order's estimated delivery date (if applicable) or processing time and “ship by” date</li>
  <li>The buyer has reported the order issue to the seller by selecting Help with Order within the Purchases and Reviews section, and has given the seller 48 hours to resolve the issue.</li>
  <li>The buyer wants to open a case because the item never arrived, arrived after the estimated delivery date window, or does not match the listing description, as described below.</li>
</ol><br />
           <strong> <h1 className="text-gray-700 text-[18px]  text-semibold">Bingo’s Purchase Protection Program</h1></strong> 
  <p className="text-gray-500 ml-2" >
  In many cases, order issues can be resolved directly with the seller, or items can be returned according to the seller’s return policy. 
  However, we believe that you should always get the item you ordered, or get your money back, so when those expectations aren’t met, Bingo will step in to support you.
</p><br />
<p className="text-gray-500 ml-2">
  Buyers will receive a full refund for purchases that never arrive, arrive after the estimated delivery date window, or do not match the listing description.
</p><br />
  

<div>
  <h1 className="text-gray-700 text-[18px]  text-semibold">
  Full Refund for Orders That Don’t Meet Program Standards
</h1>
<strong><h1 className="text-gray-700 text-[18px]  text-bold">A. Items Delivered on Time</h1></strong>

<h4  className="text-gray-500 ml-2">Processing and Delivery Requirements</h4>
<p className="text-gray-500 ml-2">-Items must be shipped within the seller’s stated processing times and delivered to the address provided by the buyer at the time of purchase on Bingo. Updates to processing times or shipping address through informal channels will not qualify.</p>

<strong> <h4  className="text-gray-700 ml-2 text-[18px]">--Shipping Carrier Claims</h4></strong> 
<p  className="text-gray-500 ml-4 ">If an item was shipped and has a tracking number, you may be able to open a shipping carrier claim by directly contacting the carrier.</p>

<strong> <h4  className="text-gray-700 ml-2 text-[18px]">--Exceptions</h4></strong> 
<p  className="text-gray-500 ml-4">Items delayed due to events outside the seller’s control, such as carrier strikes, natural disasters, war, or similar force majeure events, as determined by Bingo, do not qualify for the Purchase Protection Program.</p>
<strong><h1 className="text-gray-700 text-[18px]  text-bold">B. Items arrive undamaged, and are packaged to withstand handling in transit.</h1></strong> 
 <strong><h1 className="text-gray-700 text-[18px]  text-bold">C. Items match the listing description. Items received should not be significantly 
 different from the listing description or photos. We may ask the buyer to provide us with 
 documentation to demonstrate that the item is significantly different. Here are a few 
 examples of qualifying scenarios:</h1></strong><br />
 <ul className="text-gray-500 ml-4">
  <li>•	The item received is a different color, model, version, or size.</li>
  <li>•	The item has a different design or material.</li>
  <li>•	The seller failed to disclose that an item is damaged or is missing parts.</li>
  <li>•	The buyer received the incorrect quantity of items (e.g., the buyer purchased three items but only received two).</li>
  <li>•	The item was advertised as authentic but is not authentic.</li>
  <li>•	The condition of the item is misrepresented (e.g., the item is described as new but is used).</li>
  <li>•	The item was shipped from a different location than advertised 
    Some exclusions apply, subject to review by Bingo’s case system. Eligible buyers must 
    have a registered account on Bingo in good standing (that means not violating any of Bingo's policies).
    Abuse of this program could result in program exclusion at Bingo’s discretion.</li>
 </ul>

</div>
<div>
  <strong><h1 className="text-gray-700 text-[18px]  text-bold">Bingo’s Purchase Protection Program for Sellers:</h1></strong>
  <p  className="text-gray-500 ml-4">Bingo’s Purchase Protection Program for Sellers helps qualified sellers to resolve eligible non-delivery, damaged, and not-as-described cases. We understand that things can still go wrong, even if a seller has taken all of the necessary steps to ensure a good buyer experience. In these cases, where an order meets all of our requirements, Bingo will refund buyers for orders (including shipping & taxes) and sellers will not be held responsible.</p>
</div>
     

        </section>
        {/* section3 */}
        <section id="section3" className="pt-[100px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Ineligible Disputes and Transactions </h2>
          <p className="text-gray-500 ml-4">Unless required by law, some disputes and transactions are ineligible for the case system, including:</p>
       


         <ul className='list-[upper-alpha] pl-6 space-y-2 text-gray-500 ml-6'>
   
     
      <li>•	Items that have been altered, used, worn, washed, or discarded after receipt.</li>
      <li>•	Items that are returned without a return agreement.</li>
      <li>•	Items that are accurately described but don’t meet a buyer's expectations.</li>
      <li>•	Cost of shipping disputes.</li>
      <li>•	Items that are purchased in person.</li>
      <li>•	Transactions where payment is not processed by Bingo Payments, for example in an offsite transaction.</li>
      <li>•	Disputes covered by local warranty or return laws applicable to a seller or their product</li>
      </ul>
      <br/>
      <p className="text-gray-500 ml-4">Wherever a qualifying case is escalated for Bingo’s review, we will evaluate the claim to the best of our ability. Please be aware that our case mediation capabilities may be limited for certain types of items, which may result in a refund. Bingo reserves the right, in its sole discretion, to change its original decision based on information obtained after the case was originally evaluated.</p>
      
     
     

        </section>
   {/* section4 */}
    <section id="section4" className="pt-[100px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Case Resolution </h2>
          <p className="text-gray-500 ml-4">--Once a case is opened, Bingo will usually resolve and close the case automatically on behalf of the buyer and seller. Bingo reserves the right to resolve the case on a seller’s behalf, including, but not limited to, by issuing a refund to the buyer and recouping funds from the seller’s account if payment was made via Bingo Payments.</p>
     <br />
  <p className="text-gray-500 ml-4">--In some cases, Bingo may need to investigate further in order to resolve the case. Each case must remain open until a resolution has been reached. Bingo may reach out to you to provide more information on the case, and you should promptly respond. Sellers must respond within 2 calendar days.</p>
       <br /> <p className="text-gray-500 ml-4">--Bingo reserves the right to resolve an order issue before the 48-hour window for circumstances including, but not limited to, seller inactivity, harassment, refusal of service, manipulation, and undermining the integrity of the case system. </p>
        <br /><p className="text-gray-500 ml-4">--Bingo may close or resolve a case due to lack of participation from either party, or reopen a previously closed case to further investigate tracking issues or other aspects of the dispute. To maintain the integrity of the case system, a seller cannot encourage or require a buyer to close a case as a condition of resolving the dispute.</p>
        <br /><p className="text-gray-500 ml-4">--In the unlikely event that a case remains unresolved for more than 365 days, it is considered to be a late delivery, and the only acceptable resolution is a full refund.</p>
        </section>
     
      
      </main>
    </div>
  );
}
