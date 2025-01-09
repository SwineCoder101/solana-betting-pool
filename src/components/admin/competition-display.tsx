import React from "react";

const CompetitionDisplay: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Live Competition</h2>
      <div className="p-4 bg-gray-100">No active competition</div>
    </div>
  );
};

export default CompetitionDisplay;