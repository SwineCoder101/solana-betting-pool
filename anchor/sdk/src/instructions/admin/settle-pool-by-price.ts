import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AccountMeta, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { getVersionTxFromInstructions, HorseRace } from "../../utils";
import { BetStatus, getBetAccountsForPool } from "../../states";

export async function settlePoolByPrice(
  program: Program<HorseRace>,
  admin: PublicKey,
  poolKey: PublicKey,
  lowerBoundPrice: number,
  upperBoundPrice: number,

): Promise<VersionedTransaction> {

  const poolAccount = await program.account.pool.fetch(poolKey);
  const treasuryKey = poolAccount.treasury;

  const betAccounts = (await getBetAccountsForPool(program, poolKey)).filter((betAccount) => betAccount.status === BetStatus.Active);
  const userAccounts = betAccounts.map((betAccount) => betAccount.user);
  if (betAccounts.length !== userAccounts.length) {
    throw new Error("Number of bet accounts must match the number of user accounts");
  }

  const remainingAccounts : AccountMeta[] = betAccounts.flatMap((betAccount, index) => [
    { pubkey: new PublicKey(betAccount.publicKey), isWritable: true, isSigner: false },
    { pubkey: new PublicKey(userAccounts[index]), isWritable: true, isSigner: false },
  ]);

  const ix = await program.methods.runSettlePoolByPrice(
      new anchor.BN(lowerBoundPrice),
      new anchor.BN(upperBoundPrice)
    )
    .accountsStrict({
      authority: admin,
      pool: poolKey,
      competition: poolAccount.competitionKey,
      treasury: treasuryKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

    const vtx = await getVersionTxFromInstructions(program.provider.connection, [ix]);

  return vtx;
}
