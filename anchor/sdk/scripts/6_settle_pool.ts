import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { HorseRace } from '../src';
import { settlePoolByPrice } from '../src/instructions/admin/settle-pool-by-price';
import {
    confirmTransaction,
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

// Configuration - Update these values according to your test scenario
const SETTLE_CONFIG = {
  poolKey: new PublicKey('6hnTNibVauiQRJASs45BqHk6JWqsp6UwV4ebap3eaYi1'),
  lowerBoundPrice: 0,
  upperBoundPrice: 0
};

async function main() {
  try {
    // Fetch pool state
    const poolAccount = await program.account.pool.fetch(SETTLE_CONFIG.poolKey);
    
    // Settlement validation checks
    console.log('Pool State Before Settlement:');
    console.log('- Total Balance:', await connection.getBalance(SETTLE_CONFIG.poolKey));
    console.log('- Competition:', poolAccount.competitionKey.toString());
    console.log('- Treasury:', poolAccount.treasury.toString());

    console.log('program', program.methods);

    // Generate settlement transaction
    const settleTx = await settlePoolByPrice(
      program,
      payer.publicKey,  // Admin authority
      SETTLE_CONFIG.poolKey,
      SETTLE_CONFIG.lowerBoundPrice,
      SETTLE_CONFIG.upperBoundPrice
    );

    // Send and confirm transaction
    const settleSig = await signAndSendVTx(settleTx, payer, connection);
    await confirmTransaction(settleSig, program);

    // Post-settlement checks
    console.log('\nPool State After Settlement:');
    console.log('- Total Balance:', await connection.getBalance(SETTLE_CONFIG.poolKey));
    
    // Verify bet states
    const updatedPool = await program.account.pool.fetch(SETTLE_CONFIG.poolKey);
    // console.log('- Settled Bets Count:', updatedPool.settledBetsCount.toString());

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