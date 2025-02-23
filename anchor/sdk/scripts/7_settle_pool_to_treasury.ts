import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { getAllBetAccounts, HorseRace } from '../src';
import { settlePoolByPrice } from '../src/instructions/admin/settle-pool-by-price';
import { TreasuryAccount } from '../src/states/treasury-account';
import { PRICE_RANGE_CONFIG } from './config';
import {
  confirmTransaction,
  getActiveBetDetails,
  getCompetitionKey,
  signAndSendVTx
} from './utils';

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


async function main() {
  try {

    const {poolKeys} = await getActiveBetDetails(program, wallet.publicKey);

    // Configuration - Update these values according to your test scenario
    const settleConfig = {
      poolKey: new PublicKey(poolKeys[0]),
      lowerBoundPrice: PRICE_RANGE_CONFIG.lowerBoundPrice,
      upperBoundPrice: PRICE_RANGE_CONFIG.upperBoundPrice,
    };


    const competitionKey = await getCompetitionKey(program);

    console.log('competitionKey', competitionKey);

    // Fetch pool state
    const poolAccount = await program.account.pool.fetch(settleConfig.poolKey);

    const treasuryAccount = await TreasuryAccount.getInstance(program);


    const userBalanceBefore = await connection.getBalance(payer.publicKey);
    const treasuryBalanceBefore = await connection.getBalance(treasuryAccount.vaultKey);
    const poolBalanceBefore = await connection.getBalance(poolAccount.vaultKey);
    
    // Settlement validation checks
    console.log('Pool State Before Settlement:');
    console.log('- Pool vault:', poolAccount.vaultKey.toBase58());
    console.log('- Competition:', poolAccount.competition.toBase58());
    console.log('- Treasury:', treasuryAccount.vaultKey.toBase58());

    // Generate settlement transaction
    const settleTx = await settlePoolByPrice(
      program,
      payer.publicKey,  // Admin authority
      settleConfig.poolKey,
      settleConfig.lowerBoundPrice,
      settleConfig.upperBoundPrice
    );
    

    const userBalanceAfter = await connection.getBalance(payer.publicKey);
    const poolBalanceAfter = await connection.getBalance(settleConfig.poolKey);
    const treasuryBalanceAfter = await connection.getBalance(treasuryAccount.vaultKey);

    // Send and confirm transaction
    const settleSig = await signAndSendVTx(settleTx, payer, connection);
    await confirmTransaction(settleSig, program);

    // Post-settlement checks


    // Display all bets
    const bets = await getAllBetAccounts(program);
    console.log('Bets:', bets);

    // Settle Config
    console.log('Settle Config:', settleConfig);

    // Display balances before and after

    console.log('-------BALANCES BEFORE--------');
    
    console.log('User Balance Before:', userBalanceBefore / LAMPORTS_PER_SOL);
    console.log('Pool Balance Before:', poolBalanceBefore / LAMPORTS_PER_SOL);
    console.log('Treasury Balance Before:', treasuryBalanceBefore / LAMPORTS_PER_SOL);

    console.log('-------BALANCES AFTER--------');
    
    console.log('User Balance After:', userBalanceAfter / LAMPORTS_PER_SOL);
    console.log('Pool Balance After:', poolBalanceAfter / LAMPORTS_PER_SOL);
    console.log('Treasury Balance After:', treasuryBalanceAfter / LAMPORTS_PER_SOL);

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