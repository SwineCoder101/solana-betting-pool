import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { getAllBetAccounts, getBetAccountsForPool, HorseRace } from '../src';
import { settlePoolByPrice } from '../src/instructions/admin/settle-pool-by-price';
import {
    confirmTransaction,
    getCompetitionKey,
    getFirstPoolFromCompetition,
    signAndSendVTx
} from './utils';
import { PRICE_RANGE_CONFIG } from './config';

dotenv.config();

const { SOLANA_RPC_URL, PROGRAM_ID, ANCHOR_WALLET } = process.env;

if (!SOLANA_RPC_URL || !PROGRAM_ID || !ANCHOR_WALLET) {
  throw new Error('Missing environment variables');
}

const connection = new Connection(SOLANA_RPC_URL);
const payer = Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(
      fs.readFileSync(ANCHOR_WALLET, { encoding: "utf-8" })
    )
  )
);
const wallet = new NodeWallet(payer);
const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: 'confirmed'
});

anchor.setProvider(provider);
const program = anchor.workspace.HorseRace as anchor.Program<HorseRace>;

// Configuration - Update these values according to your test scenario
const SETTLE_CONFIG = {
  poolKey: new PublicKey('6hnTNibVauiQRJASs45BqHk6JWqsp6UwV4ebap3eaYi1'),
  lowerBoundPrice: PRICE_RANGE_CONFIG.lowerBoundPrice,
  upperBoundPrice: PRICE_RANGE_CONFIG.upperBoundPrice,
};

async function main() {
  try {

    const competitionKey = await getCompetitionKey(program);
    const poolKey = await getFirstPoolFromCompetition(program, competitionKey);

    console.log('competitionKey', competitionKey);
    console.log('poolKey', poolKey);

    SETTLE_CONFIG.poolKey = poolKey;

    // Fetch pool state
    const poolAccount = await program.account.pool.fetch(SETTLE_CONFIG.poolKey);


    const userBalanceBefore = await connection.getBalance(payer.publicKey);
    const treasuryBalanceBefore = await connection.getBalance(poolAccount.treasury);
    const poolBalanceBefore = await connection.getBalance(SETTLE_CONFIG.poolKey);
    
    // Settlement validation checks
    console.log('Pool State Before Settlement:');
    console.log('- Total Balance:', await connection.getBalance(SETTLE_CONFIG.poolKey));
    console.log('- Competition:', poolAccount.competitionKey.toString());
    console.log('- Treasury:', poolAccount.treasury.toString());

    // Generate settlement transaction
    const settleTx = await settlePoolByPrice(
      program,
      payer.publicKey,  // Admin authority
      SETTLE_CONFIG.poolKey,
      SETTLE_CONFIG.lowerBoundPrice,
      SETTLE_CONFIG.upperBoundPrice
    );
    

    const userBalanceAfter = await connection.getBalance(payer.publicKey);
    const poolBalanceAfter = await connection.getBalance(SETTLE_CONFIG.poolKey);
    const treasuryBalanceAfter = await connection.getBalance(poolAccount.treasury);

    // Send and confirm transaction
    const settleSig = await signAndSendVTx(settleTx, payer, connection);
    await confirmTransaction(settleSig, program);

    // Post-settlement checks
    
    console.log('- Total Balance:', await connection.getBalance(SETTLE_CONFIG.poolKey));

    // Display all bets
    const bets = await getAllBetAccounts(program);
    console.log('Bets:', bets);

    // Settle Config
    console.log('Settle Config:', SETTLE_CONFIG);

    // Display balances before and after

    console.log('-------BALANCES BEFORE--------');
    
    console.log('User Balance Before:', userBalanceBefore / LAMPORTS_PER_SOL);
    console.log('Pool Balance Before:', poolBalanceBefore / LAMPORTS_PER_SOL);
    console.log('Treasury Balance Before:', treasuryBalanceBefore / LAMPORTS_PER_SOL);

    console.log('-------BALANCES AFTER--------');
    
    console.log('User Balance After:', userBalanceAfter / LAMPORTS_PER_SOL);
    console.log('Pool Balance After:', poolBalanceAfter / LAMPORTS_PER_SOL);
    console.log('Treasury Balance After:', treasuryBalanceAfter / LAMPORTS_PER_SOL);

    // Verify bet states
    const betAccounts = await getBetAccountsForPool(program, SETTLE_CONFIG.poolKey);

    console.log('betAccounts', betAccounts);

  } catch (error) {
    console.error('Settlement Error:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });