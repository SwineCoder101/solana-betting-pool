import { intervals } from "@/data/data-constants";
import { usePrivy } from "@privy-io/react-auth";
import React, { useEffect, useState } from "react";
import { useCreateBetBackend } from '@/hooks/use-create-bet-backend';

const BetForm: React.FC = () => {
  const { user } = usePrivy();
  const { createBet } = useCreateBetBackend();
  const [formState, setFormState] = useState({
    amount: "",
    lower_bound_price: "",
    upper_bound_price: "",
    interval: intervals[0].value,
    poolKey: '',
    competition: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for required dependencies
    if (!user?.wallet?.address) {
      console.warn('Wallet not connected');
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!user?.wallet?.address) {
        setError('Please connect your wallet first');
        return;
      }

      // Validate form data
      if (!formState.amount || Number(formState.amount) <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      if (!formState.poolKey) {
        setError('Please enter a pool key');
        return;
      }
      // Add other validations as needed

      await createBet.mutateAsync({
        amount: Number(formState.amount),
        lowerBoundPrice: Number(formState.lower_bound_price),
        upperBoundPrice: Number(formState.upper_bound_price),
        poolKey: formState.poolKey,
        competitionKey: formState.competition,
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
      <form>
        <div className="mb-2">
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            name="amount"
            value={formState.amount}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Lower Bound Price</label>
          <input
            type="number"
            name="lower_bound_price"
            value={formState.lower_bound_price}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Upper Bound Price</label>
          <input
            type="number"
            name="upper_bound_price"
            value={formState.upper_bound_price}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Interval</label>
          <select
            name="interval"
            value={formState.interval}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          >
            {intervals.map((interval) => (
              <option key={interval.id} value={interval.value}>
                {interval.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Pool Key</label>
          <input
            type="text"
            name="poolKey"
            value={formState.poolKey}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Competition</label>
          <input
            type="text"
            name="competition"
            value={formState.competition}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn bg-yellow-600 text-white hover:bg-yellow-500 mt-4"
        >
          Submit Bet
        </button>
      </form>
    </div>
  );
};

export default BetForm;