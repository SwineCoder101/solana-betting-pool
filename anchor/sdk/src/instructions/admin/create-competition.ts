import { Program, web3 } from "@coral-xyz/anchor";
import { HorseRace } from "../../../../target/types/horse_race";
import {SystemProgram} from "@solana/web3.js"

export async function createCompetition(
  program: Program<HorseRace>,
  competitionPubkey: web3.PublicKey,
  tokenA: web3.PublicKey,
  priceFeedId: string,
  adminPubkeys: web3.PublicKey[],
  houseCutFactor: number,
  minPayoutRatio: number
) {
  // Typically you would also derive PDAs or use your own competitionPubkey.
  const authority = program.provider.publicKey;
  
  return program.methods
    .runCreateCompetition(
      tokenA,
      priceFeedId,
      adminPubkeys,
      houseCutFactor,
      minPayoutRatio
    )
    .accountsStrict({
      competition: competitionPubkey,
      authority,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}