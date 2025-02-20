import { Program, web3, BN } from '@coral-xyz/anchor';
import { AccountMeta, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getVersionTxFromInstructions, HorseRace } from '../../utils';
import { BetData, BetStatus, getBetAccountsForPool } from '../../states';
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
  const betAccounts : BetData[] = (await getBetAccountsForPool(program, poolKey))
    .filter((betAccount) => betAccount.status === BetStatus.Active);
  const userAccounts: string[] = betAccounts.map((betAccount) => betAccount.user);

  if (betAccounts.length !== userAccounts.length) {
    throw new Error("Number of bet accounts must match the number of user accounts");
  }

  if (betAccounts.length === 0) {
    throw new Error("No active bets found");
  }

  console.log('betAccounts : ', betAccounts);
  console.log('userAccounts : ', userAccounts);

  const remainingAccounts: AccountMeta[] = ([] as AccountMeta[]).concat(...betAccounts.map((betAccount) => [
    { pubkey: new PublicKey(betAccount.publicKey), isWritable: true, isSigner: false },
    { pubkey: new PublicKey(betAccount.user), isWritable: true, isSigner: false },
  ]));

  const ix = await program.methods.runSettlePoolByPrice(
      new BN(lowerBoundPrice),
      new BN(upperBoundPrice)
    )
    .accountsStrict({
      authority: admin,
      pool: poolKey,
      treasury: poolTreasury,
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
