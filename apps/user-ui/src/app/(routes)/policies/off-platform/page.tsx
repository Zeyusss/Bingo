
import React from "react";

export default function Page() {
  return (
    <div className="">
      
      <div className="bg-[url('/assets/polices_homepage.webp')] bg-cover bg-center w-full h-96 rounded-2xl shadow-xl mb-10 flex flex-col items-start justify-center p-12">
      
      </div>

      
      <div className="w-[90%] mx-auto space-y-6">
        <p className="text-gray-500 ">
          At Bingo, we are deeply committed to keeping our community safe. As
          part of this, we have built <span className="font-semibold">Bingo Payments</span>, our{" "}
          <span className="font-semibold">Purchase Protection Program</span>,
          and our <span className="font-semibold">Case System</span> to protect
          community members if something goes wrong with an order. These
          protections aren’t available for transactions that take place off of
          Bingo, even if the buyer and seller first found each other on Bingo.
        </p>

        <div className="bg-gray-45 hover:bg-white p-4 border-l-4 border-orange-400 p-5 rounded-lg shadow-lg transition-all duration-300 ">
          <h2 className="text-xl font-bold text-gray-700 mb-3">
            Off-Platform Transactions are Not Allowed
          </h2>
          <p className="text-gray-600 mb-3">
            Because navigating off the Bingo platform may increase the risk of
            fraud or scam exposure, taking communications and transactions
            off-platform is not allowed. This includes, for example:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-600">
            <li>Making offers to buy or sell outside Bingo</li>
            <li>
              Encouraging buyers to purchase an item in your Bingo shop through
              another venue
            </li>
            <li>Using a QR code to direct users off of the Bingo platform</li>
          </ul>
        </div>

        <div className="bg-gray-45 hover:bg-white transition-all duration-300  border-l-4 border-orange-400 p-5 rounded-lg shadow-lg">
          <p className="text-gray-700 ">
            A transaction initiated on <span className="font-semibold">Bingo</span> may not be
            completed off of Bingo. The price stated in each listing description
            must be an accurate representation of the sale. Sellers may not
            alter the item's price after a sale for the purpose of avoiding
            Bingo transaction fees, misrepresent the item’s location, or use
            another user's account without permission.
          </p>
        </div>
      </div>
    </div>
  );
}
