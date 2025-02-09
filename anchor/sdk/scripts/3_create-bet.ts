import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { HorseRace } from '../src';
import { createBetEntry, CreateBetParams } from '../src/instructions/user/create-bet';
import { BET_AMOUNT_0_2, PRICE_RANGE_CONFIG } from './config';
import {
  confirmTransaction,
  getCompetitionKey,
  getFirstPoolFromCompetition,
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

const createBetParams : CreateBetParams = {
    user: user.publicKey,
    amount: BET_AMOUNT_0_2,
    lowerBoundPrice: PRICE_RANGE_CONFIG.lowerBoundPrice,
    upperBoundPrice: PRICE_RANGE_CONFIG.upperBoundPrice,
    startTime: 1769931882,
    endTime: 1769931912,
    competitionKey: Keypair.generate().publicKey,
    poolKey: Keypair.generate().publicKey,
}


async function main() {
  try {

    if (!createBetParams.poolKey) {
        throw new Error('Pool key is required');
    }

  const competitionKey = await getCompetitionKey(program);
  const poolKey = await getFirstPoolFromCompetition(program, competitionKey);

  console.log('competitionKey', competitionKey.toBase58());
  console.log('poolKey', poolKey.toBase58());

  createBetParams.competitionKey = competitionKey;
  createBetParams.poolKey = poolKey;

  if (!createBetParams.poolKey) {
    throw new Error('Pool key is required');
  }
    
  const betTx = await createBetEntry(program, createBetParams);

  const poolBalanceBefore = await program.provider.connection.getBalance(new PublicKey(createBetParams.poolKey));

  const betSig = await signAndSendVTx(betTx, payer, program.provider.connection);
  await confirmTransaction(betSig, program);

  const poolBalanceAfter = await program.provider.connection.getBalance(new PublicKey(createBetParams.poolKey));

  console.log('Pool Balance Before:', poolBalanceBefore / LAMPORTS_PER_SOL);
  console.log('Pool Balance After:', poolBalanceAfter / LAMPORTS_PER_SOL);

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
