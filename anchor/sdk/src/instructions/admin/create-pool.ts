import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';

export async function createPool(
  program: Program<HorseRace>,
  authority: web3.PublicKey,
  competitionKey: web3.PublicKey,
  startTime: number,
  endTime: number,
  treasury: web3.PublicKey,
  id: number
): Promise<web3.TransactionSignature> {
  const [poolPda] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), new anchor.BN(id).toArrayLike(Buffer, 'le', 8)],
    program.programId
  );

  const tx = await program.methods
    .runCreatePool(competitionKey, new anchor.BN(startTime), new anchor.BN(endTime), treasury)
    .accountsStrict({
      authority,
      poolIdCounter: poolPda,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([])
    .rpc();

  return tx;
}