import { useAllBets, useAllCompetitions } from "@/hooks/queries";
import { useSettlementBackend } from "@/hooks/use-settlement-backend";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState } from "react";

interface PoolOption {
  poolKey: string;
  competitionKey: string;
  totalBets: number;
}

const SettlementForm: React.FC = () => {
  const [selectedPool, setSelectedPool] = useState<string>("");
  const [lowerBoundPrice, setLowerBoundPrice] = useState<string>("");
  const [upperBoundPrice, setUpperBoundPrice] = useState<string>("");

  const { data: bets = [] } = useAllBets();
  const { data: competitions = [] } = useAllCompetitions();
  const { settleByPrice } = useSettlementBackend();

  // Group bets by pool and calculate total amounts
  const poolOptions: PoolOption[] = bets.reduce((acc: PoolOption[], bet) => {
    const existingPool = acc.find(p => p.poolKey === bet.poolKey.toString());
    if (existingPool) {
      existingPool.totalBets += Number(bet.amount) / LAMPORTS_PER_SOL;
    } else {
      acc.push({
        poolKey: bet.poolKey.toString(),
        competitionKey: bet.competition.toString(),
        totalBets: Number(bet.amount) / LAMPORTS_PER_SOL
      });
    }
    return acc;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPool || !lowerBoundPrice || !upperBoundPrice) {
      return;
    }

    try {
      await settleByPrice.mutateAsync({
        poolKey: selectedPool,
        lowerBoundPrice: Number(lowerBoundPrice),
        upperBoundPrice: Number(upperBoundPrice)
      });
    } catch (error) {
      console.error("Settlement error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Force Settlement</h2>
      <div>
        <label className="block mb-1">
          Select Pool
        </label>
        <select
          value={selectedPool}
          onChange={(e) => setSelectedPool(e.target.value)}
          className="input input-bordered w-full bg-gray-200"
        >
          <option value="">Select a pool</option>
          {poolOptions.map((pool) => {
            const competition = competitions.find(
              c => c.competitionKey === pool.competitionKey
            );
            return (
              <option key={pool.poolKey} value={pool.poolKey}>
                Pool: {pool.poolKey.slice(0, 4)}...{pool.poolKey.slice(-4)} - 
                Total Bets: {pool.totalBets.toFixed(2)} SOL
                {competition && ` - ${competition.endTime > Date.now()/1000 ? "Active" : "Ended"}`}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block mb-1">
          Lower Bound Price
        </label>
        <input
          type="number"
          value={lowerBoundPrice}
          onChange={(e) => setLowerBoundPrice(e.target.value)}
          className="input input-bordered w-full bg-gray-200"
        />
      </div>

      <div>
        <label className="block mb-1">
          Upper Bound Price
        </label>
        <input
          type="number"
          value={upperBoundPrice}
          onChange={(e) => setUpperBoundPrice(e.target.value)}
          className="input input-bordered w-full bg-gray-200"
        />
      </div>

      <button
        type="submit"
        disabled={settleByPrice.isPending || !selectedPool || !lowerBoundPrice || !upperBoundPrice}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {settleByPrice.isPending ? "Settling..." : "Settle Pool"}
      </button>

      {settleByPrice.isError && (
        <div className="text-red-600 text-sm mt-2">
          {settleByPrice.error?.message || "Failed to settle pool"}
        </div>
      )}
    </form>
  );
};

export default SettlementForm; 