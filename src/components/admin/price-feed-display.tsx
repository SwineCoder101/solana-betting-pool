// src/components/admin/PriceFeedDisplay.tsx
import { tokens } from "@/data/data-constants";
import React, { useState, useEffect } from "react";

const PriceFeedDisplay: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      // Simulate fetching price data based on selectedToken.priceFeedId
      const simulatedPrice = Math.random() * 10; // Replace with actual API call
      setPrice(simulatedPrice);
    };

    fetchPrice();
  }, [selectedToken]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Live Price Feed</h2>
      <div className="mb-4">
        <label className="block mb-1">Select Token</label>
        <select
          value={selectedToken.symbol}
          onChange={(e) =>
            setSelectedToken(tokens.find((token) => token.symbol === e.target.value) || tokens[0])
          }
          className="input input-bordered w-full bg-gray-200"
        >
          {tokens.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.symbol}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <img src={selectedToken.logoPath} alt={selectedToken.symbol} className="w-12 h-12" />
        <div>
          <p className="text-lg font-semibold">{selectedToken.symbol}</p>
          <p className="text-sm text-gray-600">
            <a
              href={`https://dexscreener.com/${selectedToken.devnet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:underline"
            >
              {selectedToken.devnet}
            </a>
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-gray-800">{price ? price.toFixed(2) : "Loading..."} SOL</p>
        </div>
      </div>
    </div>
  );
};

export default PriceFeedDisplay;