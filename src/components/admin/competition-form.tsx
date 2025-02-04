import { tokens } from "@/data/data-constants";
import React, { useState } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { useCreateCompetition } from "@/hooks/use-create-competition";

const CompetitionForm: React.FC = () => {
  const { user } = usePrivy();
  const createCompetitionMutation = useCreateCompetition();
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [interval, setInterval] = useState<string>("300"); // 5 minutes default
  const [tokenSymbol, setTokenSymbol] = useState<string>(tokens[0].symbol);
  const [houseCutFactor, setHouseCutFactor] = useState<string>("5"); // 5%
  const [minPayoutRatio, setMinPayoutRatio] = useState<string>("1.5"); // 150%
  const [adminKeys, setAdminKeys] = useState<string>("");
  const [treasury, setTreasury] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user?.wallet?.address) {
      setError('Wallet not connected');
      return;
    }

    // Combine date and time strings and convert to epoch timestamp
    const startTimestamp = Math.floor(new Date(`${startDate}T${startTime}`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${endDate}T${endTime}`).getTime() / 1000);

    try {
      await createCompetitionMutation.mutateAsync({
        tokenSymbol,
        houseCutFactor: parseFloat(houseCutFactor),
        minPayoutRatio: parseFloat(minPayoutRatio),
        interval: parseInt(interval),
        startTime: startTimestamp,
        endTime: endTimestamp,
        adminKeys: adminKeys ? adminKeys.split('\n').filter(k => k.trim()) : undefined,
        treasury: treasury || undefined,
      });

      // Reset form
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setInterval("300");
      setHouseCutFactor("5");
      setMinPayoutRatio("1.5");
      setAdminKeys("");
      setTreasury("");
    } catch (error) {
      console.error("Error creating competition:", error);
      setError(error instanceof Error ? error.message : 'Failed to create competition');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Create New Competition</h2>
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block mb-1">Token</label>
          <select
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
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
          <label className="block mb-1">House Cut (%)</label>
          <input
            type="number"
            value={houseCutFactor}
            onChange={(e) => setHouseCutFactor(e.target.value)}
            className="input input-bordered w-full bg-gray-200"
            min="0"
            max="100"
            step="0.1"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Min Payout Ratio</label>
          <input
            type="number"
            value={minPayoutRatio}
            onChange={(e) => setMinPayoutRatio(e.target.value)}
            className="input input-bordered w-full bg-gray-200"
            min="1"
            step="0.1"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Start Time</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input input-bordered w-full bg-gray-200"
              required
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input input-bordered w-full bg-gray-200"
              required
            />
          </div>
        </div>
        <div className="mb-2">
          <label className="block mb-1">End Time</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input input-bordered w-full bg-gray-200"
              required
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input input-bordered w-full bg-gray-200"
              required
            />
          </div>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Interval (seconds)</label>
          <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="input input-bordered w-full bg-gray-200"
            min="60"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Admin Keys (Optional, one per line)</label>
          <textarea
            value={adminKeys}
            onChange={(e) => setAdminKeys(e.target.value)}
            className="textarea textarea-bordered bg-gray-200 w-full"
            rows={3}
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Treasury Address (Optional)</label>
          <input
            type="text"
            value={treasury}
            onChange={(e) => setTreasury(e.target.value)}
            className="input input-bordered w-full bg-gray-200"
            placeholder="Default: Admin address"
          />
        </div>
        <button
          type="submit"
          disabled={createCompetitionMutation.isPending}
          className="btn bg-yellow-600 text-white hover:bg-yellow-500 mt-4"
        >
          {createCompetitionMutation.isPending ? "Creating..." : "Create Competition"}
        </button>
      </form>
    </div>
  );
};

export default CompetitionForm;