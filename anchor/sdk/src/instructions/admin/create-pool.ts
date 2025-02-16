import { BN, Program, web3 } from '@coral-xyz/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { HorseRace } from '../../../../target/types/horse_race';
import { POOL_SEED, POOL_VAULT_SEED } from '../../constants';

export type CreatePoolResponse = {
  poolKey: PublicKey;
  ix: TransactionInstruction;
}

export async function createPool(
  program: Program<HorseRace>,
  admin: PublicKey,
  competitionKey: PublicKey,
  startTime: number,
  endTime: number,
  treasury: PublicKey,
  poolHash: PublicKey,
): Promise<CreatePoolResponse> {
  const [poolPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(POOL_SEED), competitionKey.toBuffer(), poolHash.toBuffer()],
    program.programId
  );

  const [poolVaultPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(POOL_VAULT_SEED), poolPda.toBuffer()],
    program.programId
  );

  const ix = await program.methods
    .runCreatePool(
      new BN(startTime),
      new BN(endTime),
      treasury
    )
    .accountsStrict({
      authority: admin,
      pool: poolPda,
      competitionAcc: competitionKey,
      poolHashAcc: poolHash,
      poolVault: poolVaultPda,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction();

  return {
    poolKey: poolPda,
    ix
  };
}