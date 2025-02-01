import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import {  HorseRace } from "../src";
import { CompetitionProgramData, CompetitionData } from '../src/states/competition-account';

dotenv.config();

const { SOLANA_RPC_URL, PROGRAM_ID, ANCHOR_WALLET } = process.env;

if (!SOLANA_RPC_URL || !PROGRAM_ID || !ANCHOR_WALLET) {
  console.log(PROGRAM_ID,SOLANA_RPC_URL,ANCHOR_WALLET);
  throw new Error('Missing environment variables, ');
}

console.log(process.env.ANCHOR_WALLET);

console.log('connected to: ', SOLANA_RPC_URL);

const connection = new Connection(SOLANA_RPC_URL);


const payer = Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(
      fs.readFileSync(process.env.ANCHOR_WALLET as string, {
        encoding: "utf-8",
      })
    )
  )
);

console.log(payer.publicKey.toBase58())

const user = new NodeWallet(payer);

const provider = new anchor.AnchorProvider(connection, user, {
    commitment: 'processed',
});

anchor.setProvider(provider);

function convertProgramToCompetitionData(programData : CompetitionProgramData) : CompetitionData {
  console.log(typeof programData.minPayoutRatio);
  
  return {
    tokenA : programData.tokenA.toString(),
    priceFeedId: programData.priceFeedId,
    admin: programData.admin.map(a=> a.toString()),
    houseCutFactor: typeof programData.houseCutFactor === 'number' ? programData.houseCutFactor : programData.houseCutFactor.toNumber(),
    minPayoutRatio: typeof programData.minPayoutRatio === 'number' ? programData.minPayoutRatio : programData.minPayoutRatio.toNumber(),
    interval: typeof programData.interval === 'number' ? programData.interval : programData.interval.toNumber(),
    startTime: typeof programData.startTime === 'number' ? programData.startTime : programData.startTime.toNumber(),
    endTime: typeof programData.endTime === 'number' ? programData.endTime : programData.endTime.toNumber()
   }
}

async function main () {
    const retrieved = anchor.getProvider();
    console.log(retrieved);
    const program = anchor.workspace.HorseRace as anchor.Program<HorseRace>;

    const competitions = await program.account.competition.all()

    const competitionData = competitions.map((comp) => convertProgramToCompetitionData(comp.account))
 
    console.log(competitionData);
}

main();