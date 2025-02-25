import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { IDL } from '../../anchor/sdk/src';
import { HorseRace } from '../../anchor/target/types/horse_race';
import { useEffect, useMemo, useState } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth';
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { TreasuryAccount } from '../../anchor/sdk/src/states/treasury-account';

interface ProgramResult {
  program: Program<HorseRace> | null;
  connection: Connection;
  signer: AnchorWallet | null;
  treasuryVault: PublicKey;
}

// Create a serializable version of the IDL
const PROGRAM_IDL = JSON.parse(JSON.stringify(IDL));

export function useAnchorProgram(): ProgramResult {
  const { wallets } = useSolanaWallets();
  const [walletReady, setWalletReady] = useState(false);
  const [treasuryVault, setTreasuryVault] = useState<PublicKey>(
    new PublicKey("3Fanwf9uVRFUscsRkXHo4qTkUbFFmjzUSett4dU7qhgs")
  );

  useEffect(() => {
    if (wallets.some(w => w.type === "solana")) {
      setWalletReady(true);
      // initialize the program
    }
  }, [wallets]);

  const wallet = useMemo(
    () => wallets.find(w => w.type === "solana"),
    [wallets]
  );

  const connection = useMemo(
    () =>
      new Connection(
        process.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com"
      ),
    []
  );

  const signer = useMemo(() => {
    if (!wallet?.address) {
      console.log("No wallet connected");
      return null;
    }
    return {
      publicKey: new PublicKey(wallet.address),
      signTransaction: async (tx: VersionedTransaction) => {
        return await wallet.signTransaction(tx);
      },
      signAllTransactions: async (txs: VersionedTransaction[]) => {
        return await Promise.all(
          txs.map(tx => wallet.signTransaction(tx))
        );
      }
    } as AnchorWallet;
  }, [wallet]);

  const provider = useMemo(() => {
    if (!walletReady) {
      console.log("Wallet not ready");
      return null;
    }
    if (!signer) {
      console.log("No signer available");
      return null;
    }
    return new AnchorProvider(connection, signer, {
      commitment: "confirmed"
    });
  }, [connection, signer, walletReady]);

  const program = useMemo(() => {
    if (!provider) {
      console.log("No provider available");
      return null;
    }
    try {
      const prog = new Program<HorseRace>(PROGRAM_IDL, provider);
      return prog;
    } catch (error) {
      console.error("Error creating program:", error);
      return null;
    }
  }, [provider]);

  useEffect(() => {
    const fetchTreasuryVault = async () => {
      if (!program) return;
      try {
        const [treasuryVaultPda] =
          await TreasuryAccount.getTreasuryVaultPda(program);
        if (!treasuryVaultPda) {
          setTreasuryVault(
            new PublicKey("3Fanwf9uVRFUscsRkXHo4qTkUbFFmjzUSett4dU7qhgs")
          );
        } else {
          setTreasuryVault(treasuryVaultPda);
        }
      } catch (error) {
        console.error("Error fetching treasury vault:", error);
      }
    };

    fetchTreasuryVault();
  }, [program]);

  return {
    program,
    connection,
    signer,
    treasuryVault
  };
}
