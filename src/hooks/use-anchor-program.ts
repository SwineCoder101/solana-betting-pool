import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { IDL } from '../../anchor/sdk/src';
import { HorseRace } from '../../anchor/target/types/horse_race';
import { useMemo } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth';
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';

interface ProgramResult {
  program: Program<HorseRace> | null;
  connection: Connection;
  signer: AnchorWallet | null;
}

// Create a serializable version of the IDL
const PROGRAM_IDL = JSON.parse(JSON.stringify(IDL));

export function useAnchorProgram(): ProgramResult {
  const { wallets } = useSolanaWallets();

  const wallet = wallets.filter(wallet => wallet.type === "solana")[0];
  console.log("using wallet: ", wallet);
  
  const connection = useMemo(() => new Connection(
    process.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
  ), []);

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
        return await Promise.all(txs.map(tx => wallet.signTransaction(tx)));
      }
    } as AnchorWallet;
  }, [wallet]);

  const provider = useMemo(() => {
    console.log("creating provider with signer: ", signer);
    if (!signer) {
      console.log("No signer available");
      return null;
    }
    return new AnchorProvider(
      connection,
      signer,
      { commitment: 'confirmed' }
    );
  }, [connection, signer]);

  const program = useMemo(() => {
    console.log("creating program with provider: ", provider);
    if (!provider) {
      console.log("No provider available");
      return null;
    }
    try {
      const prog = new Program<HorseRace>(
        PROGRAM_IDL,
        provider
      );
      console.log("Program created successfully");
      return prog;
    } catch (error) {
      console.error('Error creating program:', error);
      return null;
    }
  }, [provider]);

  return {
    program,
    connection,
    signer,
  };
}