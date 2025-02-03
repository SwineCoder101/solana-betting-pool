import { useAllPools } from "@/hooks/queries";
import { shortenAddress } from "@/lib/utils";
import React from "react";

const PoolDisplay: React.FC = () => {
  const { data: pools, isLoading, error } = useAllPools();

  if (isLoading) {
    return <div>Loading pools...</div>;
  }
  
  if (error) {
    console.error("Error loading pools:", error);
    return <div>Error loading pools</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Live Pools</h2>
      <div className="p-4 bg-gray-100">
        {pools?.map((pool, index) => (
          <div 
            key={`${pool.poolKey}-${index}`} 
            className="p-2 mb-2 bg-white rounded shadow"
          >
            <div className="flex justify-between items-center">
              <span>Pool: {shortenAddress(pool.poolKey)}</span>
              <span>Competition: {shortenAddress(pool.competitionKey)}</span>
              <span>Start Time: {new Date(pool.startTime * 1000).toLocaleString()}</span>
              <span>End Time: {new Date(pool.endTime * 1000).toLocaleString()}</span>
              {/* <span>Balance: {(pool.balance/LAMPORTS_PER_SOL).toString()} SOL</span> */}
            </div>
            {/* <div className="mt-2 text-sm text-gray-600">
              <span>Total Players: {pool.players.length}</span>
              <span className="ml-4">Status: {pool.status}</span>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoolDisplay; 