
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const sections = [
   { id: "section1", title: "Marketplace Limitations" },
{ id: "section2", title: "Member Communication" },
{ id: "section3", title: "Purchasing Items" },
{ id: "section4", title: "Leaving Reviews" },
{ id: "section5", title: "Uploading Content" },
{ id: "section6", title: "Order Issues & Returns" },
   

   
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


     
      <main className="ml-[300px] p-8 space-y-18 scroll-smooth">
        <img src="/assets/buyer-612x612.jpg" alt="" className="w-[100%] h-[400px] rounded-lg"  />
   
<section>
  <h1 className=" font-bold mb-4 text-gray-700 ml-2 text-2xl mt-4" >Buyer Policy</h1>
    <p className="text-gray-500 ml-2 " >-Bingo is a marketplace where you can purchase unique goods directly from sellers around the world. Whether you are looking for handmade or<br />&nbsp; vintage goods or craft supplies, we want you to have a positive experience shopping on Bingo. Please read on to find out more about your rights,<br />&nbsp; as well as what is expected of you, as a buyer.

</p>
<h1 className=" font-bold mb-4 text-gray-700 ml-2">This policy is a part of our Terms of Use. By shopping on Bingo, you’re agreeing to this policy and our Terms of Use:</h1>
     <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10">

         <li>Understanding Bingo’s Limitations as a Marketplace</li>
         <li>Communicating with Other Bingo Members</li>
          <li>Purchasing an Item on Bingo</li> 
<li> Leaving a Review of an Item</li>
<li> Creating and Uploading Content</li>
<li>Reporting a Problem with an Order or Returning an Item</li>



        </ol>
</section>
{/* section1 */}
        <section id="section1" className="pt-[140px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Marketplace Limitations</h2>
      <p className="text-gray-500  ml-2" >-Bingo provides a marketplace for buyers to discover and purchase from sellers around the world. It is important to note that Bingo is not a part of that <br />&nbsp;transaction. By shopping on Bingo, you understand that:</p>
    
  <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10">
          <li>You are not buying directly from Bingo, but from one of the many talented sellers on Bingo;</li>
          <li>Bingo does not pre-screen items sold on Bingo and therefore does not guarantee or endorse any items sold on Bingo or any content posted by sellers (such as photographs, language used in listings or shop policies);</li>
          <li>Each seller on Bingo has their own processing times, shipping methods, and shop policies.</li>
          <li>You assume responsibility if you provide your own materials for a custom order.
As a member of the community, you have the opportunity to flag an item or a shop that violates any of Bingo’s policies. Flagging is confidential.
</li>
        </ol>
        </section>
{/* section2 */}
        <section id="section2" className="pt-[140px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Member Communication</h2>
   <strong className="text-gray-700 ml-2 text-xl">Messages</strong>
        <p className="text-gray-500 ml-2">-You can use Bingo’s Messages (“Messages”) tool to communicate directly with sellers or other Bingo members. Messages are a great way to ask sellers any <br />&nbsp; questions you have about an item or an order. Messages may not be used for the following activities:</p>
 
<ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10">
  <li>Sending unsolicited advertising or promotions, requests for donations, or spam.</li>
  <li>Harassing or abusing another member or otherwise violating our Anti-Discrimination Policy.</li>
  <li>Contacting someone after they have explicitly asked you not to.</li>
  <li>Interfering with a transaction or the business of another member.</li>
  <li>Exchanging personal contact, financial or other information for the purposes of making an off-platform transaction, including phone number, address, email, social media handles, external URLs, instructions for money transfer, QR codes, etc.</li>
</ol>

<p className="text-gray-500 ml-2">-Always use caution when exchanging any personal information which is not strictly necessary for the completion of a transaction.
Interference
</p>
<div>
  <p className="text-gray-500 ml-2">-Interference occurs when a member intentionally interferes with another member’s shop in order to drive away their business. Interference is strictly prohibited <br />&nbsp; on Bingo. Examples of interference include:</p>
<ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10">
  <li>Contacting another member via Messages to warn them away from a particular member, shop, or item.</li>
  <li>Posting in public areas to demonstrate or discuss a dispute with another member.</li>
  <li>Purchasing from a seller for the sole purpose of leaving a negative review.</li>
  <li>Maliciously clicking on a competitor’s Promoted Listings ads in order to drain that member’s advertising budget, also known as “click fraud.”</li>
</ol>
</div>
<div><br />
  <h1 className="text-xl font-bold mb-4 text-gray-700">Harassment and Discrimination</h1>
  <p className="text-gray-500 ml-2">-Any use of Messages to harass other members is strictly prohibited. Similarly, Messages may not be used to support or glorify hatred or otherwise violate our <br />&nbsp;Anti-Discrimination Policy. If you receive a Message that violates this policy, please let us know right away.</p>
</div>



 
        </section>

        {/* section3 */}
         <section id="section3" className="pt-[140px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Purchasing Items</h2>
       <p className="text-gray-500 ml-2">-When you buy from a shop on Bingo, you’re directly supporting an independent business, each with its unique listings, policies, and processing times. By making <br />&nbsp;a purchase from a seller on Bingo, you agree that you have:</p>
 
<ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10">

         <li>Read the item description and shop policies before making a purchase;</li>
         <li>Submitted appropriate payment for item(s) purchased; and</li>
          <li>Provided accurate shipping information to the seller.</li> 
 </ol>
        <p className="text-gray-500 ml-2">-You also agree to comply with our Bingo Gift Card, Credits & Coupons Policy when you purchase or redeem Bingo Gift Cards, Bingo Credits or Bingo Coupons.
<br />&nbsp;When purchasing from sellers using Bingo Payments, buyers may authorize a payment with any major credit or debit <br />&nbsp;card accepted by Bingo, with Bingo Gift Cards, Bingo Credits and Bingo Coupons (subject to applicable limitations. See Bingo Gift Cards, Credits & Coupons <br />&nbsp;Policy), by certain bank transfer services, through PayPal (where available), Apple Pay, Google Pay, or through Vodafone Cash (where available).
By using a third-<br />&nbsp;party service, you may also be subject to an agreement with the third party. For example, PayPal is a third-party service provided by PayPal Holdings, Inc. and your use of PayPal is subject to the PayPal User Agreement. Apple Pay is a third-party service provided by Apple Inc. and is subject to the Apple Pay Terms and Conditions. Google Pay is a third-party service provided by Google Payment Corp. and is subject to the Google Pay Terms of Service.
When purchasing from sellers who use PayPal only, buyers may pay through PayPal only. Bingo may share your personal or transactional information with those third-party service providers for purposes related to payments processing. The provider and processing time for your payment will vary based on the country in which you’re located. If there are insufficient funds in your bank account when our provider processes the payment for your purchase, Bingo reserves the right to contact you directly and to seek payment.
For the safety of our community, and to avoid scams and fraud, all transactions must take place through the Bingo checkout system, and only transactions that take place through the Bingo checkout system are eligible for our case system.
It is prohibited to share contact information or QR codes for the purposes of making an off-platform transaction. If you need to discuss the details of your order with your seller, please keep your communication on the Bingo platform (via Messages).
</p>
        </section>
        {/* section4 */}
        <section id="section4" className="pt-[140px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Leaving Reviews</h2>
  <p className="text-gray-500 ml-2">-Reviews are a great way to learn about a seller’s items, help good sellers build a strong reputation, or help warn other buyers about a poor experience.
You can leave a review, including a one to five star rating and a video or photograph of your purchase, for 100 days from the earlier date of your item’s confirmed delivery (where the shipping carrier’s delivery record is available) or from your item’s estimated delivery date. If an estimated delivery date is not available, the review window opens after the order’s processing time and shipping time have elapsed. If you purchase a digital item, you can leave a review for 100 days from the first time you download the item or within 12 months of purchase (whichever happens first). You can edit your review, including the video or photograph, any number of times during that 100 day period. Your review and/or video or photograph and public profile information will be publicly displayed on the seller’s listing and review pages.
By leaving a review, video, or photograph, you acknowledge that your content may not violate our rules for Creating and Uploading Content in Section 5, in addition to the following:
</p>
<div className="space-y-6 text-gray-700">
  <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10">
    <li>Contain graphic, mature, or obscene language or imagery, or any content that is subject to our mature content policy;</li>
    <li>Be about things outside the seller’s control, such as a shipping carrier, Bingo, or a third party;</li>
    <li>Include shilling or otherwise falsely inflate a shop’s review score; or</li>
    <li>Undermine the integrity of the reviews system.</li>
  </ol>

  <p  className="text-gray-700 ml-2 font-bold trxt-xl">By uploading a video or photograph to one of Bingo’s websites or Bingo’s mobile app, you warrant that:</p>
  
  <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10">
    <li>You own the content or you have the rights or permission to use the content;</li>
    <li>You understand that, as stated in Bingo’s Terms of Use, Bingo has license to use any content you provide to Bingo.</li>
  </ol>

  
</div>
<p className="text-gray-500 ml-6 mt-[10px]">
    -Sellers may also respond to reviews. Sellers’ responses to reviews must also comply with this policy. Sellers may report reviews that violate our Terms of Use.
  </p>
  
  <p className="text-gray-500 ml-6 ">
    -We reserve the right to remove reviews, videos, or photographs that violate our policies or Terms of Use.
  </p>



 
        </section>
{/* section5 */}
 <section id="section5" className="pt-[140px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Uploading Content</h2>
   <p className="text-gray-500  ml-2">
- As a member of Bingo, you have the opportunity to create and upload a variety of content, like Messages, text, photos, and videos. In order to keep our community safe and respectful, you agree that you will not upload content that:
  </p>
        <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10">
        
  <li>	Contains hateful or derogatory language or imagery, or any content that is subject to our Anti-Discrimination and Hate Speech Policy;</li>
  <li>	Contains threats, harassment, extortion, or violates our rules about interference;</li>
  <li>Violates someone else’s intellectual property rights;</li>
  <li>Is false, deceptive, or misleading;</li>
  <li>Contains unsolicited advertising or promotions, requests for donations, or spam;</li>
  <li>Contains private information, whether it is your own, or someone else’s;</li>
  <li>Encourages or facilitates an off-platform transaction;</li>
  <li>Contains prohibited medical drug claims; or</li>
  <li>Sexualizes minors under the age of 18;</li>
  <li>Violates any of the rules described in our Prohibited Items Policy.</li>

 </ol>
         <p className="text-gray-500  ml-2" >-iMembers may not use Bingo services such as Messages, Favorites, or Collections to make inappropriate use of otherwise compliant content, whether overtly or through contextualization. This includes, for example, the aggregation of content with the intent of sexualizing minors.
</p>
<p className="text-gray-500  ml-2">-Some content on Bingo is subject to additional requirements. Please see the related sections above</p>


 
        </section>
      {/* section6 */}
      <section id="section6" className="pt-[140px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Order Issues & Returns</h2>
          <strong className="text-gray-700">Bingo’s Case System</strong>
     <p className="text-gray-500  ml-2">-Although Bingo is not directly involved in a transaction between a buyer and a seller, we provide a case system in the unlikely event that your order does not go as expected and you are unable to reach a resolution with the seller. If you experience an order issue, the first thing you must do is contact the seller through our contact us page or help center. Sellers should be given 48 hours to try to resolve the issue. After this period, you can use Bingo’s case system to alert Bingo of an unresolved order issue from the contact us page, or if an item you receive is not as described in the listing. These issues may be covered by Bingo’s Purchase Protection Program, including how to open a case and your eligibility for opening a case. Bingo will decide, in its sole discretion, if a transaction is granted eligibility under the Bingo Purchase Protection Program or not. Bingo reserves the right to change, suspend, or discontinue the program at any time, for any reason, and we will not be liable to you for the effect that any changes to the program may have on you. You have no legal claim under the Bingo Purchase Protection Program. In the event that Bingo does not refund you, this will not affect your claims against the seller from whom you purchased. Your legal rights remain intact.
By using Bingo’s case system, you understand that Bingo may use your personal information for the purpose of resolving disputes with other members. If you choose a refund as your preferred resolution, keep in mind that Bingo only allows on-platform refunds for a period of 180 days post-transaction. After this 180 day window has elapsed, Bingo cannot support on-platform refunds for your order. However, you may still communicate directly with the seller to come to an off-platform resolution. Refunds issued by Bingo will be in your original form of payment, and if such payment is not available, an Bingo credit will be issued.
</p>
<strong className="text-gray-700">Bingo’s Purchase Protection Program:</strong>
<p className="text-gray-500  ml-2">-In many cases, order issues can be resolved directly with the seller, or items can be returned according to the seller’s return policy. However, we believe that you should always get the item you ordered or get your money back, so when those expectations aren’t met, Bingo will step in to support you. Buyers may receive a full refund for purchases that never arrive, arrive late, arrive damaged, or do not match the listing description.
If an order does not meet the following expectations, you may receive a full refund, including all taxes and shipping costs.
</p>
{/* <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 md:p-8"> */}
  <h2 className=" font-bold tracking-tight text-gray-700">Purchase Protection Program — Conditions:</h2>
  <ol className="mt-4 list-decimal pl-6 space-y-4">
    <li>
      {/* <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10"></ol> */}
      <h3 className="font-bold text-gray-700">On-time Delivery</h3>
      <ul className="mt-1 list-disc pl-6 space-y-1 text-gray-500">
        <li>Items must be shipped within the seller’s stated processing times.</li>
        <li>Delivered to the buyer’s address provided at purchase within the estimated delivery window.</li>
        <li>Changes to processing time or address via informal channels (e.g., Messages) are not eligible.</li>
        <li>If shipped with tracking, the buyer may open a carrier claim directly with the shipping carrier.</li>
        <li>Delays due to force majeure (carrier strike, natural disaster, war, civil unrest, etc.) are excluded.</li>
      </ul>
    </li>

    <li>
      <h3 className="font-bold text-gray-700">Undamaged & Proper Packaging</h3>
      <ul className="mt-1 list-disc pl-6 space-y-1 text-gray-700">
        <li>Items arrive undamaged, and are packaged to withstand handling in transit.</li>
        
      </ul>
    </li>
    <li ><h3 className="font-bold text-gray-700">Items match the listing description. Items received should not be significantly different from the listing description or photos. We may ask the buyer to provide us with documentation to demonstrate that the item is significantly different. Here are a few examples of qualifying scenarios:</h3>
      <ul className="list-disc pl-6 space-y-1 text-gray-500">
  <li>The item received is a different color, model, version, or size.</li>
  <li>The item has a different design or material.</li>
  <li>The seller failed to disclose that an item is damaged or is missing parts.</li>
  <li>The buyer received the incorrect quantity of items (e.g., purchased three but received two).</li>
  <li>The item was advertised as authentic but is not authentic.</li>
  <li>The condition of the item is misrepresented (e.g., described as new but is used).</li>
</ul></li>

    <p className="text-gray-500  ml-2">-If Bingo determines that the above expectations are not met, either Bingo or the seller will be required to refund the order, including original shipping and <br />&nbsp;return shipping. Depending on the case specifics, and whether a return is requested, Bingo may refund the return shipping cost in the form of an Bingo <br />&nbsp;Credit.
Some exclusions apply, subject to review by Bingo’s case system. Eligible buyers must have a registered account on Bingo in good standing (that<br />&nbsp; means you’re not violating any of Bingo’s policies). Abuse of this program could result in program exclusion at Bingo’s discretion.
Ineligible Transactions
</p>
<br/>

  </ol>
    <p className="text-gray-700   ml-2 font-bold">Unless required by law, some disputes don’t qualify for Bingo’s case system. These include:</p>
   <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-500 ml-8">
    <li>Items that have been altered, used, worn, washed, or discarded after receipt.</li>
    <li>Items that are returned without a return agreement..</li>
    <li>Items that are accurately described but don’t meet a buyer’s expectations.</li>
    <li>Cost of shipping disputes.</li>
    <li>Items that are purchased in person.</li>
    <li>Transactions where payment is not processed by Bingo Payments, for example in an offsite transaction, or via PayPal.</li>
    <li>Disputes covered by local warranty or return laws applicable to a seller or their product
Wherever a qualifying case is escalated for Bingo’s review, we will evaluate the claim to the best of our ability. Please be prepared to supply additional documentation if requested.
</li>
  </ul>
  <br /><strong className="text-gray-700  ml-4">Requesting a Cancellation:</strong><br />
<p className="text-gray-500  ml-6">-Only sellers may cancel transactions. Buyers may request that a seller cancel an order via Messages. Note that all cancellations must comply with our Anti- <br />&nbsp;&nbsp;Discrimination Policy.</p>
<br /><strong className="text-gray-700  ml-4">Returning an Item:</strong><br />
<p className="text-gray-500  ml-6">-Each seller has his or her own return policies, which should be outlined in their Shop Policies. Not all sellers accept returns.For returns on digital items, please <br />&nbsp;&nbsp;see seller listing.</p>

{/* </section> */}


        </section>
      
      </main>
    </div>
  );
}
