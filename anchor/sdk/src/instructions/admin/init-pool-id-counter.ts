import { Program, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';

export async function initIdCounter(
  program: Program<HorseRace>,
  authority: web3.PublicKey
): Promise<web3.TransactionSignature> {
  const [idCounterPda] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from('id_counter')],
    program.programId
  );

  const tx = await program.methods
    .runInitPoolCounterId()
    .accountsStrict({
      authority,
      poolIdCounter: idCounterPda,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([])
    .rpc();

  return tx;
}