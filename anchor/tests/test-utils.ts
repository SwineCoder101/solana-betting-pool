import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
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
    Transaction,
    VersionedTransaction
} from "@solana/web3.js";
import { createBet } from "../sdk/src/instructions/user/create-bet";
import { getPoolAccount, getVersionTxFromInstructions, HorseRace } from "../sdk/src";
import { createTreasury } from "../sdk/src/instructions/admin/create-treasury";
import { TreasuryAccount } from "../sdk/src/states/treasury-account";

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
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

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
    console.log('simulating transaction....')
    
    const simResult = await connection.simulateTransaction(newTx, {
      replaceRecentBlockhash: true,
      sigVerify: false,
    });

    if (simResult.value.err) {
      const errorLogs = simResult.value.logs?.join('\n') || 'No logs available';
      throw new Error(`Simulation failed: ${errorLogs}`);
    }

    console.log('sending transaction....')

    const signature = await connection.sendTransaction(newTx);
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
    return signature;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw new Error(`Submission failed: ${error.message}`);
  }
}

  export async function createTreasuryUtil(program: Program<HorseRace>, adminKp: Keypair): Promise<PublicKey> {
    const ix = await createTreasury(program, {
      maxAdmins: 1,
      minSignatures: 1,
      initialAdmins: [adminKp.publicKey],
    })

    const vtx = await getVersionTxFromInstructions(program.provider.connection, [ix]);
    await signAndSendVTx(vtx, adminKp, program.provider.connection);
    const [treasuryKey] = await TreasuryAccount.getTreasuryPda(program);

    return treasuryKey;
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

export async function sendAndConfirmTx(
  provider: anchor.AnchorProvider,
  tx: Transaction,
  signers: Keypair[]
): Promise<string> {
  return await provider.sendAndConfirm(tx, signers);
}

export async function executeCreateBet(
  program: Program<HorseRace>,
  user: Keypair,
  amount: number,
  lowerBoundPrice: number, 
  upperBoundPrice: number, 
  leverageMultiplier: number = 1,
  poolKey: PublicKey,
  competitionPubkey: PublicKey,
  signer: Signer) {
    const vtx = await createBet(program, user.publicKey, amount, lowerBoundPrice, upperBoundPrice, leverageMultiplier, poolKey, competitionPubkey);
    vtx.sign([signer]);
    const signature = await program.provider.connection.sendTransaction(vtx);
    await program.provider.connection.confirmTransaction(signature, 'confirmed');
  }

export async function setupTreasury(program: Program<HorseRace>): Promise<{
  treasuryKey: PublicKey
  adminWallet: web3.Keypair
}> {
  const adminWallet = web3.Keypair.generate()
  
  // Fund admin wallet
  const signature = await program.provider.connection.requestAirdrop(
    adminWallet.publicKey,
    2 * web3.LAMPORTS_PER_SOL
  )
  await program.provider.connection.confirmTransaction(signature)

  // Create treasury with admin
  const ix =await createTreasury(program, {
    maxAdmins: 1,
    minSignatures: 1,
    initialAdmins: [adminWallet.publicKey],
    payer: adminWallet.publicKey,
  })

  const vtx = await getVersionTxFromInstructions(program.provider.connection, [ix]);
  await signAndSendVTx(vtx, adminWallet, program.provider.connection);

  const [treasuryKey] = await TreasuryAccount.getTreasuryPda(program);

  return { treasuryKey, adminWallet }
}

export const getPoolVaultKey = async (program: Program<HorseRace>, poolKey: PublicKey) => {
  const poolAccount = await getPoolAccount(program, poolKey);
  return poolAccount.account.vaultKey;
}

export const airdropSol = async (connection: Connection, keypair: Keypair, amountToAirdrop: number) => {

  const signature = await connection.requestAirdrop(keypair.publicKey, amountToAirdrop);
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });
}