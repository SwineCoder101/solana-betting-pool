import { Program, web3, BN } from '@coral-xyz/anchor';
import { AccountMeta, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getVersionTxFromInstructions, HorseRace } from '../../utils';
import { BetStatus, getBetAccountsForPool } from '../../states';
import { TreasuryAccount } from '../../states/treasury-account';

export async function settlePoolByPrice(
  program: Program<HorseRace>,
  admin: PublicKey,
  poolKey: PublicKey,
  lowerBoundPrice: number,
  upperBoundPrice: number,
): Promise<VersionedTransaction> {

  // Fetch the pool state.
  const poolAccount = await program.account.pool.fetch(poolKey);
  
  // Get the treasury PDA and treasury vault PDA.
  const [poolTreasury] = await TreasuryAccount.getTreasuryPda(program);
  const [treasuryVault] = await TreasuryAccount.getTreasuryVaultPda(program);

  // Get the active bets.
  const betAccounts = (await getBetAccountsForPool(program, poolKey))
    .filter((betAccount) => betAccount.status === BetStatus.Active);
  const userAccounts = betAccounts.map((betAccount) => betAccount.user);
  if (betAccounts.length !== userAccounts.length) {
    throw new Error("Number of bet accounts must match the number of user accounts");
  }

  const remainingAccounts: AccountMeta[] = betAccounts.flatMap((betAccount, index) => [
    { pubkey: new PublicKey(betAccount.publicKey), isWritable: true, isSigner: false },
    { pubkey: new PublicKey(userAccounts[index]), isWritable: true, isSigner: false },
  ]);

  // IMPORTANT: Use the field name from your Pool state.
  // If your pool state is defined with `competition_key: Pubkey`, then use that.
  const ix = await program.methods.runSettlePoolByPrice(
      new BN(lowerBoundPrice),
      new BN(upperBoundPrice)
    )
    .accountsStrict({
      authority: admin,
      pool: poolKey,
      poolTreasury,
      competition: poolAccount.competition,
      treasuryVault: treasuryVault,
      poolVault: poolAccount.vaultKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  const vtx = await getVersionTxFromInstructions(program.provider.connection, [ix]);
  return vtx;
}
