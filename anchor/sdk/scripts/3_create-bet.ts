import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { HorseRace } from '../src';
import { createBetEntry, CreateBetParams } from '../src/instructions/user/create-bet';
import {
    confirmTransaction,
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
    amount: 1,
    lowerBoundPrice: 100,
    upperBoundPrice: 200,
    startTime: 1769931882,
    endTime: 1769931912,
    competitionKey: new PublicKey('ApiSSrYLUTvhTzLNudofmRhSChx4uobviTKJtkncvxZL'),
    poolKey: new PublicKey('6hnTNibVauiQRJASs45BqHk6JWqsp6UwV4ebap3eaYi1'),
}


async function main() {
  try {

    if (!createBetParams.poolKey) {
        throw new Error('Pool key is required');
    }
    
  const betTx = await createBetEntry(program, createBetParams);

  const poolBalanceBefore = await program.provider.connection.getBalance(new PublicKey(createBetParams.poolKey));

  const betSig = await signAndSendVTx(betTx, payer, program.provider.connection);
  await confirmTransaction(betSig, program);

  const poolBalanceAfter = await program.provider.connection.getBalance(new PublicKey(createBetParams.poolKey));

  console.log('Pool Balance Before:', poolBalanceBefore);
  console.log('Pool Balance After:', poolBalanceAfter);

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
