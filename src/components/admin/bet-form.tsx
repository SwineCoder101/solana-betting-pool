import { intervals } from "@/data/data-constants";
import React, { useState, useEffect } from "react";
import { useCreateBet } from '@/hooks/use-create-bet';
import { usePrivy } from "@privy-io/react-auth";

const BetForm: React.FC = () => {
  const createBetMutation = useCreateBet();
  const { user } = usePrivy();
  const [formState, setFormState] = useState({
    amount: 0,
    lower_bound_price: 0,
    upper_bound_price: 0,
    interval: 0,
    poolKey: '',
    competition: '',
  });

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
    
    try {
      if (!user?.wallet?.address) {
        throw new Error('Please connect your wallet first');
      }

      // Validate form data
      if (!formState.amount || formState.amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      if (!formState.poolKey) {
        throw new Error('Please enter a pool key');
      }
      // Add other validations as needed

      await createBetMutation.mutateAsync({
        amount: Number(formState.amount),
        lowerBoundPrice: Number(formState.lower_bound_price),
        upperBoundPrice: Number(formState.upper_bound_price),
        poolKey: formState.poolKey,
        competition: formState.competition,
      });
    } catch (error) {
      console.error('Error creating bet:', error);
      throw error; // Let error boundary handle it
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Betting Form</h2>
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
      {createBetMutation.isPending && <div>Creating bet...</div>}
      {createBetMutation.isError && (
        <div className="text-red-500">
          Error creating bet: {createBetMutation.error?.message}
        </div>
      )}
      {createBetMutation.isSuccess && (
        <div className="text-green-500">Bet created successfully!</div>
      )}
    </div>
  );
};

export default BetForm;