import { Program, web3 } from "@coral-xyz/anchor";
import { HorseRace } from "../../../../target/types/horse_race";

export async function updateCompetitionInstruction(
  program: Program<HorseRace>,
  competitionPubkey: web3.PublicKey,
  tokenA: web3.PublicKey,
  priceFeedId: string,
  adminPubkeys: web3.PublicKey[],
  houseCutFactor: number,
  minPayoutRatio: number
){
  const authority = program.provider.publicKey;

  return program.methods
    .runUpdateCompetition(
      tokenA,
      priceFeedId,
      adminPubkeys,
      houseCutFactor,
      minPayoutRatio
    )
    .accounts({
      competition: competitionPubkey,
      authority,
    })
    .rpc();
}
