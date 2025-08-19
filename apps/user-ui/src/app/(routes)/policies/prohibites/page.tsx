
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const sections = [
    
 { id: "section1", title: "Alcohol, Tobacco & Drugs" },
{ id: "section2", title: "Animal Products & Human Remains" },
{ id: "section3", title: "Hazardous & Dangerous Items" },
{ id: "section4", title: "Hate Items" },
{ id: "section5", title: "Illegal & Regulated Items" },
{ id: "section6", title: "Nudity & Mature Content" },
{ id: "section7", title: "Violent Items" },

   
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

     
      <main className="ml-[22%] space-y-12 scroll-smooth">
        <img src="/assets/prohibites-612x612.jpg" alt="" className="w-[100%] h-[5%] rounded-lg " />
     {/* <div className="bg-[url('/assets/prohibites-612x612.jpg')] bg-cover bg-center w-[100%] h-96 rounded-lg shadow-lg mb-8 flex flex-col items-start justify-center gap-10"> */}
  <h1 className="text-[80px] text-white font-bold drop-shadow-lg ml-20"></h1> 
 <div> <p className="text-gray-400 ml-20 "><span className="text-white"></span></p>
 {/* </div> */}
</div>
<section className=" ">
  
  <h1 className="text-gray-700 font-bold text-[32px]">
  Prohibited Items Policy
</h1><br />
 <ul className="space-y-3">
  <li className="flex gap-2">
    {/* <div className="w-3 h-1 bg-gray-700 rounded-full mt-2"></div> */}
    <p className="text-gray-500 text-[16px] ml-4">
      -We have a zero tolerance policy for prohibited items, particularly those that promote, 
      support or glorify hatred, those that promote, support or glorify violence,<br />   &nbsp;&nbsp; or are unlawful.
      Sellers deemed to violate this policy can be subject to immediate account suspension or 
      termination, in accordance with our Terms of Use.
    </p>
  </li>
  
  <li className="flex gap-2">
    {/* <div className="w-3 h-1 bg-gray-700 rounded-full mt-2"></div> */}
    <p className="text-gray-500 text-[16px] ml-4">
      -This policy is a part of our Terms of Use. By opening an Bingo shop, you’re agreeing to this policy 
      and our Terms of Use. If Bingo has reason to believe you, your <br />   &nbsp;&nbsp;&nbsp;content, or your use of the Services 
      violate our Terms, we may deactivate your content or suspend/terminate your account. Generally, Bingo 
      will notify you unless <br />   &nbsp;&nbsp;&nbsp; you’ve repeatedly violated our Terms or we have legal/regulatory reasons 
      preventing us from notifying you. </p><br />
      
  </li>
   <p className="  mb-3 font-bold text-gray-700 ml-4 text-[20px]">The following types of items are prohibited or restricted on Bingo: 
    </p>
</ul>

       <ol className="list-decimal pl-5 space-y-1 text-gray-500 mt-2 ml-6">
  <li>Alcohol, Tobacco, Drugs, Drug Paraphernalia, Medical Drugs and Devices, and Items making Medical Claims</li>
  <li>Animal Products and Human Remains</li>
  <li>Dangerous Items: Hazardous Materials, Recalled Items, and Weapons</li>
  <li>Hate Items: Items that Promote, Support, or Glorify Hatred</li>
  <li>Illegal Items, Items Promoting Illegal Activity, and Highly Regulated Items</li>
  <li>Nudity and Mature Content</li>
  <li>Violent Items: Items that Promote, Support, or Glorify Violence</li>
</ol><br />
<ul className="space-y-4">
  <li className="flex gap-2">
    {/* <div className="w-2 h-2 bg-gray-700 rounded-full mt-2"></div> */}
    <p className="text-gray-500 text-[16px] ml-4">
      -Art and history can be provocative, emotional, and divisive. There are some topics on which 
      we may never reach a consensus as a community, and that is okay.<br />   &nbsp; In the words of Joyce Carol Oates, 
      “art should not be comforting; for comfort, we have mass entertainment and one another. 
      Art should provoke, disturb, arouse <br />   &nbsp;our emotions, expand our sympathies in directions we may not 
      anticipate and may not even wish.”
    </p>
  </li>

  <li className="flex gap-2">
    {/* <div className="w-2 h-2 bg-gray-700 rounded-full mt-2"></div> */}
    <p className="text-gray-500 text-[16px] ml-4">
      -In order to help provide clarity and insight into our policy making process, we have included the 
      rationale behind our decisions and details about how they <br />   &nbsp;will be enforced, including some.
    </p>
  </li>

  <li className="flex gap-2">
    {/* <div className="w-2 h-2 bg-gray-700 rounded-full mt-2"></div> */}
    <p className="text-gray-500 text-[16px] ml-4">
      -Representative examples below of what is allowed on Bingo. We reserve the right to remove listings 
      that we determine are not within the spirit of Bingo.<br />   &nbsp; Violating this policy may result in the member's 
      selling privileges being suspended and/or terminated.
    </p>
  </li>
</ul>

</section>
{/* section1 */}
  <section id="section1" className="  pt-[150px]">
   {/* <h2>Alcohol, Tobacco & Drugs</h2> */}
  <h2 className="text-[22px] font-bold mb-4 text-gray-700">Alcohol, Tobacco, Drugs, Drug Paraphernalia, and Medical Drugs and Devices, and Items making Medical Claims</h2>
      <p className="text-gray-500 ml-4"> -Alcohol, tobacco, and drugs are prohibited on Bingo. These items may be subject to legal requirements and, in some cases, are considered controlled substances <br/>&nbsp;   under applicable law</p>
<p  className="text-gray-500 ml-4">-Our policy also applies to medical drugs, medical devices, and any other item that claims to treat, prevent, mitigate, cure, or diagnose a disease or medical  <br/>&nbsp;   condition. Possible legal restrictions aside, these items are not in the spirit of Bingo.</p><br/>
   
   <strong className="text-gray-700 ml-4 text-bold text-[18px]">More Details:</strong>
      
 <ul className="list-decimal list-inside space-y-2 mt-2 text-gray-700  whitespace-pre-line ml-6">
              <li>Alcohol.</li>
              <li>Tobacco products, smokeable products, e-cigarettes, and e-liquid.</li>
              <li>
                Drugs and certain herbal substances, including substances used for recreational and medicinal purposes, regardless of their legality. <br /> &nbsp;&nbsp;&nbsp; We prohibit depictions of these substances in listing photos, as well as listings for instructions or materials intended to create such items.
              </li>
              <li>
                Drug paraphernalia, including, for example: items with a carburetor; slides and/or items with a slide; bongs and bubblers; vaporizers and their components.
              </li>
              <li>Medical drugs and regulated medical devices.</li>
              <li>Items making certain medical claims.</li>
            </ul>
        </section>
{/* section2 */}
        <section id="section2" className=" pt-[150px]" >
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Animal Products and Human Remains</h2>
   <p className="text-gray-500 text-[18px] ml-4">-Certain animal products are highly regulated and prohibited on Bingo due to the risk of harm to live, companion, or endangered animals.</p><br/><br/>
  <strong className="text-gray-700 ml-4 text-bold text-[18px]">More Details:</strong>
   {/* <ul className="list-decimal list-inside space-y-2 mt-2 text-gray-700  whitespace-pre-line"> */}
     <ul className="list-decimal list-inside space-y-2 mt-2 text-gray-700  whitespace-pre-line ml-6">
              <li>Live animals.</li>
              <li>
                Items created using any endangered or threatened animal species. We define these as animal species
                designated  as threatened or endangered by the Egyptian <br />   &nbsp;&nbsp;&nbsp;Endangered Species Act or listed in Appendix I
                of the Convention on International Trade in Endangered Species of Wild Fauna and Flora (CITES).
              </li>
              <li>Items made from cat and dog parts or pelts as defined by Egyptian Law.</li>
              <li>
                Ivory or bones from ivory-producing animals, including tusks, elk ivory, fossilized ivory, and wooly mammoth ivory.
              </li>
              <li>Items made from human remains or products from the human body, except for teeth, fingernails, and hair.</li>
            </ul>




 
        </section>

        {/* section3 */}
         <section id="section3" className=" pt-[150px] ">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Dangerous Items: Hazardous Materials, Recalled Items, and Weapons</h2>
          <p className="text-gray-500 ml-4 text-[18px]">-For safety and legal reasons, we prohibit certain dangerous items from our marketplace.</p><br/>
      <strong className="text-gray-700 ml-4 text-bold text-[20px]">More Details:</strong>
   {/* <ul className="list-decimal list-inside space-y-2 mt-2 text-gray-700  whitespace-pre-line"> */}
     {/* <ul className="list-decimal list-inside space-y-2 mt-2 text-gray-700  whitespace-pre-line ml-6"> */}
       <br/>
        <strong className="text-gray-700 ml-4 text-bold text-[20px]">Hazardous Materials</strong>
      <p className="text-gray-500 ml-6 "> -Due to the potential harm caused by hazardous materials, as well as complex legal and shipping regulations surrounding such materials, hazardous materials are  <br/>&nbsp; prohibited on Bingo. We also prohibit kits, instructions, patterns, and designs enabling the creation of these items.</p>
       
       <p className="text-gray-500 ml-6 ">-While not exhaustive, the following materials are examples of prohibited hazardous materials:</p>
       <ul className="list-decimal list-inside space-y-2 mt-2 text-gray-500  whitespace-pre-line ml-12">
        <li>Explosives (fireworks or sparklers)</li>
        <li>Explosive precursors</li>
        <li>Flammable items</li>
        <li>Gases</li>
        <li>Radioactive material</li>
        <li>Toxic substances (such as poisons)</li>
        <li>Individual or loose lithium ion batteries</li>
      </ul><br />
      <p className="text-gray-500  mb-3 ml-4">- Some ingredients are considered hazardous when found in certain contexts. Recalled Items or Items that May Pose a Health or Safety Hazard. Items that have been  <br/>&nbsp;  recalled by governments or manufacturers are prohibited from being sold on Bingo. A few examples of items that have been recalled are certain vintage Corning  &nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp; Ware percolators,lawn darts, and drop side cribs. </p>
      <p className="text-gray-500  mb-3 ml-4">- Items that may pose a health or safety hazard are prohibited, even if they have not been the subject of a recall. This would include, for example, items that present <br/>&nbsp;  achoking, electrocution, or strangulation hazard. We rely on information from user reports and various government agencies to identify these items. </p>
      <p className="text-gray-500  mb-3 ml-4">- Bingo prohibits certain loose or separable high-powered magnets that fit into a 2.25 inches long and 1.25 inches wide “small parts” cylinder and have a flux of 50<br/>&nbsp;  kG2 mm2 or more, because of the safety risk they pose if swallowed. </p>
       <strong className="text-gray-700 ml-4 text-bold text-[20px]">Weapons</strong>
      <p className="text-gray-500 ml-4 ">
        -Context matters when it comes to defining what is or is not a weapon.
        When in doubt, it’s safe to assume that we won’t allow any item intended to be used as a <br/>&nbsp; weapon to inflict harm.
        The following items are generally not allowed on Bingo:
      </p>

      <ul className="list-decimal list-inside space-y-2 mt-2 text-gray-500  whitespace-pre-line ml-12">
        <li>Guns, knives, or other blatant weapons, even if they are vintage.</li>
        <li>Imitation firearms and weapons that look real or are prohibited by Egyptian law.</li>
        <li>Patterns, designs, plans, or instructions, for the creation of prohibited weapons.</li>
      </ul>
 
        </section>
        {/* section4 */}
        <section id="section4" className=" pt-[150px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Hate Items: Items that Promote, Support, or Glorify Hatred</h2>
   <p className="text-gray-700  mb-3 ml-4">
   - We want Bingo to be a community where people of all backgrounds, nationalities, religions,
    and even different types of artistic taste and humor feel welcome.
    Art is <br/>&nbsp;  incredibly subjective, and what is offensive to one is not necessarily offensive to others.
  </p>
 <strong className="text-gray-700 ml-4 text-bold text-[20px]">More Details:</strong>
  <p className="text-gray-500  ml-4">- Bingo does not allow items or listings with violent or degrading language toward people based upon: race, ethnicity, national origin, religion, gender, identity, <br />&nbsp; disability, sexual orientation, immigration status, or caste (collectively, “protected classes”). We also prohibit items or content that promote organizations with such <br />&nbsp; views.</p><br/>

<p className="  mb-3  text-gray-700 ml-4 font-bold text-[20px]">The following items are not allowed on Bingo:</p>
 <ul className="list-decimal list-inside space-y-2 mt-2 text-gray-500 ml-6">
        <li>Content which directly or indirectly contains violent or degrading commentary against protected classes.</li>
        <li>Items that support or commemorate current or historical hate groups or their leaders, including propaganda or collectibles.<br/> &nbsp;  Examples of hate groups include Nazi or Neo-Nazi groups, white supremacist groups, misogynist groups, anti-immigrant.</li>
        <li>Items that contain slurs or derogatory terms in reference to protected classes.</li>
      </ul>


 
        </section>
{/* section5 */}
 <section id="section5" className=" pt-[150px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Illegal Items, Items Promoting Illegal Activity, and Highly Regulated Items</h2>
   <p className="text-gray-500  mb-3 ml-4 text-[18px]">-
   We respect the law and expect Bingo sellers to respect the law as well.
  </p>
< strong className="text-gray-700 ml-4 text-bold text-[18px]">More Details:</strong>
  <p className="text-gray-500  mb-3 ml-4">- Illegal items, items that promote illegal activity, and stolen items are not allowed on Bingo. Neither are certain items that are subject to complex legal regulations <br/> &nbsp;&nbsp;or registration systems. We require sellers to follow all applicable laws for the items they list. Listings may be unavailable for users in regions where the item is<br /> &nbsp; restricted to purchase or sell.</p>
<p className="text-gray-500 ml-4">- Because Bingo is a Egyptian team, it’s important to abide by the laws of the markets in which you are selling. What is legal in one country may be illegal in another.   <br /> &nbsp;&nbsp;&nbsp;All forms of illegal activity are strictly prohibited. This includes, but is not limited to the sale of:</p>

 <ol className="list-decimal list-inside space-y-2 mt-2 text-gray-500 ml-8 ">
  <li>Unauthorized or counterfeit goods</li>
  <li>Personal information</li>
  <li>Highly regulated items, such as currency and real estate</li>
  <li>
    Listings which facilitate or promote illegal activity, such as:
    <ol className="list-[lower-alpha] list-inside ml-6 mt-1 space-y-1 text-gray-500  ">
      <li>Impersonation</li>
      <li>Evasion of the detection of illegal activity</li>
      <li>Falsified qualifications</li>
    </ol>
  </li>
</ol>
<p className="text-gray-500 ml-4">
  - Unauthorized replicas or copies of items, and patterns or designs enabling their creation, are prohibited on Bingo,
  We consider counterfeit or unauthorized goods <br /> &nbsp;&nbsp; to be  items that imitate an authentic good,
  particularly by using a brand’s name, logo, or protected design without the brand owner’s consent.
  Additionally, we <br /> &nbsp;&nbsp; may consider up-cycled or re-purposed items, even if using authentic materials,
  to be counterfeit if they are making use of a brand's name, logo, or protected <br /> &nbsp;&nbsp; design without  their  permission.
  Examples of prohibited counterfeit or unauthorized goods include replica luxury and non-luxury items
  like bags and branded <br /> &nbsp;&nbsp; apparel.
</p><br />

<p className="text-gray-500 ml-4">- We also prohibit content which infringes on the privacy, publicity, and personal rights of others.</p><br />
<p className="text-gray-500 ml-4 ">
 - Personal information may not be sold, for instance as part of a data bank or mailing list.
  The sale of personal or government documents, such as credit cards,<br /> &nbsp;&nbsp;&nbsp; identification cards, and licenses
  is also prohibited.
</p><br />

<p className="text-gray-500 ml-4">
- Given associated regulations, lottery tickets, cryptocurrency mining rigs, and current, exchangeable currency and postage may not be sold on Bingo.
<br /> &nbsp;&nbsp;&nbsp;  We also prohibitthe sale of financial instruments such as stocks, bonds, and other securities.
  Handmade items containing any of these items in a usable<br /> &nbsp;&nbsp;&nbsp; condition are also not allowed.
  Collectible postage or currency that priced at less than 1,000 USD are allowed unless subject to legal or other restrictions.<br /> &nbsp;&nbsp;&nbsp;
  Collectible currency may not be offered as 'unsearched' or as a mixed lot of unknown contents.
  Additionally, due to complex legal
</p><br />
<p className="text-gray-500 ml-4 ">
  - Restrictions that vary by location, Bingo does not permit the sale of real estate, housing, or motor vehicles
  (for example: automobiles, motorcycles, boats,<br /> &nbsp;&nbsp;&nbsp; travel trailers, etc.).
</p><br />

<p className="text-gray-500 ml-4 ">
  - Items may not aid in impersonation.
  We prohibit realistic items that identify the wearer as an active law enforcement, military, or government official.
</p><br />

<p className="text-gray-500 ml-4 ">
  - We prohibit items which are intended to evade the detection of illegal activity, such as radar detectors, license plate covers,<br /> &nbsp;&nbsp;&nbsp;
  and materials for faking drug tests.
</p><br />

<p className="text-gray-500 ml-4">
  - We also prohibit certain items that may be used for falsified qualifications.
  This includes rideshare company decals, diplomas for higher learning or professional <br /> &nbsp;&nbsp;&nbsp;licenses,
  and bank statements and pay stubs, including templates.
  Consequently, items meant to fraudulently deceive others about one’s medical status are<br /> &nbsp;&nbsp; prohibited.
  This includes items such as fraudulent test results, or items designating an animal as a service animal.
  We also prohibit items which deceptively infringe <br /> &nbsp;&nbsp;&nbsp;on someone’s privacy,
  such as concealed cameras or tracking devices, and lockpicking devices.
</p><br />


 
        </section>
      {/* section6 */}
      <section id="section6" className="  pt-[150px] ">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Nudity and Mature Content</h2>
      <p className="text-gray-500 ml-4">
  -As a creative community, we tend to be fairly liberal about what we allow on Bingo.
  That said, we prohibit pornography, illegal or exploitative items, and used intimate<br /> &nbsp; items.
  Beyond that, we allow but place restrictions on mature content so that people who are offended by this kind of material don't have to see it.
  If you are selling<br /> &nbsp; mature content, we ask that you be respectful of differing sensibilities
  by listing and tagging your items properly.
</p><br />
< strong className="text-gray-700 ml-4 text-bold text-[18px]">More Details:</strong>
      <p className="text-gray-500 ml-4">
  -We prohibit items which are not aligned with Bingo’s brand and values,
  or which carry legal or other restrictions.
  Depictions of the sexualization of minors are<br /> &nbsp; prohibited.
  We also prohibit depictions of bestiality, incest, and non-consensual sex.
  Pornography of any sort is prohibited on Bingo, whereas mature content is<br /> &nbsp; restricted.
  Although pornography can be difficult to define,
  an item generally qualifies as pornography when it contains printed or visual material
  that explicitly <br /> &nbsp;describes or displays sex acts, sex organs, or other erotic behavior for the purpose of sexual arousal or stimulation.
</p><br />

<p className="text-gray-500 ml-4">
  -We define mature content as printed or visual depictions of human genitalia, sexual activity or content, profane language,
  sexual wellness items, <br /> &nbsp;violent images (within reason.), and explicit types or representations of taxidermy.
  Not all nudity is considered mature, and examples are listed below.<br /> &nbsp;
  If you find yourself questioning whether your item is mature,
  then it is likely a good idea to assume that it is mature content,
  and you should label it as such.
</p><br />

<p className="text-gray-500 ml-4 ">
  -When deciding whether mature content crosses over the threshold into pornography,<br /> &nbsp;
  we take into consideration the explicitness of depictions of sexual activity or content.
</p>
        </section>
        {/* section7 */}
        <section id="section7" className=" pt-[150px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Violent Items: Items that Promote, Support, or Glorify Violence</h2>
     <p className="text-gray-500 ml-4">
  
  -We want Bingo to be a safe place for everyone.
  While violent content can be a legitimate part of historical,<br /> &nbsp; educational, or artistic expression, it should never be used to promote or glorify violent acts against others.
</p><br />
            <p className="text-gray-500 ml-4 ">
  -We do not allow items or listings that promote, support or glorify acts of violence or harm towards self or <br/> &nbsp; others,
  including credible threats of harm.
</p><br />
              <p className="  mb-3 text-gray-700 ml-4 text-[20px] font-bold">
               The following items are not allowed on Bingo:
              </p>
             
<ol className="list-decimal list-inside space-y-2 mt-2 text-gray-500 ml-4 ">
  <li>Items that glorify human suffering or tragedies, including items that praise or honor perpetrators of violence</li>
  <li>Items that glorify or celebrate real world incidents of violence or natural disasters</li>
  <li>Items that threaten or encourage credible acts of violence against individuals or groups</li>
  <li>Items that encourage self-mutilation, starvation, or other self-harm</li>
  <li>Items that promote or endorse harmful misinformation</li>
</ol>
        </section>
      </main>
    </div>
  );
}
