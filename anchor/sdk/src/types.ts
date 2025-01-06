import { Program } from "@coral-xyz/anchor";
import { Connection, Signer } from "@solana/web3.js";
import { HorseRace } from "../../target/types/horse_race";

export type SdkConfig = {
    connection: Connection;
    program: Program<HorseRace>;
    url: string;
    idl: HorseRace;
    signer: Signer;
    debug: boolean;
    prioritizationFee?: number;
  };