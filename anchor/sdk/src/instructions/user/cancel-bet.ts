import { Program } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, VersionedTransaction } from '@solana/web3.js';
import { BetData, getBetsForUserAndPool } from '../..';
import { HorseRace } from '../../../../target/types/horse_race';
import { getVersionTxFromInstructions } from '../../utils';
import { TreasuryAccount } from '../../states/treasury-account';

export type CancelBetParams = {
  user: PublicKey,
  poolKey: PublicKey,
}

export async function cancelAllBetsForUserOnPoolEntry(program: Program<HorseRace>, params: CancelBetParams): Promise<{txs: VersionedTransaction[], bets: BetData[]}> {
  const { user, poolKey } = params;
  const bets = await getBetsForUserAndPool(program, user, poolKey);

  if (!bets) {
    throw new Error('No bet found');
  }

  const txs = await Promise.all(bets.map(async (bet) => {
    return await cancelBetByKey(program, new PublicKey(bet.publicKey), user, poolKey);
  }));

  return {
    txs,
    bets,
  };
}

export async function cancelBetByKey(program: Program<HorseRace>, betKey: PublicKey, user: PublicKey, poolKey: PublicKey): Promise<VersionedTransaction> {

  const poolAccount = await program.account.pool.fetch(poolKey);
  const treasuryAccount = await TreasuryAccount.getInstance(program);

  const tx = await program.methods
    .runCancelBet()
    .accountsStrict({
      authority: user,
      bet: betKey,
      user,
      pool: poolKey,
      systemProgram: SystemProgram.programId,
      poolVault: poolAccount.vaultKey,
      treasury: treasuryAccount.treasuryKey,
      treasuryVault: treasuryAccount.vaultKey,
    }).instruction();


    const vtx = await getVersionTxFromInstructions(program.provider.connection, [tx]);

  return vtx;
}

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

  const poolAccount = await program.account.pool.fetch(poolKey);

  const treasuryAccount = await TreasuryAccount.getInstance(program);

  if (!treasuryAccount) {
    throw new Error('Treasury not found , please make sure to create a treasury first');
  }

  if (!treasuryAccount.treasuryKey) {
    throw new Error(`Treasury not found , please check the treasury account ${treasuryAccount}`);
  }

  if (!treasuryAccount.vaultKey) {
    throw new Error(`Treasury vault not found , please check the treasury account ${treasuryAccount}`);
  }

  const tx = await program.methods
    .runCancelBet()
    .accountsStrict({
      authority: user,
      bet: betPDA,
      user,
      pool: poolKey,
      systemProgram: SystemProgram.programId,
      poolVault: poolAccount.vaultKey,
      treasury: treasuryAccount.treasuryKey,
      treasuryVault: treasuryAccount.vaultKey,
    }).instruction();


    const vtx = await getVersionTxFromInstructions(program.provider.connection, [tx]);

  return vtx;
}