import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { getActiveBetAccountsForUser, getPoolVaultKey, HorseRace } from '../src';
import { cancelAllBetsForUserOnPoolEntry, CancelBetParams } from '../src/instructions/user/cancel-bet';
import {
  confirmTransaction,
  getActiveBetDetails,
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

async function main() {
  try {

  const {activeBets, poolVaultKeys, getPoolBalances} = await getActiveBetDetails(program, user.publicKey);

  console.log('activeBets', activeBets);
  console.log('pool vault keys', poolVaultKeys);


  const poolBalancesBefore = await getPoolBalances;


  if (activeBets.length === 0) {
    throw new Error('No active bets found');
  }

  const createBetParams : CancelBetParams = {
      user: user.publicKey,
      poolKey: new PublicKey(activeBets[0].poolKey),
  }
    
  const {txs} = await cancelAllBetsForUserOnPoolEntry(program, createBetParams);

  const betSigs = await Promise.all(txs.map(async (betTx) => await signAndSendVTx(betTx, payer, program.provider.connection)))
  await Promise.all(betSigs.map((betSig) => confirmTransaction(betSig, program)));

  const poolBalancesAfter = await getPoolBalances;
  
  console.log('pool balances', poolBalancesBefore);
  console.log('pool balances', poolBalancesAfter);

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
