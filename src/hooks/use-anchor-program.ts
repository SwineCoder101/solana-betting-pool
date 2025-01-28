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

// Move IDL and programId outside component to prevent recreation
const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID_HERE"); // Replace with your actual program ID
const programIdl = IDL as any;

export function useAnchorProgram(): ProgramResult {
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];
  
  const connection = useMemo(() => new Connection(
    process.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
  ), []);

  const signer = useMemo(() => {
    if (!wallets[0]?.address) return null;
    
    return {
      publicKey: new PublicKey(wallets[0].address),
      signTransaction: async (tx: VersionedTransaction) => {
        return await wallet.signTransaction(tx);
      },
      signAllTransactions: async (txs: VersionedTransaction[]) => {
        return await Promise.all(txs.map(tx => wallet.signTransaction(tx)));
      }
    } as AnchorWallet;
  }, [wallet, wallets]);

  // Create memoized provider
  const provider = useMemo(() => {
    if (!signer) return null;
    return new AnchorProvider(
      connection,
      signer,
      { commitment: 'confirmed' }
    );
  }, [connection, signer]);

  // Create memoized program instance
  const program = useMemo(() => {
    if (!provider) return null;
    try {
      return new Program(
        programIdl,
        PROGRAM_ID,
        provider
      );
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