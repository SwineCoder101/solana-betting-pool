import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { getVersionTxFromInstructions, HorseRace } from '../src';
import { createTreasury } from '../src/instructions/admin/create-treasury';
import { TreasuryAccount } from '../src/states/treasury-account';
import { confirmTransaction, signAndSendVTx } from './utils';

dotenv.config();

const { SOLANA_RPC_URL, PROGRAM_ID, ANCHOR_WALLET } = process.env;
if (!SOLANA_RPC_URL || !PROGRAM_ID || !ANCHOR_WALLET) {
  console.error("Missing environment variables. Please set SOLANA_RPC_URL, PROGRAM_ID, and ANCHOR_WALLET");
  process.exit(1);
}

console.log("Using wallet:", ANCHOR_WALLET);
console.log("Connected to:", SOLANA_RPC_URL);

const connection = new Connection(SOLANA_RPC_URL, 'processed');

const payer = Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(
      fs.readFileSync(ANCHOR_WALLET as string, { encoding: "utf-8" })
    )
  )
);

const wallet = new NodeWallet(payer);
const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'processed' });
anchor.setProvider(provider);

const program = anchor.workspace.HorseRace as anchor.Program<HorseRace>;

(async function main() {
  try {
    console.log("Program ID:", program.programId.toBase58());

    // Set parameters for treasury creation. Adjust these values as needed.
    const params = {
      maxAdmins: 10,
      minSignatures: 1,
      initialAdmins: [payer.publicKey],
    };

    console.log("Creating treasury with params:", params);

    // Create the treasury creation instruction.
    const treasuryIx = await createTreasury(program, params);

    // Build a transaction with the treasury creation instruction.

    const vtx = await getVersionTxFromInstructions(provider.connection, [treasuryIx]);

    // Sign and send the transaction using our utility functions.
    const treasurySig = await signAndSendVTx(vtx, payer, provider.connection);
    await confirmTransaction(treasurySig, program);

    // Fetch the PDA of the treasury from the on-chain state.
    const [treasuryPda] = await TreasuryAccount.getPda(program);
    console.log("Treasury created successfully at PDA:", treasuryPda.toBase58());
    console.log("Transaction Signature:", treasurySig);
  } catch (error) {
    console.error("Error creating treasury:", error);
    process.exit(1);
  }
})();
