import * as anchor from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as Util from "./test-utils";
import { SdkConfig } from "../sdk/src/types";
import { HorseRace, CompetitionData, createCompetition, IDL, getCompetitionData, findCompetitonAddress } from "../sdk/src";
import { createCompetitionWithPools } from "../sdk/src/instructions/admin/create-competition-with-pools";
import { getVersionTxFromInstructions } from "../sdk/src/utils";
import { signAndSendVTx } from "./test-utils";

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
  const {fakeAdmin, program, adminKp, sdkConfig, adminKeys} = await setupEnvironment();
  const {tokenA, priceFeedId, houseCutFactor, minPayoutRatio, interval, startTime, endTime, competitionHash, competitionPubkey} = getCompetitionTestData(program);

  // Get competition creation instruction
  const ix = await createCompetition(
    program,
    adminKp.publicKey,
    competitionHash,
    competitionPubkey,
    tokenA,
    priceFeedId,
    adminKeys,
    houseCutFactor,
    minPayoutRatio,
    interval,
    startTime,
    endTime
  );

  console.log('ix:', ix.data.toJSON());

  // Create and send versioned transaction
  const vtx = await getVersionTxFromInstructions(program.provider.connection, [ix]);
  vtx.sign([adminKp]);

  const signature = await program.provider.connection.sendTransaction(vtx);

  console.log('signature:', signature);
  
  // Use the new confirmation strategy
  const latestBlockhash = await program.provider.connection.getLatestBlockhash();
  const confirmation = await program.provider.connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  });

  console.log('confirmation:', confirmation);

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

export const confirmTransaction = async function (signature: string, program: anchor.Program<HorseRace>) {
  const latestBlockhash = await program.provider.connection.getLatestBlockhash();

  const confirmation = await program.provider.connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  });
  return confirmation;
}

export const setupCompetitionWithPools = async function (): Promise<SetupDTO> {
  const {fakeAdmin, program, sdkConfig, adminKeys, treasury, adminKp} = await setupEnvironment();
  const {tokenA, priceFeedId, houseCutFactor, minPayoutRatio, interval, startTime, endTime, competitionHash, competitionPubkey} = getCompetitionTestData(program);

  // Get versioned transaction and pool keys
  const { competitionTx, poolTxs, poolKeys } = await createCompetitionWithPools(
    program,
    adminKp.publicKey,
    competitionHash,
    tokenA,
    priceFeedId,
    adminKeys,
    houseCutFactor,
    minPayoutRatio,
    interval,
    startTime,
    endTime,
    treasury
  );

  const compSig = await signAndSendVTx(competitionTx, adminKp, program.provider.connection);
  await confirmTransaction(compSig, program);

  const poolSigs = await Promise.all(poolTxs.map(async (tx) => signAndSendVTx(tx, adminKp, program.provider.connection)));
  await Promise.all(poolSigs.map(async (sig) => confirmTransaction(sig, program)));


  const competitionData = await getCompetitionData(competitionHash, program);

  return {
    adminKp,
    competitionPubkey,
    competitionData,
    fakeAdmin,
    program,
    sdkConfig,
    poolKeys: poolKeys ?? [Keypair.generate().publicKey],
  };
}