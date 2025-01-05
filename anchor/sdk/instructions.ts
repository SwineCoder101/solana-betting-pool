import { Program, web3 } from "@coral-xyz/anchor";
import { BettingApp } from "../target/types/betting_app";

export async function createCompetitionInstruction(
  program: Program<BettingApp>,
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
    .accounts({
      competition: competitionPubkey,
      authority,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
}

export async function updateCompetitionInstruction(
  program: Program<BettingApp>,
  competitionPubkey: web3.PublicKey,
  tokenA: web3.PublicKey,
  priceFeedId: string,
  adminPubkeys: web3.PublicKey[],
  houseCutFactor: number,
  minPayoutRatio: number
) {
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
