import { tokens, intervals } from "@/data/data-constants";
import React, { useState, useEffect } from "react";
import { useCreateCompetitionBackend } from '@/hooks/use-create-competition-backend';
import { Keypair } from '@solana/web3.js';
import { usePrivy } from '@privy-io/react-auth';

const CompetitionForm: React.FC = () => {
  const { createCompetition, updateCompetition } = useCreateCompetitionBackend();
  const { user } = usePrivy();
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    token_a: tokens[0].symbol,
    price_feed_id: "",
    house_cut_factor: "",
    min_payout_ratio: "",
    interval: intervals[0].value.toString(),
    pool_count: "1",
    pool_interval: intervals[0].value.toString(),
    admin_keys: [""],
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    treasury: "",
    competition_key: "",
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

  const handleAdminKeysChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const keys = e.target.value.split('\n').filter(key => key.trim() !== '');
    setFormState({ ...formState, admin_keys: keys });
  };

  const convertToEpoch = (date: string, time: string): number => {
    const datetime = new Date(`${date}T${time}`);
    return Math.floor(datetime.getTime() / 1000);
  };

  const handleSubmit = async (action: "create" | "update") => {
    setError(null);

    try {
      if (!user?.wallet?.address) {
        throw new Error('Please connect your wallet first');
      }

      // Common validations
      if (!formState.token_a) {
        throw new Error('Please select a token');
      }
      if (!formState.price_feed_id) {
        throw new Error('Please enter a price feed ID');
      }
      if (!formState.house_cut_factor || Number(formState.house_cut_factor) <= 0) {
        throw new Error('Please enter a valid house cut factor');
      }
      if (!formState.min_payout_ratio || Number(formState.min_payout_ratio) <= 0) {
        throw new Error('Please enter a valid minimum payout ratio');
      }

      const startTime = convertToEpoch(formState.start_date, formState.start_time);
      const endTime = convertToEpoch(formState.end_date, formState.end_time);

      if (action === "create") {
        const competitionHash = Keypair.generate().publicKey.toBase58();
        await createCompetition.mutateAsync({
          competitionHash,
          tokenA: formState.token_a,
          priceFeedId: formState.price_feed_id,
          adminKeys: [user.wallet.address, ...formState.admin_keys],
          houseCutFactor: Number(formState.house_cut_factor),
          minPayoutRatio: Number(formState.min_payout_ratio),
          interval: Number(formState.interval),
          startTime,
          endTime,
          treasury: formState.treasury || user.wallet.address,
        });

        // Reset form after successful creation
        setFormState({
          ...formState,
          price_feed_id: "",
          house_cut_factor: "",
          min_payout_ratio: "",
          admin_keys: [""],
          start_date: "",
          start_time: "",
          end_date: "",
          end_time: "",
          treasury: "",
        });
      } else {
        if (!formState.competition_key) {
          throw new Error('Competition key is required for updates');
        }

        await updateCompetition.mutateAsync({
          competitionKey: formState.competition_key,
          tokenA: formState.token_a,
          priceFeedId: formState.price_feed_id,
          adminKeys: formState.admin_keys,
          houseCutFactor: Number(formState.house_cut_factor),
          minPayoutRatio: Number(formState.min_payout_ratio),
          interval: Number(formState.interval),
          startTime,
          endTime,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Competition Setup</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {(createCompetition.isSuccess || updateCompetition.isSuccess) && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Competition {createCompetition.isSuccess ? 'created' : 'updated'} successfully!
        </div>
      )}

      <form className="space-y-4">
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
        <div className="mb-2">
          <label className="block mb-1">Competition Key (for updates)</label>
          <input
            type="text"
            name="competition_key"
            value={formState.competition_key}
            onChange={handleInputChange}
            className="input input-bordered w-full bg-gray-200"
            placeholder="Enter competition key to update"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => handleSubmit("create")}
            disabled={createCompetition.isPending}
            className="btn bg-yellow-600 text-white hover:bg-yellow-500 disabled:bg-gray-400"
          >
            {createCompetition.isPending ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("update")}
            disabled={updateCompetition.isPending}
            className="btn bg-yellow-600 text-white hover:bg-yellow-500 disabled:bg-gray-400"
          >
            {updateCompetition.isPending ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompetitionForm;