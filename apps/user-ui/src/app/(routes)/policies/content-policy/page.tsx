
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const sections = [
    { id: "section1", title: "Policies that apply to you and your content" },
    { id: "section2", title: "How we detect violating content" },
    { id: "section3", title: "How we enforce on violating content" },
    { id: "section4", title: "Appeals" },
   
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

     
      <main className="ml-[340px] p-8 space-y-10 scroll-smooth">
     <div className="bg-[url('/assets/polices_homepage.webp')] bg-cover bg-center w-[100%] h-96 rounded-lg shadow-lg mb-8 flex flex-col items-start justify-center gap-10">
  <h1 className="text-[80px] text-white font-bold drop-shadow-lg ml-20"></h1> 
 <div> <p className="text-gray-400 ml-20 "><span className="text-white"></span></p></div>
</div>
<section>
  <h1 className="text-2xl font-bold mb-4 text-gray-700">Content Moderation</h1>
    <p className="text-gray-500 text-[16px] ml-4">
        -The creativity of our sellers and the items they create are what makes
        Our Bingo special, and offer everything from the specific to the
        unexpected. <br />&nbsp;&nbsp;With this in mind, we develop and enforce content policies
        that help us Keep Commerce Human, so that we can empower our sellers and
        provide<br />&nbsp;&nbsp; buyers with the best experience possible.
      </p><br />
      <p className="text-gray-500 text-[16px] ml-4">
        -Bingo takes user safety and well-being seriously, and utilizes people,
        policies, and technology to enforce our content moderation policies. As
        a baseline, <br />&nbsp;&nbsp;we work to remove harmful and fraudulent content from the
        platform. Beyond this, we also expect that content aligns with the
        mission of our brand, and <br />&nbsp;&nbsp;we develop these policies with our co values
        in mind.
      </p><br />
      <p className="text-gray-500 text-[16px] ml-4">
        -We strive to consistently enforce our policies and hold all members
        accountable to the same standards, in order to strengthen trust in our
        community<br />&nbsp;&nbsp; and maintain the integrity of our platform. This goal is
        achieved through human review, automated tooling and processes, quick
        action upon notice of <br />&nbsp;&nbsp;an issue, cooperation with experts and regulators,
        educating Bingo’s member community, and a continuing commitment to a
        thoughtful content <br />&nbsp;&nbsp;moderation strategy.
      </p>
</section>
        <section id="section1" className="pt-[100px] pb-[100px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Policies that apply to you and your content</h2>
     <p className="text-gray-500 text-[16px] ml-4">  -Bingo policies allow us to moderate Your Content, which includes listings, messages, reviews, images, videos, and all other content posted  using<br />&nbsp;&nbsp; Bingo Services (as these terms are defined by the Terms of Use). We retain the right to employ enforcement mechanisms on an account when <br />&nbsp;&nbsp;&nbsp;these policies are not followed.
      The following are key policies that apply, in whole or in part, to the content created by our members, including <br />&nbsp;&nbsp;&nbsp;but not limited to:
      </p>
      <ul className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-8">
        <li>Seller Policy</li>
        <li>Buyer Policy</li>
        <li>Prohibited Items Policy</li>
        <li>Handmade Policy</li>
        <li>Vintage Items on Bingo</li>
        <li>Craft Supplies</li>
        <li>Anti-Discrimination and Hate Speech Policy</li>
        <li>Community Policy</li>
        <li>Intellectual Property Policy</li>
      </ul><br />
      
   <p className="text-gray-500 text-[16px] ml-4">  -If Bingo has reason to believe you, Your Content, or your use of the Services violate our Terms, we may deactivate Your Content to some or<br />&nbsp; all users, or suspend or terminate your account (and any accounts Bingo determines is related to your account) and your access to the Services.<br />&nbsp; Generally, Bingo will notify you that Your Content or account has been suspended or terminated, unless you’ve repeatedly violated our Terms or<br />&nbsp; we have legal or regulatory reasons preventing us from notifying you.,
   </p> 
        </section>

        <section id="section2" className="">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">How we detect violating content</h2>
     <p className="text-gray-500 ml-4 text-[16px]">-Our team uses a combination of automated systems and human review by enforcement specialists to detect and remove policy violating listings<br />&nbsp; and shops. Violations may be brought to our attention in any of the following ways:
      </p>
       <ul className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-8">
      <li>Users: Listings can be reported directly to Bingo, such as through the ‘Report this Item to Bingo’ button on the bottom of each listing page.</li>
      <li>Regulatory reports: Inbound reports from government agencies help Bingo identify non-compliant sellers and content.</li>
      <li>Automated systems: Our automated systems attempt to identify violative content within seller content. Upon detection, the content is then reviewed and/or removed.</li>
      <li>Internal agents: Bingo internal agents may scan Bingo to identify violating content.</li>
    </ul>
        </section>

        <section id="section3" className="pt-[100px] pb-[100px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">How we enforce on violating content</h2>
         
      <p className="text-gray-500 ml-4 text-[16px]">-In order to keep Bingo safe and improve our services, we may take actions that restrict or suspend a shop, account, or listings content. We may also<br />&nbsp; take actions on a user’s payment account by holding seller funds. If we determine that a flagged item violates Bingo’s policies, the enforcement action<br />&nbsp; we take may vary based on the nature and severity of the violation. For example, we may suspend a seller’s payment deposit, deactivate a listing, restrict<br />&nbsp; a listing from some or all members, or suspend an account. We may use a combination of manual enforcement and an automated system to send <br />&nbsp;&nbsp;warning notifications and ultimately suspend the account of sellers who have repeatedly had listings deactivated due to policy violations,</p>
   
 
        </section>
         <section id="section4" className="">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Appeals</h2>
          <p className="text-gray-500 ml-4 text-[16px]">-Bingo’s marketplace presents unique challenges for content moderation detection and enforcement. These challenges include the breadth of Bingo’s <br />&nbsp;independent sellers’ offerings, the non-standardized nature of those items and the listing content used to describe them. Bingo iteratively updates its <br />&nbsp;tools, controls, and enforcement to increase their effectiveness and reach, but occasionally, inaccurate enforcement actions are taken, policies are updated <br />&nbsp;such that the enforcement outcomes change, or members have experienced extenuating circumstances. We provide routes to appeal for users whose <br />&nbsp;listings or accounts have been impacted by Bingo enforcement actions.</p>
       <br/> 
       {/* <strong>Listing</strong> */}
       < strong className="text-gray-700 ml-6 text-bold text-[18px]">Listing:</strong>
       <br/>
      <p className="text-gray-500 ml-6 text-[16px]">-Appeals for listing suspensions may be available in some cases.</p>
       <br/>
       < strong className="text-gray-700 ml-6 text-bold text-[18px]">Account:</strong>
       {/* <strong>Account</strong> */}
       <br/>
      <p className="text-gray-500 ml-4 text-[16px]">-Accounts may be permanently or temporarily suspended.</p><br/>
      <p className="text-gray-500 ml-4 text-[16px]">-If your account has been temporarily suspended, you’ll generally receive an email from Bingo explaining what happened and how to resolve the <br />&nbsp;&nbsp;suspension. The suspension will remain until these issues are resolved. If you’re a seller, you may see a banner in your Shop Manager Dashboard.<br />&nbsp; If your account is permanently suspended, the email from Bingo will specify this. You may be able to appeal a permanent suspension once you <br />&nbsp;&nbsp;resolve the issues that led to the suspension. The suspension will remain unless your appeal is accepted. Please note that you have 6 months<br />&nbsp; from the day your account was suspended to file an appeal, and if you miss this window, your account will remain permanently suspended</p>
       
 
        </section>

     
      </main>
    </div>
  );
}
