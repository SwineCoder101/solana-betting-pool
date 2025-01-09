import { Program, web3 } from "@coral-xyz/anchor";
import { BettingApp } from "../target/types/betting_app";

export async function getAllCompetitionsWithFilter(program: Program<BettingApp>, adminPubkey: web3.PublicKey) {
  return program.account.competition.all([
    {
      memcmp: {
        offset: 8 + 32 + (4 + 200), // Calculate offset to the `admin` field in your struct
        bytes: adminPubkey.toBase58(),
      },
    },
  ]);
}
