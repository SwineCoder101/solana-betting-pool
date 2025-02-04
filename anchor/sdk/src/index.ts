import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import * as HorseRaceIDL from "./idl/horse_race.json";
import { HorseRace } from "./utils";

export * from "./instructions/admin";
export * from "./states";
export * from "./utils";

export const IDL = HorseRaceIDL as HorseRace;

export const HORSE_RACE_PROGRAM_ID = new PublicKey(HorseRaceIDL.address);

// Instead of creating the program directly, create a function to get the program with a provider
export function getProgram(provider: AnchorProvider) {
  return new Program(IDL, provider);
}

// Helper function to create provider if needed
export function createProvider(connection: Connection, wallet: Wallet): AnchorProvider {
  return new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
}