import { tokens } from "@/data/data-constants";
import React, { useState } from "react";

const CompetitionForm: React.FC = () => {
  const [formState, setFormState] = useState({
    token_a: "",
    price_feed_id: "",
    house_cut_factor: 0,
    min_payout_ratio: 0,
    start_time: "",
    end_time: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = (action: "create" | "update") => {
    // Handle create or update logic here
    console.log(action, formState);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Competition Setup</h2>
      <form>
        <div className="mb-2">
          <label className="block mb-1">Token</label>
          <select
            name="token_a"
            value={formState.token_a}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          >
            {tokens.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1">House Cut Factor</label>
          <input
            type="number"
            name="house_cut_factor"
            value={formState.house_cut_factor}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Minimum Payout Ratio</label>
          <input
            type="number"
            name="min_payout_ratio"
            value={formState.min_payout_ratio}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Start Time</label>
          <input
            type="datetime-local"
            name="start_time"
            value={formState.start_time}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">End Time</label>
          <input
            type="datetime-local"
            name="end_time"
            value={formState.end_time}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => handleSubmit("create")}
            className="btn bg-yellow-600 text-white hover:bg-yellow-500"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("update")}
            className="btn bg-yellow-600 text-white hover:bg-yellow-500"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompetitionForm;