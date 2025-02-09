import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { getFirstPool, getPoolAccountsFromCompetition, HorseRace } from "../src";
import dotenv from 'dotenv';
import fs from 'fs';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';

export async function addOneHour(nowTimeStamp: number) {
    return nowTimeStamp + 3600;
}

export async function addOneYear(nowTimeStamp: number) {
    return nowTimeStamp + 31536000;
}

export function convertBlockTime(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
}

export const getCompetitionKey = async (program: Program<HorseRace>) : Promise<PublicKey> => {
  const competitions = await program.account.competition.all();
  console.log('competitions', competitions);
  return competitions[competitions.length - 1].publicKey;
}

export const getFirstPoolFromCompetition = async (program: Program<HorseRace>, competitionKey: PublicKey) : Promise<PublicKey> => {
  const pools = await getPoolAccountsFromCompetition(program, competitionKey);
  return pools[0].publicKey;
}

export async function now(connection: Connection): Promise<number> {
    // const provider = anchor.AnchorProvider.env();
    const block = await connection.getSlot();
    return (await connection.getBlockTime(block))!;
  }
  
  export async function signAndSendVTx(
    vTx: VersionedTransaction,
    signer: Keypair,
    connection: Connection
  ): Promise<string> {
    const { blockhash } = await connection.getLatestBlockhash();
  
    const message = vTx.message;
    const newMessage = new web3.TransactionMessage({
      payerKey: message.staticAccountKeys[0],
      instructions: message.compiledInstructions.map(ix => ({
        programId: message.staticAccountKeys[ix.programIdIndex],
        keys: ix.accountKeyIndexes.map(accountIndex => ({
          pubkey: message.staticAccountKeys[accountIndex],
          isSigner: message.isAccountSigner(accountIndex),
          isWritable: message.isAccountWritable(accountIndex),
        })),
        data: Buffer.from(ix.data),
      })),
      recentBlockhash: blockhash,
    });
  
    const newTx = new web3.VersionedTransaction(newMessage.compileToV0Message());
    newTx.sign([signer]);
  
    try {
      const simResult = await connection.simulateTransaction(newTx, {
        replaceRecentBlockhash: true,
        sigVerify: false,
      });
  
      if (simResult.value.err) {
        const errorLogs = simResult.value.logs?.join('\n') || 'No logs available';
        throw new Error(`Simulation failed: ${errorLogs}`);
      }
  
      return await connection.sendTransaction(newTx);
    } catch (error) {
      // Type guard to check if error is an Error object
      if (error instanceof Error) {
        throw new Error(`Submission failed: ${error.message}`);
      }
      // If it's not an Error object, convert it to string
      throw new Error(`Submission failed: ${String(error)}`);
    }
  }
    
    export async function waitAndConfirmSignature(
      connection: Connection,
      signature: string,
      debug?: boolean
    ): Promise<boolean> {
      const bch = await connection.getLatestBlockhash();
      if (debug) console.log("waiting for ", signature);
    
      const res = await connection.confirmTransaction(
        {
          signature,
          blockhash: bch.blockhash,
          lastValidBlockHeight: bch.lastValidBlockHeight,
        },
        "finalized"
      );
      return res.value.err ? false : true;
    }


    export const confirmTransaction = async function (signature: string, program: anchor.Program<HorseRace>) {
  const latestBlockhash = await program.provider.connection.getLatestBlockhash();

  const confirmation = await program.provider.connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  });
  return confirmation;
}

interface Environment {
  program: anchor.Program<HorseRace>;
  connection: Connection;
  payer: Keypair;
  wallet: NodeWallet;
}

export async function setupEnvironment(): Promise<Environment> {
  dotenv.config();

  const { SOLANA_PRIVATE_KEY, SOLANA_RPC_URL, PROGRAM_ID, ANCHOR_WALLET } = process.env;

  if (!SOLANA_PRIVATE_KEY || !SOLANA_RPC_URL || !PROGRAM_ID || !ANCHOR_WALLET) {
    throw new Error('Missing environment variables');
  }

  // Initialize connection
  const connection = new Connection(SOLANA_RPC_URL);
  console.log('Connected to:', SOLANA_RPC_URL);

  // Initialize payer from ANCHOR_WALLET
  const payer = Keypair.fromSecretKey(
    Buffer.from(
      JSON.parse(
        fs.readFileSync(ANCHOR_WALLET, {
          encoding: "utf-8",
        })
      )
    )
  );
  console.log('Payer public key:', payer.publicKey.toBase58());

  // Setup wallet and provider
  const wallet = new NodeWallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'processed',
  });

  anchor.setProvider(provider);

  // Initialize program
  const program = anchor.workspace.HorseRace as anchor.Program<HorseRace>;

  return {
    program,
    connection,
    payer,
    wallet,
  };
}