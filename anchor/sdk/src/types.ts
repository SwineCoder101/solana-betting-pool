import { Program } from "@coral-xyz/anchor";
import { Tokenescrow } from "@project/anchor";
import { Connection, Signer } from "@solana/web3.js";

export type SdkConfig = {
    connection: Connection;
    program: Program<Tokenescrow>;
    url: string;
    idl: Tokenescrow;
    signer: Signer;
    debug: boolean;
    prioritizationFee?: number;
  };