import { Transaction, VersionedTransaction, Connection } from '@solana/web3.js';

export async function convertToVersionedTransaction(
  connection: Connection,
  transaction: Transaction
): Promise<VersionedTransaction> {
  // Get the latest blockhash
  const blockhash = await connection.getLatestBlockhash();
  
  // Set the blockhash for the transaction
  transaction.recentBlockhash = blockhash.blockhash;

  // Convert to VersionedTransaction
  const versionedTransaction = new VersionedTransaction(transaction.compileMessage());
  
  return versionedTransaction;
} 