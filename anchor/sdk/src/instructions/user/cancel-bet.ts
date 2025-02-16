import { Program } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, VersionedTransaction } from '@solana/web3.js';
import { HorseRace } from '../../../../target/types/horse_race';
import { getVersionTxFromInstructions } from '../../utils';
import { getBetsForUserAndPool } from '../..';
import { POOL_VAULT_SEED } from '../../constants';

export type CancelBetParams = {
  user: PublicKey,
  poolKey: PublicKey,
}

export async function cancelBetEntry(program: Program<HorseRace>, params: CancelBetParams): Promise<VersionedTransaction[]> {
  const { user, poolKey } = params;
  const bets = await getBetsForUserAndPool(program, user, poolKey);

  if (!bets) {
    throw new Error('No bet found');
  }

  return Promise.all(bets.map(async (bet) => {
    return await cancelBetByKey(program, new PublicKey(bet.publicKey), user, poolKey);
  }));
}

export async function cancelBetByKey(program: Program<HorseRace>, betKey: PublicKey, user: PublicKey, poolKey: PublicKey): Promise<VersionedTransaction> {

  const [poolVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(POOL_VAULT_SEED), poolKey.toBuffer()],
    program.programId
  );


  const tx = await program.methods
    .runCancelBet()
    .accountsStrict({
      authority: user,
      bet: betKey,
      user,
      pool: poolKey,
      systemProgram: SystemProgram.programId,
      poolVault: poolVaultPda,
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

  const [poolVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(POOL_VAULT_SEED), poolKey.toBuffer()],
    program.programId
  );

  const tx = await program.methods
    .runCancelBet()
    .accountsStrict({
      authority: user,
      bet: betPDA,
      user,
      pool: poolKey,
      systemProgram: SystemProgram.programId,
      poolVault: poolVaultPda,
    }).instruction();


    const vtx = await getVersionTxFromInstructions(program.provider.connection, [tx]);

  return vtx;
}