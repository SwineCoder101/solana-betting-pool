import React, { useEffect, useState } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Use the REACT_APP_SOLANA_RPC_URL env variable, fallback to devnet if not set.
const SOLANA_RPC_URL = process.env.REACT_APP_SOLANA_RPC_URL || "https://api.devnet.solana.com";

// Treasury PDA as provided.
const TREASURY_PDA = new PublicKey("3Fanwf9uVRFUscsRkXHo4qTkUbFFmjzUSett4dU7qhgs");

const TreasuryDisplay: React.FC = () => {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Create a connection instance
        const connection = new Connection(SOLANA_RPC_URL, "processed");
        const lamports = await connection.getBalance(TREASURY_PDA);
        setBalance(BigInt(lamports));
      } catch (err) {
        console.error("Error fetching treasury balance:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };

    fetchBalance();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Treasury Details</h2>
      {error && <p className="text-red-500">Error: {error}</p>}
      {balance !== null ? (
        <p>
          Balance: {balance.toString()} lamports (
          {(Number(balance) / LAMPORTS_PER_SOL).toFixed(2)} SOL)
        </p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TreasuryDisplay; 