import React, { useState, useEffect } from "react";
import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import { tokenPairs } from "@/data/data-constants";

const PriceFeedDisplay: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState(tokenPairs[0]);
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const connection = new PriceServiceConnection("https://hermes.pyth.network");

    const fetchPrice = async () => {
      try {
        const currentPrices = await connection.getLatestPriceFeeds([selectedToken.priceFeedId]);
        if (currentPrices && currentPrices.length > 0) {
          const priceData = currentPrices[0].getPriceUnchecked();
          if (priceData) {
            setPrice(parseFloat(priceData.price) / Math.pow(10, Math.abs(priceData.expo)));
          }
        }
      } catch (error) {
        console.error("Error fetching price: ", error);
      }
    };

    fetchPrice();

    connection.subscribePriceFeedUpdates(
      [selectedToken.priceFeedId],
      (priceFeed) => {
        const priceData = priceFeed.getPriceUnchecked();
        if (priceData) {
          setPrice(parseFloat(priceData.price) / Math.pow(10, Math.abs(priceData.expo)));
        }
      }
    );

    return () => {
      connection.closeWebSocket();
    };
  }, [selectedToken]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Live Price Feed</h2>
      <div className="mb-4">
        <label className="block mb-1">Select Token</label>
        <select
          value={selectedToken.symbol}
          onChange={(e) =>
            setSelectedToken(tokenPairs.find((token) => token.symbol === e.target.value) || tokenPairs[0])
          }
          className="input input-bordered w-full bg-gray-200"
        >
          {tokenPairs.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.symbol}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <img src={selectedToken.showLogo ? selectedToken.logoPath : "/images/solana.png"} alt={selectedToken.symbol} className="w-12 h-12" />
        <div>
          <p className="text-lg font-semibold">{selectedToken.symbol}</p>
          <p className="text-sm text-gray-600">
            <a
              href={`https://dexscreener.com/${selectedToken.devnet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:underline"
            >
              {selectedToken.tokenAddress}
            </a>
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-gray-800">{price ? price.toFixed(6) : "Loading..."} USD</p>
        </div>
      </div>
    </div>
  );
};

export default PriceFeedDisplay;