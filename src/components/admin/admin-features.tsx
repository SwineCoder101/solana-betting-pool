// src/components/admin/AdminFeatures.tsx
import React from "react";
import CompetitionForm from "./competition-form";
import CompetitionDisplay from "./competition-display";
import BetForm from "./bet-form";
import BetDisplay from "./bet-display";
import PriceFeedDisplay from "./price-feed-display";

const AdminFeatures: React.FC = () => {
  return (
    <div className="p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">Admin Features</h1>

      <div className="grid gap-4">
      {/* <div className="border p-4 bg-gray-50">
          <PriceFeedDisplay />
        </div>
        <div className="border p-4 bg-gray-50">
          <CompetitionForm />
        </div>
        <div className="border p-4 bg-gray-50">
          <CompetitionDisplay />
        </div>
        <div className="border p-4 bg-gray-50">
          <BetForm />
        </div>
        <div className="border p-4 bg-gray-50">
          <BetDisplay />
        </div> */}
      </div>
    </div>
  );
};

export default AdminFeatures;