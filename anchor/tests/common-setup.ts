import * as anchor from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as Util from "./test-utils";
import { SdkConfig } from "../sdk/src/types";
import { HorseRace, CompetitionData, createCompetition, IDL, getCompetitionData, findCompetitonAddress } from "../sdk/src";
import { createCompetitionWithPools } from "../sdk/src/instructions/admin/create-competition-with-pools";
import { getVersionTxFromInstructions } from "../sdk/src/utils";
import { signAndSendVTx } from "./test-utils";
import { Program, web3 } from "@coral-xyz/anchor";
import { createTreasury } from "../sdk/src";
import { TreasuryAccount } from "../sdk/src/states/treasury-account";
import { createUserWithFunds } from "./test-utils";

export type SetupDTO = {
    adminKp: Keypair;
    competitionPubkey: PublicKey;
    competitionData: CompetitionData;
    poolKeys?: PublicKey[];
    fakeAdmin: Keypair;
    program: Program<HorseRace>;
    sdkConfig: SdkConfig;
    treasury: PublicKey;
    poolTreasuryPubkey: PublicKey;
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
  const treasury = Keypair.generate().publicKey;
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
  const {fakeAdmin, program, adminKp, sdkConfig, adminKeys, treasury} = await setupEnvironment();
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
    treasury,
    fakeAdmin,
    program,
    sdkConfig,
    poolTreasuryPubkey: Keypair.generate().publicKey,
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

export const setupCompetitionWithPools = async function (bypassTreasury: boolean = false): Promise<SetupDTO> {
  const { fakeAdmin, program, sdkConfig, adminKeys, treasury, adminKp} = await setupEnvironment();
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

  // if treasury is not created, create it
  const treasuryInitialized = await TreasuryAccount.isInitialized(program)
  let poolTreasuryPubkey: PublicKey = Keypair.generate().publicKey;
  
  if (!bypassTreasury) {
    if (!treasuryInitialized) {
      poolTreasuryPubkey =  await Util.createTreasuryUtil(program, adminKp);
      console.log('poolTreasuryPubkey:', poolTreasuryPubkey.toBase58());
    } else {
      console.log('Treasury already initialized, using existing treasury');
    }
  } else {
    console.log('Bypassing treasury creation');
  }

  return {
    adminKp,
    competitionPubkey,
    competitionData,
    treasury,
    fakeAdmin,
    program,
    sdkConfig,
    poolKeys: poolKeys ?? [Keypair.generate().publicKey],
    poolTreasuryPubkey,
  };
}

export interface CommonSetup {
  program: Program<HorseRace>;
  treasuryKey: web3.PublicKey;
  adminWallet: web3.Keypair;
  payer: web3.Keypair;
}

export async function setupTreasury(): Promise<CommonSetup> {
  const program = anchor.workspace.HorseRace as Program<HorseRace>;
  const payer = await createUserWithFunds(program.provider.connection);
  const adminWallet = await createUserWithFunds(program.provider.connection);

  // Create treasury with admin
  const treasuryInitialized = await TreasuryAccount.isInitialized(program)

  if (!treasuryInitialized) {
    const ix = await createTreasury(program, {
      maxAdmins: 1,
      minSignatures: 1,
      initialAdmins: [adminWallet.publicKey],
      payer: payer.publicKey,
    });

    const vtx = await getVersionTxFromInstructions(program.provider.connection, [ix], payer.publicKey);
    const sig = await signAndSendVTx(vtx, payer, program.provider.connection);
    await confirmTransaction(sig, program);
  }

  const [treasuryKey] = await TreasuryAccount.getPda(program);
  return { 
    program,
    treasuryKey, 
    adminWallet,
    payer,
  };
}