import { usePrivy } from '@privy-io/react-auth';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import { HorseRace, IDL } from '../../anchor/target/types/horse_race';

export function useAnchorProgram() {
  const { user } = usePrivy();

  if (!user?.wallet?.address) {
    return null;
  }

  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'http://localhost:8899'
  );

  const provider = new AnchorProvider(
    connection,
    user.wallet as any,
    AnchorProvider.defaultOptions()
  );

  return new Program<HorseRace>(
    IDL,
    process.env.NEXT_PUBLIC_PROGRAM_ID!,
    provider
  );
} 