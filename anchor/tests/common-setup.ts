import * as anchor from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as Util from "./test-utils";
import { SdkConfig } from "../sdk/src/types";
import { HorseRace, CompetitionData, createCompetition, IDL, getCompetitionData, findCompetitonAddress } from "../sdk/src";

export type SetupDTO = {
    competitionPubkey: PublicKey;
    competitionData: CompetitionData;
    fakeAdmin: Keypair;
    program: anchor.Program<HorseRace>;
    sdkConfig: SdkConfig;
}

export const setup = async function (): Promise<SetupDTO> {

console.log("setting up.........");

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// @ts-ignore
const adminPayer = provider.wallet.payer;
const adminKp = Keypair.fromSecretKey(adminPayer.secretKey);

console.log("admin: ", adminKp);

const program = anchor.workspace.HorseRace as anchor.Program<HorseRace>;

  // Airdrop SOL to the admin account
  await provider.connection.requestAirdrop(adminKp.publicKey, LAMPORTS_PER_SOL);
  await Util.logSolBalance("Admin balance", adminPayer.publicKey);
//   await Util.waitAndConfirmSignature(provider.connection, airTx);

  // Create a fake admin keypair
  const fakeAdmin = Keypair.generate();

  // Create competition
  const competitionPubkey = findCompetitonAddress(program.programId.toString());

  const tokenA = Keypair.generate().publicKey;
  const priceFeedId = "SOME_FEED";
  const adminPubkeys = [adminKp.publicKey];
  const houseCutFactor = 1.1;
  const minPayoutRatio = 0.9;

  const startTime = 4070908800;
  const endTime = 4070910600;
  const interval = 6000;

  await createCompetition(
    program,
    adminKp.publicKey,
    competitionPubkey,
    tokenA,
    priceFeedId,
    adminPubkeys,
    houseCutFactor,
    minPayoutRatio,
    interval,
    startTime,
    endTime,
  );

  const competitionData = await getCompetitionData(program);

  const sdkConfig :SdkConfig = {
    connection: provider.connection,
    program,
    url: '',
    idl: IDL,
    signer: adminKp.publicKey.toString(),
    debug: true,
  }


  return {
    competitionPubkey,
    competitionData,
    fakeAdmin,
    program,
    sdkConfig,
  };
};