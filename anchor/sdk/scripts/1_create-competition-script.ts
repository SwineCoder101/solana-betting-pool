import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { HorseRace } from '../src';
import { CompetitionPoolParams, createCompetitionWithPoolsEntry } from '../src/instructions/admin/create-competition-with-pools';
import {
  addOneYear,
  confirmTransaction,
  now,
  signAndSendVTx
} from './utils';

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



const params : CompetitionPoolParams = {
  admin: payer.publicKey,
  tokenA: new PublicKey('7yfCkYodjoferYftgGT91H8nPpnspRAv8uv1HzEfhdhm'),
  priceFeedId: '12345',
  adminKeys: [payer.publicKey],
  houseCutFactor: 5,
  minPayoutRatio: 80,
  interval: 30000,
  startTime: 1767225720,
  endTime: 1767225720,
  treasury: payer.publicKey,
}

console.log('admin payer: ', payer.publicKey.toBase58());

async function main() {
  try {
    const startTime = await addOneYear(await now(connection));
    const endTime = startTime + 60;
    const interval = 30;

    params.startTime = startTime;
    params.endTime = endTime;
    params.interval = interval;
    
  const { competitionTx, poolTxs, poolKeys } = await createCompetitionWithPoolsEntry(program, params);

  const compSig = await signAndSendVTx(competitionTx, payer, program.provider.connection);
  await confirmTransaction(compSig, program);

    // Send and confirm pool transactions
    const poolSigs = await Promise.all(
      poolTxs.map(tx => signAndSendVTx(tx, payer, connection))
    );
    await Promise.all(
      poolSigs.map(sig => confirmTransaction(sig, program))
    );

    console.log('Pool Keys:', poolKeys);
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
