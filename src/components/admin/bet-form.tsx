import { usePrivy } from "@privy-io/react-auth";
import React, { useEffect, useState } from "react";
import { useCreateBetBackend } from '@/hooks/use-create-bet-backend';
import { useActiveCompetitionsWithPools } from "@/hooks/queries";
import { useCompetitionPools } from "@/hooks/queries/use-pool-queries";
import { PublicKey } from "@solana/web3.js";

const BetForm: React.FC = () => {
  const { user } = usePrivy();
  const { createBet } = useCreateBetBackend();
  const { data: activeCompetitions } = useActiveCompetitionsWithPools();
  
  const [formState, setFormState] = useState({
    amount: "",
    competition: "",
    poolKey: "", // This will be set automatically based on selected interval
  });
  
  // Get pools for selected competition
  const { data: competitionPools } = useCompetitionPools(
    formState.competition ? new PublicKey(formState.competition) : null
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for required dependencies
    if (!user?.wallet?.address) {
      console.warn('Wallet not connected');
    }
  }, [user]);

  // Reset pool when competition changes
  useEffect(() => {
    setFormState(prev => ({ ...prev, poolKey: "" }));
  }, [formState.competition]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handlePoolSelect = (poolKey: string) => {
    setFormState(prev => ({ ...prev, poolKey }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!user?.wallet?.address) {
        setError('Please connect your wallet first');
        return;
      }

      if (!formState.amount || Number(formState.amount) <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      if (!formState.competition) {
        setError('Please select a competition');
        return;
      }
      if (!formState.poolKey) {
        setError('Please select a pool interval');
        return;
      }

      await createBet.mutateAsync({
        amount: Number(formState.amount),
        poolKey: formState.poolKey,
        competitionKey: formState.competition,
        // These will be handled by backend
        lowerBoundPrice: 0,
        upperBoundPrice: 0,
      });

      // Reset form on success
      setFormState({
        amount: "",
        competition: "",
        poolKey: "",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create bet');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Betting Form</h2>
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            name="amount"
            value={formState.amount}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
            required
          />
        </div>
        
        <div className="mb-2">
          <label className="block mb-1">Competition</label>
          <select
            name="competition"
            value={formState.competition}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
            required
          >
            <option value="">Select Competition</option>
            {activeCompetitions?.map((competition) => (
              <option key={competition.competitionKey} value={competition.competitionKey}>
                {new Date(competition.endTime * 1000).toLocaleString()} - {competition.interval}s
              </option>
            ))}
          </select>
        </div>

        {formState.competition && (
          <div className="mb-2">
            <label className="block mb-1">Pool Interval</label>
            <div className="grid grid-cols-2 gap-2">
              {competitionPools?.map((pool) => (
                <button
                  key={pool.poolKey}
                  type="button"
                  onClick={() => handlePoolSelect(pool.poolKey)}
                  className={`p-2 rounded ${
                    formState.poolKey === pool.poolKey
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {new Date(pool.startTime * 1000).toLocaleTimeString()} - 
                  {new Date(pool.endTime * 1000).toLocaleTimeString()}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={createBet.isPending}
          className="btn bg-yellow-600 text-white hover:bg-yellow-500 mt-4"
        >
          {createBet.isPending ? "Submitting..." : "Submit Bet"}
        </button>
      </form>
    </div>
  );
};

export default BetForm;