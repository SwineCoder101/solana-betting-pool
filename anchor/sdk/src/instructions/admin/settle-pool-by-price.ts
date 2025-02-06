import { Program } from "@coral-xyz/anchor";
import { HorseRace } from "../../utils";
import { PublicKey } from "@solana/web3.js";


export async function settlePoolByPrice(
  program: Program<HorseRace>,
  admin: PublicKey,
  poolKey: PublicKey,
  lowerBoundPrice: number,
  upperBoundPrice: number,
) {
    const ix = await program.methods.settlePoolByPrice(lowerBoundPrice, upperBoundPrice)
    .accounts({
        authority: admin,
        pool: poolKey,
        treasury: treasuryKey,
    })
    .transaction();
}