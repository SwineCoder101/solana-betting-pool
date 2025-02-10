import { useAllCompetitions } from "@/hooks/queries";
import { shortenAddress } from "@/lib/utils";
import React from "react";

const CompetitionDisplay: React.FC = () => {
  const { data: competitions, isLoading, error, isFetching } = useAllCompetitions();

  if (isLoading || isFetching) {
    return <div>Loading competitions...</div>;
  }
  
  if (error) {
    console.error("Error loading competitions:", error);
    return <div>Error loading competitions</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Live Competitions</h2>
      <div className="p-4 bg-gray-100 max-h-[500px] overflow-y-auto">
        {competitions?.map((competition, index) => (
          <div 
            key={`${competition.competitionKey}-${index}`} 
            className="p-2 mb-2 bg-white rounded shadow"
          >
            <div className="flex justify-between items-center">
              <span>Creator: {shortenAddress(competition.admin[0])}</span>
              <span>Interval: {(competition.interval).toString()} sec</span>
              <span>Status: {competition.endTime > Date.now()/1000 ? "Active" : "Ended"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitionDisplay;