import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import { CompetitionData, createCompetition, createTreasury, findCompetitonAddress, getCompetitionData, IDL } from "../sdk/src";
import { createCompetitionWithPools } from "../sdk/src/instructions/admin/create-competition-with-pools";
import { TreasuryAccount } from "../sdk/src/states/treasury-account";
import { SdkConfig } from "../sdk/src/types";
import { getVersionTxFromInstructions, HorseRace } from "../sdk/src/utils";
import { signAndSendVTx } from "./test-utils";

export type SetupDTO = {
    testAdmin: Keypair;
    testPlayerOne: Keypair;
    testPlayerTwo: Keypair;
    competitionPubkey: PublicKey;
    competitionData: CompetitionData;
    poolKeys?: PublicKey[];
    program: Program<HorseRace>;
    sdkConfig: SdkConfig;
    treasury: PublicKey;
}

export type EnvironmentSetup = {
  testAdmin: Keypair;
  testPlayerOne: Keypair;
  testPlayerTwo: Keypair;
  adminKeys: PublicKey[];
  program: anchor.Program<HorseRace>;
  sdkConfig: SdkConfig;
  provider: anchor.AnchorProvider;
  treasury: PublicKey;
}

export interface TreasurySetup {
  program: Program<HorseRace>;
  treasuryKey: web3.PublicKey;
  adminWallet: web3.Keypair;
  treasuryAccount?: TreasuryAccount;
}

export type UserSetup = {
  testAdmin: Keypair;
  testPlayerOne: Keypair;
  testPlayerTwo: Keypair;
}

export const setupEnvironment = async function (): Promise<EnvironmentSetup> {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  // Retrieve the program from the workspace
  const program = anchor.workspace.HorseRace as anchor.Program<HorseRace>;

  const [treasury] = await TreasuryAccount.getTreasuryPda(program);
  
  const {testAdmin, testPlayerOne, testPlayerTwo} = await setupUsers(provider.connection);


  const sdkConfig: SdkConfig = {
      connection: provider.connection,
      provider: provider,
      program,
      url: '',
      idl: IDL,
      signer: testAdmin.publicKey.toString(),
      debug: true,
  }

  const adminKeys = [testAdmin.publicKey];

  return {
      provider,
      testAdmin,
      testPlayerOne,
      testPlayerTwo,
      adminKeys,
      program,
      sdkConfig,
      treasury, // now the correct PDA treasury
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
  const { testAdmin, program, sdkConfig, adminKeys, treasury, testPlayerOne, testPlayerTwo} = await setupEnvironment();
  const {tokenA, priceFeedId, houseCutFactor, minPayoutRatio, interval, startTime, endTime, competitionHash, competitionPubkey} = getCompetitionTestData(program);

  // Get competition creation instruction
  const ix = await createCompetition(
    program,
    testAdmin.publicKey,
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
  vtx.sign([testAdmin]);

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
    testAdmin,
    testPlayerOne,
    testPlayerTwo,
    competitionPubkey,
    competitionData,
    treasury,
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

export const setupCompetitionWithPools = async function (bypassTreasury: boolean = false): Promise<SetupDTO> {
  const { testAdmin, program, sdkConfig, adminKeys, treasury, testPlayerOne, testPlayerTwo} = await setupEnvironment();
  const {tokenA, priceFeedId, houseCutFactor, minPayoutRatio, interval, startTime, endTime, competitionHash, competitionPubkey} = getCompetitionTestData(program);

  let treasuryToUse = treasury;
  // if treasury is not created, create it
  const treasuryInitialized = await TreasuryAccount.isInitialized(program)
  
  if (!bypassTreasury) {
    if (!treasuryInitialized) {
      const setup = await setupTreasury(testAdmin);

      if (!setup.treasuryAccount?.vaultKey) {
        throw new Error('Treasury vault key not found');
      }

      treasuryToUse = setup.treasuryAccount?.vaultKey;




    } else {
      console.log('Treasury already initialized, using existing treasury');
    }
  } else {
    console.log('Bypassing treasury creation');
  }
  
  // Airdrop SOL to treasury
  await airdropSOL(treasuryToUse, program.provider.connection);
  const treasuryBalance = await program.provider.connection.getBalance(treasuryToUse);
  console.log('>>>> treasury: ', treasuryToUse.toBase58(), ' treasuryBalance:', treasuryBalance);
  console.log('poolTreasuryPubkey:', treasuryToUse.toBase58());

  // Get versioned transaction and pool keys
  const { competitionTx, poolTxs, poolKeys } = await createCompetitionWithPools(
    program,
    testAdmin.publicKey,
    competitionHash,
    tokenA,
    priceFeedId,
    adminKeys,
    houseCutFactor,
    minPayoutRatio,
    interval,
    startTime,
    endTime,
  );

  const compSig = await signAndSendVTx(competitionTx, testAdmin, program.provider.connection);
  await confirmTransaction(compSig, program);

  const poolSigs = await Promise.all(poolTxs.map(async (tx) => signAndSendVTx(tx, testAdmin, program.provider.connection)));
  await Promise.all(poolSigs.map(async (sig) => confirmTransaction(sig, program)));


  const competitionData = await getCompetitionData(competitionHash, program);


  console.log('===========================')
  console.log('competitionData:', competitionData);
  console.log('poolKeys:', poolKeys);
  console.log('treasuryToUse:', treasuryToUse.toBase58());
  console.log('===========================')



  return {
    testAdmin,
    testPlayerOne,
    testPlayerTwo,
    competitionPubkey,
    competitionData,
    treasury : treasuryToUse,
    program,
    sdkConfig,
    poolKeys: poolKeys ?? [Keypair.generate().publicKey],
  };
}

export async function airdropSOLIfNeeded(
  keypair: Keypair,
  connection: Connection,
  minBalance: number = LAMPORTS_PER_SOL
): Promise<void> {
  await airdropSOL(keypair.publicKey, connection, minBalance);
}

export async function airdropSOL(
  user: PublicKey,
  connection: Connection,
  minBalance: number = LAMPORTS_PER_SOL
): Promise<void> {

  const balance = await connection.getBalance(user);
  if (balance < minBalance) {
    const amountToAirdrop = (minBalance - balance) * 40;
    const signature = await connection.requestAirdrop(user, amountToAirdrop);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
  }
}

function loadKeypair(filePath: string): Keypair {
  const secretKeyString = fs.readFileSync(filePath, "utf8");
  const secretKeyArray = JSON.parse(secretKeyString);
  if (secretKeyArray.length !== 64) {
    throw new Error(`Expected secret key length to be 64, but got ${secretKeyArray.length}`);
  }
  return Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
}

export async function setupUsers(connection: Connection) : Promise<UserSetup> {

  const adminKeyPath = path.join(__dirname, "config/test-admin.json");
  const playerOneKeyPath = path.join(__dirname, "config/test-player-one.json");
  const playerTwoKeyPath = path.join(__dirname, "config/test-player-two.json");

  // load keypair from file
  const testAdmin = loadKeypair(adminKeyPath);
  const testPlayerOne = loadKeypair(playerOneKeyPath);
  const testPlayerTwo = loadKeypair(playerTwoKeyPath);

  // Airdrop SOL if needed
  await airdropSOLIfNeeded(testAdmin, connection);
  await airdropSOLIfNeeded(testPlayerOne, connection);
  await airdropSOLIfNeeded(testPlayerTwo, connection);

  // show balances
  console.log('--------------------------------');
  console.log('testadmin Address: ', testAdmin.publicKey.toBase58(), 'testAdmin balance:', await connection.getBalance(testAdmin.publicKey));
  console.log('testPlayerOne Address: ', testPlayerOne.publicKey.toBase58(), 'testPlayerOne balance:', await connection.getBalance(testPlayerOne.publicKey));
  console.log('testPlayerTwo Address: ', testPlayerTwo.publicKey.toBase58(), 'testPlayerTwo balance:', await connection.getBalance(testPlayerTwo.publicKey));
  console.log('--------------------------------');


  return {
    testAdmin,
    testPlayerOne,
    testPlayerTwo,
  }
}


export async function setupTreasury(adminWallet: Keypair): Promise<TreasurySetup> {
  const program = anchor.workspace.HorseRace as Program<HorseRace>;
  const treasuryInitialized = await TreasuryAccount.isInitialized(program)

  if (!treasuryInitialized) {
    const ix = await createTreasury(program, {
      maxAdmins: 1,
      minSignatures: 1,
      initialAdmins: [adminWallet.publicKey],
      payer: adminWallet.publicKey,
    });

    const vtx = await getVersionTxFromInstructions(program.provider.connection, [ix], adminWallet.publicKey);
    const sig = await signAndSendVTx(vtx, adminWallet, program.provider.connection);
    await confirmTransaction(sig, program);
  }

  const [treasuryKey] = await TreasuryAccount.getTreasuryPda(program);
  const treasuryAccount = await TreasuryAccount.getInstance(program);

  return { 
    program,
    treasuryKey, 
    adminWallet,
    treasuryAccount,
  };
}
