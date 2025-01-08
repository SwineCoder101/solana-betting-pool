import * as anchor from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as Util from "./test-utils";
import { SdkConfig } from "../sdk/src/types";
import { HorseRace, CompetitionData, createCompetition, IDL, getCompetitionData } from "../sdk/src";

export type SetupDTO = {
    competitionPubkey: PublicKey;
    competitionData: CompetitionData;
    fakeAdmin: Keypair;
    program: anchor.Program<HorseRace>;
    sdkConfig: SdkConfig;
}

export const setup = async function (): Promise<SetupDTO> {

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// @ts-ignore
const adminPayer = provider.wallet.payer;
const adminKp = Keypair.fromSecretKey(adminPayer.secretKey);

let fakeAdmin: Keypair;

  const program = anchor.workspace.HorseRace as anchor.Program<HorseRace>;

  // Airdrop SOL to the admin account
  const airTx = await provider.connection.requestAirdrop(adminKp.publicKey, LAMPORTS_PER_SOL);
  await Util.waitAndConfirmSignature(provider.connection, airTx);

  await Util.logSolBalance("Admin balance", adminPayer.publicKey);

  // Create a fake admin keypair
  fakeAdmin = Keypair.generate();

  // Create competition
  const competitionPubkey = Keypair.generate().publicKey;
  const tokenA = Keypair.generate().publicKey;
  const priceFeedId = "SOME_FEED";
  const adminPubkeys = [adminKp.publicKey];
  const houseCutFactor = 3;
  const minPayoutRatio = 2;

  await createCompetition(
    program,
    competitionPubkey,
    tokenA,
    priceFeedId,
    adminPubkeys,
    houseCutFactor,
    minPayoutRatio
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