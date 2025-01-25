import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';

export type CreatePoolResponse = {
  poolKey: web3.PublicKey,
  poolHash: web3.PublicKey,
  tx: web3.TransactionSignature,
}


export async function createPool(
  program: Program<HorseRace>,
  authority: web3.Keypair,
  competitionAddr: web3.PublicKey,
  startTime: number,
  endTime: number,
  treasury: web3.PublicKey,
  poolHash: web3.PublicKey,
  signer: web3.Signer,
): Promise<CreatePoolResponse> {

  console.log('Creating pool with hash:', poolHash.toBase58());
  console.log('Competition:', competitionAddr.toBase58());

  const [poolPda] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), competitionAddr.toBuffer(), poolHash.toBuffer()],
    program.programId
  );

  console.log('Pool PDA:', poolPda.toBase58());

  const tx = await program.methods
    .runCreatePool(new anchor.BN(startTime), new anchor.BN(endTime), treasury)
    .accountsStrict({
      authority: authority.publicKey,
      pool: poolPda,
      systemProgram: web3.SystemProgram.programId,
      poolHashAcc: poolHash,
      competitionAcc: competitionAddr,
    })
    .signers([authority])
    .rpc();

  return {
    poolKey: poolPda,
    poolHash,
    tx,
  };
}