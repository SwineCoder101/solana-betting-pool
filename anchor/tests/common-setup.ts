import * as anchor from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as Util from "./test-utils";
import { SdkConfig } from "../sdk/src/types";
import { HorseRace, CompetitionData, createCompetition, IDL, getCompetitionData, findCompetitonAddress } from "../sdk/src";
import { createCompetitionWithPools } from "../sdk/src/instructions/admin/create-competition-with-pools";

export type SetupDTO = {
    adminKp: Keypair;
    competitionPubkey: PublicKey;
    competitionData: CompetitionData;
    poolKeys?: PublicKey[];
    fakeAdmin: Keypair;
    program: anchor.Program<HorseRace>;
    sdkConfig: SdkConfig;
}

export type EnvironmentSetupDTO = {
  fakeAdmin: Keypair;
  adminKp: Keypair;
  adminKeys: PublicKey[];
  program: anchor.Program<HorseRace>;
  sdkConfig: SdkConfig;
  provider: anchor.AnchorProvider;
  treasury: PublicKey;
}

export const setupEnvironment = async function (): Promise<EnvironmentSetupDTO> {
  const provider = anchor.AnchorProvider.env();
  const treasury = provider.wallet.publicKey;
  anchor.setProvider(provider);
  
  // @ts-expect-error-ignore
  const adminPayer = provider.wallet.payer;
  const adminKp = Keypair.fromSecretKey(adminPayer.secretKey);
  
  const program = anchor.workspace.HorseRace as anchor.Program<HorseRace>;
  
    // Airdrop SOL to the admin account
    await provider.connection.requestAirdrop(adminKp.publicKey, LAMPORTS_PER_SOL);
    await Util.logSolBalance("Admin balance", adminPayer.publicKey);
  //   await Util.waitAndConfirmSignature(provider.connection, airTx);
  
    // Create a fake admin keypair
    const fakeAdmin = Keypair.generate();

    const sdkConfig: SdkConfig = {
      connection: provider.connection,
      provider: provider,
      program,
      url: '',
      idl: IDL,
      signer: adminKp.publicKey.toString(),
      debug: true,
    }

    const adminKeys = [adminKp.publicKey];

    return {
      provider,
      fakeAdmin,
      adminKp,
      adminKeys,
      program,
      sdkConfig,
      treasury,
  }
}

export const getCompetitionTestData = (program) => {
  const tokenA = Keypair.generate().publicKey;
  const priceFeedId = "SOME_FEED";
  const houseCutFactor = 1.1;
  const minPayoutRatio = 0.9;
  const interval = 600;
  const startTime = 4070908800;
  const endTime = 4070910600;

  const competitionHash = Keypair.generate().publicKey;
  const competitionPubkey = findCompetitonAddress(competitionHash , program.programId.toString());
  return {
    competitionPubkey,
    competitionHash,
    tokenA,
    priceFeedId,
    houseCutFactor,
    minPayoutRatio,
    interval,
    startTime,
    endTime,
  };
}

export const setupCompetition = async function (): Promise<SetupDTO> {

console.log("setting up.........");

  const {fakeAdmin,program, adminKp,sdkConfig, adminKeys} = await setupEnvironment();
  const {tokenA, priceFeedId, houseCutFactor, minPayoutRatio, interval, startTime, endTime, competitionHash, competitionPubkey} = getCompetitionTestData(program);

  await createCompetition(
    program,
    adminKp,
    competitionHash,
    competitionPubkey,
    tokenA,
    priceFeedId,
    adminKeys,
    houseCutFactor,
    minPayoutRatio,
    interval,
    startTime,
    endTime,
  );

  const competitionData = await getCompetitionData(competitionHash, program);

  return {
    adminKp,
    competitionPubkey,
    competitionData,
    fakeAdmin,
    program,
    sdkConfig,
  };
};

export const setupCompetitionWithPools = async function (): Promise<SetupDTO> {

  const {fakeAdmin,program,sdkConfig, adminKeys, treasury, adminKp} = await setupEnvironment();
  const {tokenA, priceFeedId, houseCutFactor, minPayoutRatio, interval, startTime, endTime, competitionHash, competitionPubkey} = getCompetitionTestData(program);

  const {poolKeys}  = await createCompetitionWithPools(
    program,
    adminKp,
    competitionHash,
    tokenA,
    priceFeedId,
    adminKeys,
    houseCutFactor,
    minPayoutRatio,
    interval,
    startTime,
    endTime,
    treasury,
  )

  const competitionData = await getCompetitionData(competitionHash, program);


  return {
    adminKp,
    competitionPubkey,
    competitionData,
    fakeAdmin,
    program,
    sdkConfig,
    poolKeys: poolKeys ?? [ Keypair.generate().publicKey],
  };
}