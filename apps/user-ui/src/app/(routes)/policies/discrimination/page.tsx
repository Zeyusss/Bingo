
import React from "react";

export default function Page() {
  return (
    <div className="w-[90%]mx-auto p-8 space-y-8">
     
      <h1 className="text-2xl md:text-5xl font-bold text-gray-700 text-center mb-8">
        Discrimination and Hateful Content Policy
      </h1>

     
      <div className=" p-6 rounded-2xl shadow-md border border-gray-200 space-y-4 ">
        <p className="text-gray-500 ">
          Bingo connects thoughtful consumers with creative entrepreneurs. It’s
          an ecosystem where people of all backgrounds inspire each other and
          build relationships through making, selling, and buying unique goods.
          We want everyone on Masry to feel safe, and our priority is fostering
          an inclusive environment. This policy explains the kind of behavior we
          prohibit on Masry to make sure we all have a positive experience.
        </p>
        <p className="text-gray-500 ">
          This policy is a part of our Terms of Use. By using Masry, you’re
          agreeing to this policy and our Terms of Use. Masry prohibits the use
          of our Services to discriminate against people based on the following
          personal attributes (collectively, “protected classes”):
        </p>

        
        <div className="bg-gray-45 hover:bg-white transition-all duration-300 border-l-4 border-orange-400 p-5 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Protected Classes
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-500">
            <li>Race</li>
            <li>Color</li>
            <li>Ethnicity</li>
            <li>National origin</li>
            <li>Religion</li>
            <li>Gender</li>
            <li>Gender identity</li>
            <li>Sexual orientation</li>
            <li>Disability</li>
            <li>Immigration status</li>
            <li>Caste</li>
          </ul>
        </div>
      </div>

     
      <div className="p-6 rounded-2xl shadow-md border border-gray-200 space-y-4">
        <p className="text-gray-500 ">
          It is your responsibility to know your local laws and any other legal
          regulations on discrimination that might apply to you. Additionally,
          Masry does not allow hateful content, including hate speech. Hate
          speech occurs when violent or degrading language is directed at a
          person or group based on their one or more protected group attributes.
        </p>
        <p className="text-gray-500 ">
          Whether you’re engaging with public features on Masry, such as listing
          items, using community spaces, and writing reviews, or having direct
          communication with other members of the Masry community, such as via
          Messages, discrimination and hateful content are not allowed. As a
          seller on Masry, your shop content, including shop announcements and
          shop policies, cannot display discriminatory behavior toward protected
          classes. Examples of prohibited behavior include, but are not limited
          to:
        </p>

        <div className="bg-gray-45 hover:bg-white transition-all duration-300  border-l-4 border-orange-400 p-5 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Prohibited Behaviors
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-500">
            <li>
              Refusal of service based on membership in one or more protected
              classes
            </li>
            <li>
              Expressing intolerance or disdain for another member on the basis
              of protected class attributes
            </li>
            <li>
              Having a shop policy that excludes sales to members on the basis
              of one or more protected classes listed above
            </li>
            <li>
              Content which directly or indirectly contains violent or degrading
              commentary against protected classes listed above
            </li>
            <li>Slurs</li>
            <li>Posts that support or glorify hate groups and their members</li>
          </ul>
        </div>
      </div>

      
      <div className=" bg-gray-45 hover:bg-white transition-all duration-300  border-l-4 border-orange-400 p-5 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Reporting</h2>
        <p className="text-gray-500 leading-relaxed">
          If you think discrimination or hateful content has occurred on Masry,
          please report it by contacting Masry through the Help Center, and we
          will investigate. If you see a listing on Masry which you believe
          violates our Prohibited Items Policy, including prohibited hate items,
          we encourage you to flag the item by using the Report this item to
          Masry link at the bottom of each listing page. We have a timely review
          process for all reports.
        </p>
      </div>
    </div>
  );
}

