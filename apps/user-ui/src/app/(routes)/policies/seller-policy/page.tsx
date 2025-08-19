
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const sections = [
    // { id: "section1", title: "Selling Basics" },
    // { id: "section2", title: "Being a Member of the Bingo Community" },
    // { id: "section3", title: "Feedback, Cases, and Your Success" },
    { id: "section1", title: "Selling Basics" },
{ id: "section2", title: "Community" },
{ id: "section3", title: "Feedback & Cases" },
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

     
      <main className="ml-[300px] p-8 space-y-10 scroll-smooth">
     <div className="bg-[url('/assets/polices_homepage.webp')] bg-cover bg-center w-[100%] h-96 rounded-lg shadow-lg mb-8 flex flex-col items-start justify-center gap-10">
  <h1 className="text-[80px] text-white font-bold drop-shadow-lg ml-20"></h1> 
 <div> <p className="text-gray-400 ml-20 "><span className="text-white"></span></p></div>

</div>
<section>
    <p className="text-gray-500 text-[16px] ml-4">Bingo is a marketplace where you can sell your handmade goods, vintage items, and craft supplies directly to buyers around the world. We want to make sure that you and your buyers have a positive experience on Bingo. Please read on to find out more about your rights, as well as what is expected of you, as a seller.</p>
  <br/>
    <p className="text-gray-700 text-[16px] ml-4">
    This policy is a part of our Terms of Use. By opening an Bingo shop, you’re agreeing to this policy and our Terms of Use:
  </p>
  <ol className="list-decimal pl-5 space-y-1 text-gray-700 mt-2 ml-8 ">
    <li className="text-[18px] text-gray-700 text-semibold">Selling Basics
      <ol className="list-[lower-alpha] pl-5 space-y-1 text-gray-500 mt-2 ml-6">
        <li>What can be sold on Bingo</li>
        <li>What can't be sold on Bingo</li>
        <li>Managing your Bingo shop</li>
        <li>Seller Standards</li>
        <li>Selling Fees</li>
      </ol>
    </li>
    <li className="text-[18px] text-gray-700 text-semibold">Being a Member of the Bingo Community
      <ol className="list-[lower-alpha] pl-5 space-y-1 text-gray-500 mt-2 ml-6">
        <li>Creating and Uploading Content</li>
        <li>Privacy and Protecting Personal Information</li>
        <li>Communication Standards
          <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-6">
            <li>Messages</li>
        <li>Forums/Teams</li>
        <li>Communicating Cancellations</li>
          </ol>
        </li>
        
      </ol>
    </li>
    <li className="text-[18px] text-gray-700 text-semibold">Feedback, Cases, and Your Success
      <ol className="list-[lower-alpha] pl-5 space-y-1 text-gray-500 mt-2 ml-6">
        <li>Reviews</li>
        <li>Bingo’s Case System</li>
        <li>Bingo's Purchase Protection Program for Sellers</li>
        <li>Your Seller Account and Bingo’s Terms</li>
      
      </ol>
    </li>
    
  </ol>
    
</section>
{/* section1 */}
        <section id="section1" className="min-h-screen pt-[120px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Selling Basics</h2>
        <strong  className=" mb-4 text-gray-500" >Keeping in mind these basic requirements will set you up for success on Bingo.</strong>
      
     <strong><h1 className="text-gray-700 text-[18px]">a-What can be sold on Bingo</h1></strong>
    <p className=" mb-4 text-gray-500">
        Bingo is a unique marketplace. Buyers come here to purchase items that they might not find anywhere else. Everything listed for sale on Bingo must be handmade, vintage, or a craft supply.<br/>
      Handmade items are items that are made and/or designed by you, the seller. Read our full Handmade Policy.<br/>
      If you sell handmade items, you agree that:</p>
       <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-8">
    <li>All handmade items are made or designed by you. If you work with a production partner, you must disclose that production partner in your relevant listings.</li>
    <li>You accurately describe every person involved in the making of an item in your shop in your About section.</li>
    <li>You are using your own photographs or video content — not stock photos, artistic renderings, or photos used by other sellers or sites. Read more about using appropriate photographs in this Help article.</li>
  </ol>
  <br/>
  <strong className=" mb-4 text-gray-500">If you are selling personalized or made-to-order items in the Handmade category, you agree that:</strong>
<ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-4">
    <li>All listings are available for purchase at a set price.</li>
    <li>If you are using photographs of previous work with options for customization (like color choices) included in the listing, it is clear in your description that the photos shown are just examples.</li>
  </ol><br />
  <p className=" mb-4 text-gray-500 ml-4">-Vintage items must be at least 10-15 years old.</p>
<p className=" mb-4 text-gray-500 ml-4">  -Craft Supplies are tools, ingredients, or materials whose primary purpose is for use in the creation of an item or special occasion. Craft supplies may be handmade, commercial, or vintage. Party supplies may also be sold as craft supplies.</p>
<p className=" mb-4 text-gray-500 ml-4">  -We encourage you to be transparent about how your craft supplies were made and where your materials come from. You can disclose whether your items have social or environmental attributes, such as organic or recycled. You can also select the location of manufacture.</p>
  
  <strong><h1 className="text-gray-700 text-[18px]">b-What Can't be Sold on Bingo</h1></strong>
  <p className=" mb-4 text-gray-500 ml-4">Even if they otherwise meet our marketplace criteria, prohibited items, services, and items that violate our intellectual property policies are not allowed to be sold on Bingo. All listings must offer an item for sale (which includes digitally delivered items, and can also include reserved listings). You may not create an Bingo listing for the purpose of sharing a referral code, posting a want ad, or similar activity that does not offer a physical or digital item for sale.<br/>
  Reselling is not allowed in the handmade category on Bingo. Reselling refers to listing an item as handmade when you were not involved in designing or making that item.<br/>
  Keep in mind that members or, in some cases third parties, may flag listings that appear to violate our policies for Bingo's review. Bingo may remove any listings that violate our policies. Note that listing fees are non-refundable. Bingo may also suspend or terminate your account for any violations and you'll still have to pay any outstanding fees on your Bingo statement. You can find more information in our Fees & Payments Policy.<br/>
  If you are raising money on behalf of a charity, you must obtain that charity’s consent.</p>
  <strong><h1 className="text-gray-700 text-[18px]">c-Managing your Bingo Shop</h1></strong>
 <p className=" mb-4 text-gray-500 ml-4"> Your shop represents you and your business to the Bingo community. It’s important that you, your items and your shop are honestly and accurately represented.<br/>
  </p>
  <strong  className="text-gray-700 " >By selling on Bingo, you agree that you will:</strong>
<ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-4">
  <li>Provide honest, accurate information to Bingo and in your About section.</li>
  <li>Honor your Shop Policies.</li>
  <li>Ensure your shop content, such as any text, photos or videos used to represent yourself, your shop or your listings, abide by Bingo’s policies, including our Anti-Discrimination Policy.</li>
  <li>Accurately represent your items in listings and listing photos.</li>
  <li>Respect the intellectual property of others. If you feel someone has violated your intellectual property rights, you can report it to Bingo.</li>
  <li>Not facilitate off-platform transactions.</li>
  <li>Not create duplicate shops or take any other action (such as manipulating clicks, carts or sales) for the purpose of shilling, manipulating search or circumventing Bingo's policies.</li>
  <li>Not coordinate pricing with other sellers.</li>
</ol>
<strong><h1 className="text-gray-700 text-[18px]">d-Seller Standards By: </h1></strong>
<p  className=" mb-4 text-gray-500 ml-4">listing a product for sale on Bingo you understand and agree that you are responsible for complying with all applicable laws and regulations for the products you list for sale, including any required labels and warnings. Bingo assumes no responsibility for the accuracy, labeling, or content of your listings.<br/>
</p>
<strong  className="text-gray-700 ">-Meeting Service Level Standards</strong>
<p  className=" mb-4 text-gray-500 ml-4">As a seller, you must provide great customer service and maintain trust with your buyers. These requirements are called our Seller Service Level Standards. Bingo may reach out to you if your shop fails to meet Bingo's Seller Service Level Standards. Read more here.<br/>
</p>
<strong  className="text-gray-700 ">-By selling on Bingo, you agree to:</strong>
 <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-8">
  <li>Honor your shipping and processing times. Sellers are obligated to ship an item or otherwise complete a transaction with a buyer in a prompt manner, unless there is an exceptional circumstance. Please be aware that legal requirements for shipping times vary by country.</li>
  <li>Respond to Messages in a timely manner.</li>
  <li>Honor the commitments you make in your shop policies.</li>
  <li>Resolve disagreements or order issues directly with the buyer. In the unlikely event that you can’t reach a resolution, Bingo can help through our case system.</li>
  <li>If you are unable to complete an order, you must notify the buyer and cancel the order.</li>
</ol>
<strong><h1 className="text-gray-700 text-[18px]">e-Selling Fees</h1></strong>
<p className=" mb-4 text-gray-500 ml-4">Sellers may be charged for using some of Bingo’s services. There are fees associated with listing, selling, advertising, and certain other Bingo products and features. 

</p>
        </section>
{/* section2 */}
   <section id="section2" className="min-h-screen pt-[120px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-600">Being a Member of the Bingo Community</h2>
        <p className=" mb-4 text-gray-500 ml-4">At Bingo, everyone is expected to treat fellow members of the Bingo community with respect. As a seller, you have additional responsibilities to safeguard personal information and communicate promptly with buyers in order to provide a great customer experience.</p>
      <ol className=" pl-5 space-y-1 text-gray-500 mt-2 ml-4">
       
          <li><strong className="text-[18px] text-gray-700 font-semibold">a-Creating and Uploading Content</strong><br/>
          <br/>
          <p className="text-gray-500 text-[16px] ml-4">-As a member of Bingo, you have the opportunity to create and upload a variety of content, like listings, Messages, text, photos, and videos. In order to keep our community safe and respectful, you agree that you will not upload content that:</p>
        <br/> 
        <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-8">
  <li>Contains hateful or derogatory language or imagery, or any content that is subject to our Anti-Discrimination and Hate Speech Policy.</li>
  <li>Contains threats, harassment, extortion, or violates our rules about interference.</li>
  <li>Violates someone else’s intellectual property rights.</li>
  <li>Is false, deceptive, or misleading.</li>
  <li>Contains unsolicited advertising or promotions, requests for donations, or spam.</li>
  <li>Contains private information, whether it is your own, or someone else’s.</li>
  <li>Encourages or facilitates an off-platform transaction.</li>
  <li>Contains prohibited medical drug claims.</li>
  <li>Sexualizes minors under the age of 18.</li>
  <li>Violates any of the rules described in our Prohibited Items Policy.</li>
</ol><br/>
<p className="text-gray-500 text-[16px] ml-4">-Members may not use Bingo services such as Messages, Favorites, or Collections to make inappropriate use of otherwise compliant content, whether overtly or through contextualization. This includes, for example, the aggregation of content with the intent of sexualizing minors.</p><br/>
<p className="text-gray-500 text-[16px] ml-4">-Some content on Bingo is subject to additional requirements. </p>
        </li>
        {/* <li>
Privacy and Protecting Personal Information */}
<li><strong className="text-[18px] text-gray-700 font-semibold">b-Privacy and Protecting Personal Information</strong><br/>
<br/>
<p className="text-gray-500 text-[16px] ml-4">-You are responsible for protecting members’ personal information you receive or process, and you must comply with all relevant legal requirements. This includes applicable data protection and privacy laws that govern the ways in which you can use Bingo user information. These laws may require that you post and comply with your own privacy policy, which must be accessible to Bingo users with whom you interact. Your privacy policy must be compatible with this policy and Bingo’s Terms of Use, and Bingo's Privacy Policy.</p><br/>
<p className="text-gray-500 text-[16px] ml-4">-In particular, when you sell using our Services (subject to this Policy) , you may receive and determine what to do with certain personal information, such as when communicating with users and entering into transactions with buyers. This means you process personal information (for example, buyer name, email address, and shipping address) and, to the extent you do so, under Egyptian law, you are an independent controller of data relating to other users that you may have obtained through the Services. As a data controller (that is someone who decides what personal data is collected and the purpose you’ll use the data for) to the extent that you process user personal information outside of the Services, you may be required under applicable data protection and privacy laws to honor requests received from such users for data access, portability, correction, deletion, and objections to processing. Also, if you disclose personal information without the buyer’s proper consent, you are responsible for that unauthorized disclosure. This includes, for example, disclosures you make or unintentional data breaches. For example, you may receive a buyer’s email address or other information as a result of entering into a transaction with that buyer. This information may only be used for Bingo-related communications or for Bingo-facilitated transactions. You may not use this information for unsolicited commercial messages or unauthorized transactions. Without the buyer’s consent, and subject to other applicable Bingo policies and laws, you may not add any Bingo member to your email or physical mailing list, use that buyer’s identity for marketing, or obtain or retain any payment information. Please bear in mind that you're responsible for knowing the standard of consent required in any given instance. If Bingo and you are found to be joint data controllers of personal information, and if Bingo is sued, fined, or otherwise incurs expenses because of something that you did in your capacity as a joint data controller of buyer personal information, you agree to indemnify, defend and hold Bingo (and its employees, agents, consultants, subsidiaries, partners, affiliates, and licensors) harmless against any claims, costs, losses, damages, liabilities, judgements and expenses (including reasonable attorney fees) in connection with your processing of buyer personal information.</p><br/>
</li>
{/* <li>Communication Standards */}
<li><strong className="text-[18px] text-gray-700 font-semibold">c-Communication Standards</strong><br/>
  <br />
  <ol className=" pl-5 space-y-1 text-gray-500 mt-2 ml-4">
 
    <li><strong className="text-[18px] text-gray-700 font-semibold">1-Messages</strong><br/>
With Bingo's "Messages", you have the ability to communicate directly with your buyers or other Bingo members. Messages are a great way for buyers to ask you questions about an item or an order.<br/>
<ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-4">
  <li>Sending unsolicited advertising or promotions, requests for donations, or spam.</li>
  <li>Harassing or abusing another member or violating our Anti-Discrimination Policy.</li>
  <li>Contacting someone after they have explicitly asked you not to.</li>
  <li>Interfering with a transaction or the business of another member.</li>
  <li>Exchanging personal contact, financial or other information for the purposes of making an off-platform transaction, including phone number, address, email, social media handles, external URLs, instructions for money transfer, QR codes, etc.</li>
</ol>
<strong>--Interference</strong><br/>
Interference occurs when a member intentionally interferes with another member’s shop in order to drive away their business. Interference is strictly prohibited on Bingo. Examples of interference include:<br/>
<ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-4">
  <li>Contacting another member via Messages to warn them away from a particular member, shop, or item.</li>
  <li>Posting in public areas to demonstrate or discuss a dispute with another member.</li>
  <li>Purchasing from a seller for the sole purpose of leaving a negative review.</li>
  <li>Creating or using an independent buyer account to maliciously upvote another shop’s negative reviews in order to position those reviews more prominently.</li>
</ol>
<strong>--Harassment and Discrimination</strong><br/>
Any use of Messages to harass other members is strictly prohibited. Similarly, Messages may not be used to support or glorify hatred or otherwise violate our Anti-Discrimination Policy. If you receive a Message that violates this policy, please let us know right away.<br/>
</li>
<li><strong className="text-[18px] text-gray-700 font-semibold">2-Forums and Teams</strong><br/>
Forums and Teams are public spaces provided by Bingo where sellers can connect, but there are communication standards that must be followed.<br/>
</li>
<li><strong className="text-[18px] text-gray-700 font-semibold">3-Communicating Cancellations</strong><br/>
If you are unable to complete a transaction, you must notify the buyer via Messages and cancel the transaction. If the buyer already submitted payment, you must issue a full refund. You are encouraged to keep proof of any refunds in the event a dispute arises.
</li>
</ol>
</li>
      </ol>
     

        </section>
        {/* section3 */}
        <section id="section3" className="min-h-screen pt-[120px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-600">Feedback, Cases and Your Success </h2>
       


  <ol className="list-[lower-alpha]  pl-5 space-y-1 text-gray-500 mt-2 ml-8">
    <li className="text-[18px] text-gray-700 font-semibold">Reviews<br/>
    <p className="text-gray-500 text-[16px] ml-4">Reviews are a great way for you to build a reputation on Bingo. Buyers can leave a review, including a one to five star rating and a photograph or video of their purchase, within 100 days from the earlier date of their item being delivered (where the shipping carrier’s delivery record is available) or their item’s max estimated delivery date. If an estimated delivery date is not available, the review window opens after the order’s processing time and shipping time have elapsed. Buyers of digital items can leave a review for 100 days from the first time they download the item or within 12 months of purchase (whichever happens first). Buyers can edit their review, including the photograph or video, any number of times during that 100 day period.</p>
  <p className="text-gray-500 text-[16px] ml-4">On the rare occasion you receive an unfavorable review, you can reach out to the buyer or leave a response.</p>
    <p className="text-gray-500 text-[16px] ml-4">In addition to our rules for Creating and Uploading Content in Section 2a, reviews and your response to reviews may not:</p>
   <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-8">
     
      <li>Contain graphic, mature, or obscene language or imagery, or any content that is subject to our mature content policy.</li>
      <li>Be about things outside the seller’s control, such as a shipping carrier, Bingo or a third party.</li>
      <li>Include shillingor otherwise falsely inflate a shop’s review score.</li>
      <li>Undermine the integrity of the Reviews system.</li>
      
        </ol>
        <br/></li>
    <li className="text-[18px] text-gray-700 font-semibold">Bingo’s Case System<br/>
    <p className="text-gray-500 text-[16px] ml-1">The Case system is how a buyer notifies Bingo of an order issue or dispute that they’re unable to resolve with a seller, in order for Bingo to help them reach a resolution. Buyers must contact sellers directly via the Help with Order link and attempt to resolve any outstanding issues before opening a case on Bingo. For this reason, it is important that you fill out your shop policies and regularly respond to Messages from your buyers. Once a buyer contacts you to notify you of a problem with an order, you will have 48 hours to resolve the issue. If the issue is unresolved in this time frame, a case may be opened by the buyer. Once a case has been opened, Bingo will assist in the resolution of the case between the buyer and seller. This may include, but is not </p><br/>
    <p className="text-gray-500 text-[16px] ml-1">limited to, automatically closing the case and issuing a refund to the buyer, or reviewing the case further to help the buyer and seller resolve it as quickly as possible.</p><br/>
    <p className="text-gray-500 text-[16px] ml-1">Bingo reserves the right to resolve an order issue before the 48-hour window for circumstances including, but not limited to, seller inactivity, harassment, refusal of service, manipulation, and undermining the integrity of the case system.</p><br/>
    <p className="text-gray-500 text-[16px] ml-1">
      Buyers may file a case for items that never arrive, arrive late or, arrive damaged, or do not match the listing description as part of Bingo’s Purchase Protection Program Bingo may request your assistance in resolving a case opened against your shop. By using Bingo’s case system, you understand that Bingo may use your personal information for the purpose of resolving disputes with other members. </p><br/></li>
    <li className="text-[18px] text-gray-700 font-semibold">Bingo's Purchase Protection Program for Sellers<br/>
    <p className="text-gray-500 text-[16px] ml-1">For certain cases, sellers are protected by Bingo's Purchase Protection Program. If the case falls outside of Bingo's Purchase Protection Program for Sellers, unless otherwise required by law, you will be required to refund the order, including original shipping and return shipping. Bingo reserves the right to issue a refund to the buyer and recoup funds from your account, including your payment account reserve, if payment was made via Bingo Payments.</p><br/></li>
    <li className="text-[18px] text-gray-700 font-semibold"> Your Seller Account and Bingo’s Terms<br/>
    <p className="text-gray-500 text-[16px] ml-1">In order to keep Bingo safe and improve our Services, we may take actions that limit the visibility of your shop, listings or ads, or that impact your payment account. In the event a shop sees unusual order activity, or we otherwise believe that your actions or shop may result in buyer disputes, chargebacks, increased risk of fraud, counterfeiting, or other claims, Bingo may take actions such as limiting visibility of your account, placing restrictions or reserves on your payments account, or suspending your Bingo account, in accordance with our Terms of Use, including this Policy and our Bingo Payments Policy. When appropriate and permitted by law, Bingo will communicate information to the affected seller about the issue.</p><br/>

    <br/>
  
    <p className="text-gray-500 text-[16px] ml-1">In the event a shop sees an unusual spike in orders, particularly in a high demand category, a shop may see an increase or decrease in its search ranking. Often, if a shop sees an increase in fulfilled orders and good reviews, this may result in higher visibility and search rank. However, sometimes a rapid increase in orders can reduce visibility. Read more about how Bingo search works, and what factors impact search ranking, and how you can help optimize your listings and shop hereand in The Ultimate Guide to Bingo Search.</p><br/><br/>
    <p className="text-gray-500 text-[16px] ml-1">In addition, we may limit the visibility of listings or ads in the interest of keeping Bingo safe, and improving our Services. For example, listings or ads may have decreased visibility because they include terms that represent a prohibited item or based on third party policies. These listings or ads may also be restricted from appearing in one or more features of the Services. While these listings or ads may have limited visibility, they are still discoverable in search.</p><br/><br/>
    <p className="text-gray-500 text-[16px] ml-1">Bingo may make changes to onboarding or authentication processes for sellers at our sole discretion. Completion of these processes may be required for seller account activation or continued access and usage.</p><br/><br/>
    <p className="text-gray-500 text-[16px] ml-1">If Bingo has reason to believe you, Your Content, or your use of the Services violate our Terms, including this Seller Policy, we may deactivate Your Content to some or all users, or suspend or terminate your account (and any accounts Bingo determines are related to your account) and your access to the Services.  Generally, Bingo will notify you that Your Content or account has been suspended or terminated, unless you’ve repeatedly violated our Terms or we have legal or regulatory reasons preventing us from notifying you.</p></li>
  </ol>
     

        </section>
   
     
      
      </main>
    </div>
  );
}
