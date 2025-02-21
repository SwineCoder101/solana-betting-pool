import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { HorseRace } from "../src";
import { CompetitionProgramData, CompetitionData } from '../src/states/competition-account';
import { Program, ProgramAccount } from '@coral-xyz/anchor';
import { convertBlockTime, setupEnvironment } from './utils';

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

export function convertProgramToCompetitionData(programData : ProgramAccount<CompetitionProgramData>) : CompetitionData {
  console.log(typeof programData.account.minPayoutRatio);
  
  return {
    competitionKey: programData.publicKey.toBase58(),
    tokenA : programData.account.tokenA.toString(),
    priceFeedId: programData.account.priceFeedId,
    admin: programData.account.admin.map(a=> a.toString()),
    houseCutFactor: typeof programData.account.houseCutFactor === 'number' ? programData.account.houseCutFactor : programData.account.houseCutFactor.toNumber(),
    minPayoutRatio: typeof programData.account.minPayoutRatio === 'number' ? programData.account.minPayoutRatio : programData.account.minPayoutRatio.toNumber(),
    interval: typeof programData.account.interval === 'number' ? programData.account.interval : programData.account.interval.toNumber(),
    startTime: typeof programData.account.startTime === 'number' ? programData.account.startTime : programData.account.startTime.toNumber(),
    endTime: typeof programData.account.endTime === 'number' ? programData.account.endTime : programData.account.endTime.toNumber()
   }
}

export async function getPoolAccountsFromCompetition(program: Program<HorseRace>, competitionKey: PublicKey) {
  const pools = await program.account.pool.all();
  return pools.filter(pool => pool.account.competition.toBase58() === competitionKey.toBase58());
}

async function main() {
  const { program } = await setupEnvironment();

  // Fetch competitions and pools
  const competitions = await program.account.competition.all();
  const pools = await program.account.pool.all();

  if (competitions.length === 0) {
    console.log('No competitions found');
    return;
  }

  if (pools.length === 0) {
    console.log('No pools found');
    return;
  }
  // Create a Map to store pools grouped by competition
  const poolCompetitionMapping = new Map<string, Map<number, PublicKey>>();

  // Process each pool and group by competition
  pools.forEach(pool => {
    const competitionKey = pool.account.competition.toBase58();
    const startTime = pool.account.startTime.toNumber();
    
    // Get or create the pools map for this competition
    if (!poolCompetitionMapping.has(competitionKey)) {
      poolCompetitionMapping.set(competitionKey, new Map<number, PublicKey>());
    }
    
    // Add pool to the competition's pool map
    const competitionPools = poolCompetitionMapping.get(competitionKey)!;
    competitionPools.set(startTime, pool.publicKey);
  });

  // Print competitions with their pools
  competitions.forEach(comp => {
    const competitionKey = comp.publicKey.toBase58();
    const pools = poolCompetitionMapping.get(competitionKey);
    console.log('\nCompetition:', competitionKey);
    console.log('Start Time:', convertBlockTime(comp.account.startTime) , comp.account.startTime.toNumber());
    console.log('End Time:', convertBlockTime(comp.account.endTime), comp.account.endTime.toNumber());
    console.log('Pools:');
    if (pools && pools.size > 0) {
      Array.from(pools.entries())
        .sort(([timeA], [timeB]) => timeA - timeB)
        .forEach(([startTime, poolPubkey]) => {
          console.log(`  - ${poolPubkey.toBase58()} (starts: ${convertBlockTime(startTime)}, ${startTime})`);
        });
    } else {
      console.log('  No pools');
    }
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });