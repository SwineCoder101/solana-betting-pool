import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { getAllBetAccounts, HorseRace } from '../src';

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

const user = new NodeWallet(payer);

const provider = new anchor.AnchorProvider(connection, user, {
    commitment: 'processed',
});

anchor.setProvider(provider);

const program = anchor.workspace.HorseRace as anchor.Program<HorseRace>;


async function main() {
  try {

    console.log('program', program.programId.toBase58());

    const bets = await getAllBetAccounts(program);

    console.log(bets);
    
  } catch (error) {
    console.error('Error creating competition:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
