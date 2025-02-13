import { web3 } from "@coral-xyz/anchor";

export async function getVersionTxFromInstructions(
  connection: web3.Connection,
  instructions: web3.TransactionInstruction[],
  payer: web3.PublicKey,
): Promise<web3.VersionedTransaction> {
  const blockhash = await connection.getLatestBlockhash();
  
  const messageV0 = new web3.TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash.blockhash,
    instructions,
  }).compileToV0Message();

  return new web3.VersionedTransaction(messageV0);
} 