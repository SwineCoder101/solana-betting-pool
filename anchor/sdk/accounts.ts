import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { BettingApp } from "../target/types/betting_app";

export async function getCompetitionAccount(
  program: Program<BettingApp>,
  competitionPubkey: PublicKey
) {
  return program.account.competition.fetch(competitionPubkey);
}
