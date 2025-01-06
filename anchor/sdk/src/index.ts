import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import idl from "../../target/idl/horse_race.json"; // Adjust path as necessary
import { HorseRace } from "../../target/types/horse_race";
import { createCompetitionInstruction, updateCompetitionInstruction } from "./instructions/instructions";
import { getCompetitionAccount } from "./accounts/accounts";

export class BettingAppSDK {
  public program: Program<HorseRace>;

  constructor(
    connection: Connection,
    wallet: Keypair, // or any Wallet adapter
    programId: PublicKey
  ) {
    const provider = new AnchorProvider(connection, { publicKey: wallet.publicKey, signAllTransactions: wallet.signAllTransactions, signTransaction: wallet.signTransaction } as any, {});
    this.program = new Program<HorseRace>(idl as Idl, programId, provider);
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

export * from "./instructions/instructions"; // Ensure that the './instructions' module exists and is correctly named
export * from "./accounts/accounts";
