import * as anchor from "@coral-xyz/anchor";
import * as borsh from "@coral-xyz/borsh";
import {
    Account,
    createMint,
    getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    Signer,
    VersionedTransaction
} from "@solana/web3.js";

export const loggingOn = true; //Enable / disable logging
// const program = anchor.workspace.MemePrice as Program<MemePrice>;
export const decimals = 9;
export const createTokenAndAccount = async function (
  connection: Connection,
  payer: Signer
): Promise<[PublicKey, Account]> {
  const token = await createMint(
    connection,
    payer, // TODO: Decouple owner account from token creators for permission testing etc.
    payer.publicKey,
    payer.publicKey,
    decimals
  );
  console.log("token created", token);
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    token,
    payer.publicKey
  );

  return [token, tokenAccount];
};

export const createConfig = async function () {};

//TODO: Move to SDK
export const TokenSchema = borsh.struct([borsh.publicKey("token"), borsh.bool("disabled")]);

//This is lame but marginally better than writing out integer literals
export const size = {
  discriminator: 8,
  pubkey: 32,
  bool: 1,
  bump: 1,
};

export const logSolBalance = async function (text: string, accountPK: PublicKey) {
  if (!loggingOn) return;
  const balance = await anchor.AnchorProvider.env().connection.getBalance(accountPK);
  console.log(text, balance);
};

export const log = function (...args: unknown[]) {
  if (!loggingOn) return;
  console.log(...args);
};

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
    vTx.message.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  
    vTx.sign([signer]);
  
    const simuTx = await connection.simulateTransaction(vTx);
    if (simuTx.value.err) console.log("simulateTransaction Error logs", simuTx.value.logs);
  
    if (simuTx.value.logs && simuTx.value.logs.length > 100) {
      console.log("logs", simuTx.value.logs.slice(0, 100));
      if (simuTx.value.logs.length > 100) console.log("logs", simuTx.value.logs.slice(100));
    }
    // simuTx.value.logs.map((log) => {
    //   console.log(log);
    // });
    return await connection.sendTransaction(vTx);
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

  export async function createUserWithFunds(connection: Connection): Promise<Keypair> {
    const user = Keypair.generate();
    const airTx = await connection.requestAirdrop(user.publicKey, 100 * LAMPORTS_PER_SOL);
    await waitAndConfirmSignature(connection, airTx, true);
    return user;
  }

  export function lamportsToSol(lamports: number): number {
    return lamports / 1_000_000_000;
  }
  
  export function solToLamports(sol: number): number {
    return sol * 1_000_000_000;
  }

  

  
  