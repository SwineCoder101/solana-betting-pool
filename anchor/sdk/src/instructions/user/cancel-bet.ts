import { Program } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, VersionedTransaction } from '@solana/web3.js';
import { HorseRace } from '../../../../target/types/horse_race';
import { getVersionTxFromInstructions } from '../../utils';

export async function cancelBet(
  program: Program<HorseRace>,
  user: PublicKey,
  poolKey: PublicKey,
  betHash: PublicKey,
): Promise<VersionedTransaction> {
  const [betPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("bet"),
      user.toBuffer(),
      poolKey.toBuffer(),
      betHash.toBuffer(),
    ],
    program.programId
  );

  const tx = await program.methods
    .runCancelBet()
    .accountsStrict({
      bet: betPDA,
      user,
      pool: poolKey,
      systemProgram: SystemProgram.programId,
    }).instruction();


    const vtx = await getVersionTxFromInstructions(program.provider.connection, [tx]);

  return vtx;
}