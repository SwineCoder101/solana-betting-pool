import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import idl from "../target/idl/betting_app.json"; // Adjust path as necessary
import { BettingApp } from "../target/types/betting_app";
import { createCompetitionInstruction, updateCompetitionInstruction } from "./instructions";
import { getCompetitionAccount } from "./accounts";

export class BettingAppSDK {
  public program: Program<BettingApp>;

  constructor(
    connection: Connection,
    wallet: Keypair, // or any Wallet adapter
    programId: PublicKey
  ) {
    const provider = new AnchorProvider(connection, { publicKey: wallet.publicKey, signAllTransactions: wallet.signAllTransactions, signTransaction: wallet.signTransaction } as any, {});
    this.program = new Program<BettingApp>(idl as Idl, programId, provider);
  }

  async createCompetition(
    competitionPubkey: PublicKey,
    tokenA: PublicKey,
    priceFeedId: string,
    adminPubkeys: PublicKey[],
    houseCutFactor: number,
    minPayoutRatio: number
  ) {
    return createCompetitionInstruction(
      this.program,
      competitionPubkey,
      tokenA,
      priceFeedId,
      adminPubkeys,
      houseCutFactor,
      minPayoutRatio
    );
  }

  async updateCompetition(
    competitionPubkey: PublicKey,
    tokenA: PublicKey,
    priceFeedId: string,
    adminPubkeys: PublicKey[],
    houseCutFactor: number,
    minPayoutRatio: number
  ) {
    return updateCompetitionInstruction(
      this.program,
      competitionPubkey,
      tokenA,
      priceFeedId,
      adminPubkeys,
      houseCutFactor,
      minPayoutRatio
    );
  }

  // Example function to fetch the Competition account.
  async getCompetition(competitionPubkey: PublicKey) {
    return getCompetitionAccount(this.program, competitionPubkey);
  }
}

export * from "./instructions";
export * from "./accounts";
