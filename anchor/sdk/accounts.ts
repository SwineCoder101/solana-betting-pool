import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { HorseRace } from "../target/types/horse_race";

export async function getCompetitionAccount(
  program: Program<HorseRace>,
  competitionPubkey: PublicKey
) {
  return program.account.competition.fetch(competitionPubkey);
}
