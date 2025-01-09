import { intervals } from "@/data/data-constants";
import React, { useState } from "react";

const BetForm: React.FC = () => {
  const [formState, setFormState] = useState({
    amount: 0,
    lower_bound_price: 0,
    upper_bound_price: 0,
    interval: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Bet Submitted", formState);
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