import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { HorseRace } from '../../../../target/types/horse_race';
import { getVersionTxFromInstructions } from '../../utils';
import { findPoolKeyFromStartEndTime } from '../../states';
import { POOL_VAULT_SEED } from '../../constants';


export type CreateBetParams = {
  user: PublicKey,
  amount: number,
  lowerBoundPrice: number,
  upperBoundPrice: number,
  startTime?: number,
  endTime?: number,
  competitionKey: PublicKey,
  poolKey?: PublicKey,
  leverageMultiplier?: number,
}

export async function createBetEntry(program: Program<HorseRace>, params: CreateBetParams): Promise<VersionedTransaction> {
  const { user, amount, lowerBoundPrice, upperBoundPrice, startTime, endTime, competitionKey } = params;

  let leverageMultiplier = params.leverageMultiplier;

  if (!leverageMultiplier) {
    leverageMultiplier = 1;
  }

  if (!startTime || !endTime) {
    throw new Error('startTime and endTime are required');
  }

  if (!params.poolKey) {
    params.poolKey = await findPoolKeyFromStartEndTime(program, competitionKey, startTime, endTime);
  }
  return createBet(program, user, amount, lowerBoundPrice, upperBoundPrice, leverageMultiplier, params.poolKey, competitionKey);
}

export async function createBet(
  program: Program<HorseRace>,
  user: PublicKey,
  amount: number,
  lowerBoundPrice: number,
  upperBoundPrice: number,
  leverageMultiplier: number,
  poolKey: PublicKey,
  competitionKey: PublicKey,
): Promise<VersionedTransaction> {
  
  const betHash = Keypair.generate().publicKey;

  const [betPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("bet"),
      user.toBuffer(),
      poolKey.toBuffer(),
      betHash.toBuffer(),
    ],
    program.programId
  );

  const [poolVaultPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from(POOL_VAULT_SEED),
      poolKey.toBuffer(),
    ],
    program.programId
  );

  // console log all accounts
  // console.log("betPDA", betPDA.toBase58());
  // console.log("user", user.toBase58());
  // console.log("poolKey", poolKey.toBase58());
  // console.log("betHash", betHash.toBase58());

  const tx = await program.methods
    .runCreateBet(
      new anchor.BN(amount),
      new anchor.BN(lowerBoundPrice),
      new anchor.BN(upperBoundPrice),
      poolKey,
      competitionKey,
      new anchor.BN(leverageMultiplier)
    )
    .accountsStrict({
      user,
      bet: betPDA,
      pool: poolKey,
      betHashAcc: betHash,
      poolVault: poolVaultPDA,
      systemProgram: web3.SystemProgram.programId,
    }).instruction();


    const vtx = await getVersionTxFromInstructions(program.provider.connection, [tx]);

  return vtx;
}