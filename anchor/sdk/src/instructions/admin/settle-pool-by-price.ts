import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { HorseRace } from "../../utils";

export async function settlePoolByPrice(
  program: Program<HorseRace>,
  admin: PublicKey,
  competitionKey: PublicKey,
  poolKey: PublicKey,
  lowerBoundPrice: number,
  upperBoundPrice: number,
  betAccounts: PublicKey[],
  userAccounts: PublicKey[]
): Promise<TransactionInstruction> {

  const poolAccount = await program.account.pool.fetch(poolKey);
  const treasuryKey = poolAccount.treasury;

  if (betAccounts.length !== userAccounts.length) {
    throw new Error("Number of bet accounts must match the number of user accounts");
  }

  const remainingAccounts = betAccounts.flatMap((betAccount, index) => [
    { pubkey: betAccount, isWritable: true, isSigner: false },
    { pubkey: userAccounts[index], isWritable: true, isSigner: false },
  ]);

  const ix = await program.methods.runSettlePoolByPrice(
      competitionKey,
      new anchor.BN(lowerBoundPrice),
      new anchor.BN(upperBoundPrice)
    )
    .accountsStrict({
      authority: admin,
      pool: poolKey,
      treasury: treasuryKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  return ix;
}
