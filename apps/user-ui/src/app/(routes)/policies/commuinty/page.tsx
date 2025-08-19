
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const sections = [
    { id: "section1", title: "Using the Bingo Community" },
    { id: "section2", title: " Forums" },
    { id: "section3", title: " Ranks & Badges" },
    { id: "section4", title: "Direct Messages" },
    { id: "section5", title: "Squads" },
    { id: "section6", title: "Branding" },
    { id: "section7", title: "Seller Events" },
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
      
            
    <nav className="fixed left-0 top-30 w-[21%] p-4 rounded-lg h-screen ">
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
        <img src="/assets/polices_homepage.webp" alt="" className="w-[100%] h-[5%] rounded-lg"/>
    
<section>
  <h1 className="text-2xl font-bold mb-4 text-gray-700">Community Policy</h1>
<ol className="list pl-5 space-y-1 text-gray-500 mt-2 ml-4 ">

  <li>- Using the Bingo Community</li>
   <li>- Forums</li>
    <li>- Bingo Community Ranks and Badges</li>
     <li>- Direct Messages</li>
      <li>- Squads</li>
       <li>- Branding</li>
        <li>- Seller Events</li>

</ol>
</section>
        <section id="section1" className="pt-[150px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Using the Bingo Community</h2>
          <p className=" text-gray-500">
            -Bingo community spaces include both publicly accessible and signed-in only access areas where sellers can interact with one another. Sellers who use any of the<br />&nbsp; community spaces must be over 18 years old. To make sure that the Bingo community continues to be a place that’s safe, welcoming and respectful, you agree to<br />&nbsp; comply with the following policies in all community spaces:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10 ">
        <li>Respect other members’ privacy, and protect your own. Don't share private or personally identifying information in public areas of the site. This includes, but is not limited to, transaction details, personal contact details and the verbatim contents of private correspondence.</li>
        <li>Do not use community spaces to discuss interactions with Bingo representatives, or to share verbatim extracts of such conversations ( i.e., emails, DMs or messages, live chats etc.). Remember, most messages between you and Bingo are considered private correspondence and we ask that you respect this confidentiality. Please refer to our Privacy Policy for more information.</li>
        <li>Be honest and transparent about who you are. Don't use a fake identity.</li>
        <li>Be respectful towards other sellers and, when in doubt, lead with kindness, assume best intentions and act on that basis. Don't use community spaces to publicly disparage a specific seller, an Bingo representative, shop, listing or category of item.</li>
        <li>Don't use community tools or spaces to interfere with another seller’s business.</li>
        <li>Don't spam. This includes unsolicited or duplicate posts or links to your shop, fundraisers, surveys, social media or other promotional content.</li>
        <li>Don't use community spaces to coordinate pricing or off-platform transactions with other sellers.</li>
        <li>Don't use community spaces to harass other sellers. Similarly, don't post content in community spaces that may promote, support, or glorify hatred, misinformation, or that would be in violation of Bingo’s policies including our Anti-Discrimination Policy.</li>
        <li>Don't publish or post threats of violence against others or promote or encourage others to engage in violence or illegal activity.</li>
        <li>Don't engage in illegal activity or activity that infringes someone's intellectual property, or encourage others to engage in that type of activity.</li>
        <li>Don't use community spaces to encourage others to violate Bingo's policies.
          Continue reading below for some additional policies that apply to you while using specific community spaces.
       </li>
        </ol>
        </section>

        <section id="section2" className="pt-[150px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Forums</h2>
         <p className=" text-gray-500 ml-2">-Forums include both publicly accessible and signed-in only access spaces where sellers can gather with other sellers to discuss their Bingo businesses.<br/>
    </p> <strong className=" font-bold mb-4 text-gray-700 ml-2"> By using Bingo's Forums, you acknowledge and agree that:</strong>
       <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10 ">
    <li>Your role is to help us create a safe space for sellers to learn from one another and grow their businesses.</li>
    <li>Your contributions help us build a public database of valuable knowledge and experiences that are available to everyone.</li>
    <li>Tone is challenging to interpret on a public forum and our community spaces are for Bingo sellers at every level. When in doubt, lead with empathy and kindness.</li>
    <li>Your posts will stay on topic. Off topic posts may be removed.</li>
    <li>Your posts in the Forums are permanent and can be viewed in various places including your User Profile (unless they are removed by Bingo).</li>
    <li>Your posts should be helpful, constructive, and encouraging when voicing dissent or criticism. Don't harass, target, insult, troll, or call out other members or Bingo representatives.</li>
    <li>Moderators may take certain actions to keep the Forums welcoming, organized, and helpful for everyone. Such actions are not up for public discussion.</li>
    <li>You will respect others’ opinions and report content responsibly. Flagging posts is reserved for content that specifically violates Bingo's policies.</li>
    <li>Bingo reserves the right to remove content from the Forums at any time for any reason, including, for example, violation of our policies, removal of dormant content, content that causes privacy issues, or due to changes to how the Forums operate.</li>
    <li>If you have concerns about actions taken in the forums, you can follow these instructions to contact Bingo Support.</li>
  </ol>
        </section>

        <section id="section3" className="pt-[150px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Bingo Community Ranks and Badges</h2>
        <p className=" text-gray-500 ml-2">-Registered Bingo community members have the opportunity to earn ranks and badges for participation in our community spaces and programming. Community <br />   &nbsp;&nbsp;ranks and badges are determined by a number of factors, including but not limited to:
      </p>  
      <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10 ">
    <li>How much you’ve read in the Community Space</li>
    <li>How many posts you’ve written</li>
    <li>How often members find your posts helpful</li>
    <li>How often you’ve liked other members’ posts</li>
    <li>Participation in Bingo programs</li>
    <li>Features such as Community Spotlights</li>
  </ol>
  <br/>
  <strong className=" font-bold mb-4 text-gray-700">Ranks you can earn in the Bingo Community include:</strong><br/>
  <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10 ">
    <li>Bingo Seller: You have an Bingo shop.</li>
    <li>Reader: You've read a few threads.</li>
    <li>Avid Reader: You've read a few more, and liked some posts, too.</li>
    <li>Community Navigator: You have a track record of reading the Forums and avidly share your appreciation for posts you like.</li>
    <li>Inspiration Seeker: You posted in the Forums. Thank you for your contribution!</li>
    <li>Post Crafter: You shared your thoughts and questions a few times.</li>
    <li>Crafty Poster: You appreciated others and your posts are appreciated too.</li>
    <li>Conversation Maker: You posted helpful answers to the community’s questions.</li>
    <li>Community Maker: You reliably answered a lot of the community's questions. People like you help make the Bingo Community what it is.</li>
    <li>Inspiration Maker: You're an inspiration to others! You've been helping to build the community with your contributions and have been a member of our Community for at least two years.</li>
  </ol><br/>
  <p className=" text-gray-500 ml-2">-Badges are awarded for achieving certain ranks or participating in specific Bingo programs. Badges that you’ve been awarded will appear on your community <br />   &nbsp;&nbsp;profile and on your My Badges page. Go here to learn more about ranks and badges. Bingo reserves the right to deem any activity that violates its Community <br />   &nbsp;&nbsp;Policy ineligible towards advancing your Community Rank. Bingo reserves the right to add, modify or remove ranks to accommodate product updates or changes <br />   &nbsp;&nbsp;in the community.

 </p>
        </section>

        <section id="section4" className="pt-[150px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Direct Messages</h2>
        <p className=" text-gray-500 ml-2">-Members may send each other direct messages using the Community's built-in messaging system. These messages are separate from Bingo Messages and can be<br />   &nbsp; accessed and read when you are in community spaces.<br/>
      </p> <br />
      <p className=" text-gray-700 ml-2 font-bold">By using direct messages in the Bingo Community, you agree to all of the above policies. In addition, you may not send messages that are considered:
      </p>  
        <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10 ">
    <li>Abusive, threatening, defamatory, harassing, or otherwise in violation of our Anti-Discrimination Policy.</li>
    <li>Obscene or vulgar.</li>
    <li>Unsolicited advertising or promotions.</li>
  </ol><br/>
<p className=" text-gray-500 ml-2">-If you receive an inappropriate message, report the content to Bingo. To do so, go to your Direct Messages inbox, open up the message contents and use the<br />   &nbsp; “Report as inappropriate” function to bring it to Bingo’s attention for review.
    </p>    
        </section>
         <section id="section5" className="pt-[150px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Squads</h2>
     <p className=" text-gray-500 ml-2"> -Bingo Squads is a community feature where you can connect with Bingo sellers to help you grow your business. Bingo Squads are self-organized by members and <br />   &nbsp; not run by, part of, or affiliated with Bingo.<br/>
       </p>  <strong className=" font-bold mb-4 text-gray-700 ml-2">By using Bingo’s Squads feature, you acknowledge and agree that:</strong>
          <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-10 ">
    <li>Except as set forth below, Bingo is not responsible for or involved in a Squad’s membership policies, dues, finances, or any other actions.</li>
    <li>Squads that do not comply with Bingo's policies, including our Anti-Discrimination Policy, may be removed, and Bingo reserves the right to remove a Squad or limit access to the creation of new Squads for any reason.</li>
    <li>Bingo will not mediate disputes between Squads and outside parties, nor disputes between Squads and Squad members.</li>
    <li>Bingo will not monitor third-party forums or other independent Squad sites.</li>
    <li>Any use of the term "Bingo," Bingo’s visual marks such as the stylized Bingo name logo or “E” logo, other Bingo Trademarks (all trademarks worldwide owned by Bingo and its affiliates), or marks confusingly similar to the Bingo Marks must comply with Bingo’s Trademark Policy and our Squad branding guidelines. See below for more details.</li>
    <li>A Squad may not use mature, profane, or hateful language or images in the Squad's name, banner, or logo.</li>
    <li>A Squad may not be used for the sole purpose of redirecting traffic to another web location. Bingo reserves the right to remove links on any profile page or Squad page for any reason. Unsolicited promotion or advertisement from representatives or affiliates of outside services, websites, or other products is not allowed.</li>
    <li>Squads are created by and run by Squad Captains. A Squad must have a Captain in place in order to function successfully.</li>
    <li>Squad Captains are responsible for moderating their Squad’s content. In addition, Squad Captains may appoint additional roles and responsibilities to their members.</li>
    <li>Squads that are inactive for 6 months or more, or who do not have a Squad Captain in place to moderate the Squad, are subject to removal from the platform and cancellation at Bingo’s discretion. This includes revocation of the right to use Bingo’s name or the Bingo Trademarks.</li>
    <li>Squad forums and on-site publications (i.e., blogs and knowledge base articles) are subject to this Community Policy and may not be used to demonstrate or discuss disputes with other members or with Bingo.</li>
    <li>A Squad may have a charter detailing membership requirements and expectations for the Squad. Squad leadership is responsible for enforcing the Squad's charter. A Squad's charter must abide by all of Bingo's policies, including our Terms of Use and Intellectual Property Policy.</li>
    <li>If a Squad chooses to use a dedicated item listing tag (also called a “Squad tag”), it must contain the word "Squad." Bingo will not mediate disputes regarding use of Squad tags on item listings.</li>
    <li>Squad Captains may be granted permission to upload rich content to their Bingo Squad including videos, images and photos. Any rich content uploaded to the platform must comply with Bingo’s Terms of Use.</li>
    <li>Bingo reserves the right to remove content and users from Squads at its sole discretion, including but not limited to members, Squad Captains and dormant or inappropriate content.</li>
    <li>Bingo may limit, modify or remove access to specific Squads tools and permissions without notice to members if a Squad’s activity is deemed a violation of the Community Policy or if necessary to improve the product experience and keep our community safe.</li>
  </ol>
        </section>
         <section id="section6" className="pt-[150px] ">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Branding Guidelines for Squads and Captains of Squads</h2>
     <p className=" text-gray-500 ml-2">-Squads must adhere to these branding guidelines when identifying as an Bingo Seller Squad.
        You can use the word Bingo in the name of your Squad. (e.g. Bingo <br />   &nbsp; Greek Squad, Brighton Bingo Squad). However, you cannot use the term ‘Bingo’ alone, or the Bingo logo by itself in your Squad name, or in any promotional <br />   &nbsp;&nbsp;materials that reference your Squad in any manner.
      </p>
       <br/>
       <strong className=" font-bold mb-4 text-gray-700 ml-2">Things to keep in mind when creating an Bingo Squad Logo:</strong><br/>
        <ol className="list-decimal pl-5 space-y-1 text-gray-500  ml-10 ">
    <li>You cannot use the Bingo logo to promote your Squad without your Squad name included at any time.</li>
    <li>You can create a stand-alone Bingo Squad logo so long as your Squad name is clearly presented on the logo image.</li>
    <li>If you use the word “Bingo” in your Squad logo, you must make sure it is not the most prominent or the largest word visually on the logo image.</li>
    <li>If you are promoting your Squad or any Squad related activities, you must include the terms “Organized by a Squad of Bingo sellers” visibly and prominently. It is also your responsibility to make it clear that you are not an agent or employee of Bingo.</li>
    <li>You are solely responsible for any costs relating to your use of all promotional materials, venues or other items used to promote your Squad.</li>
  </ol><br/>
<p className=" text-gray-500 ml-2">- Bingo does not pre-approve Squad branding and we reserve the right to take action on any usage brought to our attention that causes confusion, potential harm <br />   &nbsp;&nbsp; to the Bingo brand, or is in direct violation of our Trademark Policy. In particular:<br/>
  &nbsp;&nbsp;&nbsp;Squads’ use of the Bingo name and Bingo Trademarks is subject to periodic Bingo’s review at any time, and Bingo may require changes in your use of the Bingo<br />   &nbsp;&nbsp; Trademarks to comply with Bingo policies,including our Trademark Policy, Bingo’s marketing needs, or to ensure Bingo’s Trademarks are not used in a way that  <br />   &nbsp;&nbsp;suggests your Squad is affiliated with, or part of Bingo, Inc. In addition, you may not use the Bingo Trademarks or similar marks in a way that tarnishes or causes <br />   &nbsp;&nbsp;harm to Bingo’s brand or reputation, or in relation to non-Bingo services. At Bingo’s sole discretion, including if you violate this policy, or any of Bingo’s Terms of <br />   &nbsp;&nbsp; Use, Bingo reserves the right to revoke your right to use the Bingo Trademarks.
         </p>
        </section>
         <section id="section7" className="pt-[150px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Seller Events</h2>
      <p className=" text-gray-500 ml-2">-Bingo may promote seller-focused virtual or in-person events and activities including educational workshops, markets and summits. Sellers participate in events at <br />   &nbsp;&nbsp;their own discretion.
       Bingo does not sponsor seller-led events unless otherwise specified. While Bingo sellers may describe their events as "organized by Bingo <br />&nbsp;&nbsp;sellers", sellers may not prominently use the Bingo name or logo in a manner that suggests the event is organized or run by Bingo. Bingo may periodically review <br />   &nbsp; the use of the Bingo name and Bingo Trademark, and may revoke the right to use the Bingo name or Bingo Trademarks at any time, for any reason.
      
      </p > <br/>
 <p className=" text-gray-500 ml-2">-Bingo may take action, including termination or suspension, on any account that violates these policies. For example, we may temporarily or permanently suspend <br />   &nbsp;&nbsp;your community posting privileges, remove your community access or close your Bingo account, which will immediately suspend all Bingo shop activity. If we do  <br />   &nbsp;&nbsp;so, it’s important to understand that you don’t have a contractual or legal right to continue to use our Services, including Community spaces or the Bingo <br />   &nbsp;&nbsp;Trademarks. Generally, Bingo will notify you that your account has been terminated or suspended, unless you’ve repeatedly violated this policy or our Terms or we <br />   &nbsp; have legal or regulatory reasons preventing us from notifying you.
        </p>
        </section>
      </main>
    </div>
  );
}
