// filepath: /Users/liam/dev/solana-horse-race/sdk/src/instructions/admin/init-id-counter.ts
import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';

export async function initIdCounter(
  program: Program<HorseRace>,
  authority: web3.PublicKey
): Promise<web3.TransactionSignature> {
  const [idCounterPda, bump] = await web3.PublicKey.findProgramAddress(
    [Buffer.from('id_counter')],
    program.programId
  );

  const tx = await program.methods
    .runInitIdCounter()
    .accounts({
      authority,
      idCounter: idCounterPda,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([])
    .rpc();

  return tx;
}