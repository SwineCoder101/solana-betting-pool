import { useAllBets } from "@/hooks/queries";
import { shortenAddress } from "@/lib/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React from "react";

const BetDisplay: React.FC = () => {
  const { data: bets, isLoading, error } = useAllBets();

  if (isLoading) {
    return <div>Loading bets...</div>;
  }
  
  if (error) {
    console.error("Error loading bets:", error);
    return <div>Error loading bets</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Live Bets</h2>
      <div className="p-4 bg-gray-100 max-h-[500px] overflow-y-auto">
        {bets?.map((bet, index) => (
          <div 
            key={`${bet.publicKey.toString()}-${index}`} 
            className="p-2 mb-2 bg-white rounded shadow"
          >
            <div className="flex justify-between items-center">
              <span>User: {shortenAddress(bet.user.toString())}</span>
              <span>Competition: {bet.competition.toString()}</span>
              <span>Amount: {(bet.amount/LAMPORTS_PER_SOL).toString()} SOL</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
  
export default BetDisplay;