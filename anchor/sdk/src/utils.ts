// Here we export some useful types and functions for interacting with the Anchor program.
import { web3 } from '@coral-xyz/anchor';
import { Connection, PublicKey, Transaction, TransactionInstruction, VersionedTransaction } from '@solana/web3.js';
import type { HorseRace } from '../../target/types/horse_race';

// Re-export the generated IDL and type
export { HorseRace };

// export const RACE_HORSE_PROGRAM_ID = new PublicKey(HorseRaceIDL.address)


export async function convertToVersionedTransaction(
  connection: Connection,
  transaction: Transaction
): Promise<VersionedTransaction> {
  const blockhash = await connection.getLatestBlockhash();
  
  transaction.recentBlockhash = blockhash.blockhash;

  const versionedTransaction = new VersionedTransaction(transaction.compileMessage());
  
  return versionedTransaction;
}

export async function convertTxsToVersionedTxs(connection: Connection, txs: Transaction[]): Promise<VersionedTransaction[]> {
  return Promise.all(txs.map((tx) => convertToVersionedTransaction(connection, tx)));
}

export async function combineTxs(txs: Transaction[]): Promise<Transaction> {
  return txs.reduce((acc, tx) => acc.add(tx), new Transaction());
}

export async function combineAndConvertTxs(connection: Connection, txs: Transaction[]): Promise<VersionedTransaction> {
  return convertToVersionedTransaction(connection, await combineTxs(txs));
}

export async function getVersionTxFromInstructions(
  connection: Connection,
  instructions: TransactionInstruction[],
  feePayer?: PublicKey,
  addressLookupTableAccounts?: web3.AddressLookupTableAccount[] // Optional ALT support
): Promise<VersionedTransaction> {

  if (instructions.length === 0) {
    throw new Error('At least one instruction is required');
  }

  const payer = feePayer || instructions[0].keys.find(k => k.isSigner)?.pubkey;
  if (!payer) {
    throw new Error('Could not determine fee payer. Please specify explicitly.');
  }

  const { blockhash } = await connection.getLatestBlockhash();

  const message = new web3.TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message(addressLookupTableAccounts);

  const versionedTx = new VersionedTransaction(message);

  return versionedTx;
}