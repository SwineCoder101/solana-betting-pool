import { tokens, intervals } from "@/data/data-constants";
import React, { useState } from "react";
import { useCreateCompetition } from '@/hooks/use-create-competition';
import { Keypair } from '@solana/web3.js';
import { usePrivy } from '@privy-io/react-auth';

const CompetitionForm: React.FC = () => {
  const createCompetitionMutation = useCreateCompetition();
  const { user } = usePrivy();

  const [formState, setFormState] = useState({
    token_a: "",
    price_feed_id: "",
    house_cut_factor: 0,
    min_payout_ratio: 0,
    interval: intervals[0].value,
    pool_count: 1,
    pool_interval: intervals[0].value,
    admin_keys: [""],
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    treasury: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleAdminKeysChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const keys = e.target.value.split('\n').filter(key => key.trim() !== '');
    setFormState({ ...formState, admin_keys: keys });
  };

  const convertToEpoch = (date: string, time: string): number => {
    const datetime = new Date(`${date}T${time}`);
    return Math.floor(datetime.getTime() / 1000);
  };

  const handleSubmit = async (action: "create" | "update") => {
    if (action === "create" && user?.wallet?.address) {
      try {
        const competitionHash = Keypair.generate().publicKey.toString();
        const startTime = convertToEpoch(formState.start_date, formState.start_time);
        const endTime = convertToEpoch(formState.end_date, formState.end_time);
        
        await createCompetitionMutation.mutateAsync({
          competitionHash,
          tokenA: formState.token_a,
          priceFeedId: formState.price_feed_id,
          adminKeys: [user.wallet.address, ...formState.admin_keys],
          houseCutFactor: formState.house_cut_factor,
          minPayoutRatio: formState.min_payout_ratio,
          interval: Number(formState.interval),
          startTime,
          endTime,
          treasury: formState.treasury || user.wallet.address,
        });
      } catch (error) {
        console.error('Error creating competition:', error);
      }
    }
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
          <label className="block mb-1">Price Feed ID</label>
          <input
            type="text"
            name="price_feed_id"
            value={formState.price_feed_id}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
            placeholder="Enter Pyth price feed ID"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">House Cut Factor (%)</label>
          <input
            type="number"
            name="house_cut_factor"
            value={formState.house_cut_factor}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Minimum Payout Ratio (%)</label>
          <input
            type="number"
            name="min_payout_ratio"
            value={formState.min_payout_ratio}
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
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formState.start_date}
              onChange={handleInputChange}
              className="input input-bordered w-full bg-gray-200"
            />
          </div>
          <div>
            <label className="block mb-1">Start Time</label>
            <input
              type="time"
              name="start_time"
              value={formState.start_time}
              onChange={handleInputChange}
              className="input input-bordered w-full bg-gray-200"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block mb-1">End Date</label>
            <input
              type="date"
              name="end_date"
              value={formState.end_date}
              onChange={handleInputChange}
              className="input input-bordered w-full bg-gray-200"
            />
          </div>
          <div>
            <label className="block mb-1">End Time</label>
            <input
              type="time"
              name="end_time"
              value={formState.end_time}
              onChange={handleInputChange}
              className="input input-bordered w-full bg-gray-200"
            />
          </div>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Treasury Address (optional)</label>
          <input
            type="text"
            name="treasury"
            value={formState.treasury}
            onChange={handleInputChange}
            placeholder="Leave empty to use your wallet address"
            className="input input-bordered w-full bg-gray-200"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Admin Public Keys (one per line)</label>
          <textarea
            name="admin_keys"
            value={formState.admin_keys.join('\n')}
            onChange={handleAdminKeysChange}
            className="input input-bordered w-full bg-gray-200 h-24"
            placeholder="Enter admin public keys"
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
      {createCompetitionMutation.isPending && <div>Creating competition...</div>}
      {createCompetitionMutation.isError && (
        <div className="text-red-500">
          Error creating competition: {createCompetitionMutation.error?.message}
        </div>
      )}
      {createCompetitionMutation.isSuccess && (
        <div className="text-green-500">
          Competition created successfully!
          Competition signature: {createCompetitionMutation.data?.signature}
          Pool signatures: {createCompetitionMutation.data?.signature}
        </div>
      )}
    </div>
  );
};

export default CompetitionForm;