import { HorseRace } from "./utils";
import * as HorseRaceIDL from "./idl/horse_race.json"; 
import { PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";

export * from "./instructions/admin";
export * from "./states";
export * from "./utils";


export const IDL = HorseRaceIDL as HorseRace

export const HORSE_RACE_PROGRAM_ID = new PublicKey(HorseRaceIDL.address)

export const HORSE_RACE_PROGRAM = new Program(IDL);