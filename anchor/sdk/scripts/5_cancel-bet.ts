import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { HorseRace } from '../src';
import { createBetEntry, CreateBetParams } from '../src/instructions/user/create-bet';
import {
    confirmTransaction,
    signAndSendVTx
} from './utils';
import { cancelBetEntry, CancelBetParams } from '../src/instructions/user/cancel-bet';

dotenv.config();

const { SOLANA_RPC_URL, PROGRAM_ID, ANCHOR_WALLET } = process.env;

if (!SOLANA_RPC_URL || !PROGRAM_ID || !ANCHOR_WALLET) {
  console.log(PROGRAM_ID,SOLANA_RPC_URL,ANCHOR_WALLET);
  throw new Error('Missing environment variables, ');
}

console.log(process.env.ANCHOR_WALLET);

console.log('connected to: ', SOLANA_RPC_URL);

const connection = new Connection(SOLANA_RPC_URL);


const payer = Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(
      fs.readFileSync(process.env.ANCHOR_WALLET as string, {
        encoding: "utf-8",
      })
    )
  )
);

const user = new NodeWallet(payer);

const provider = new anchor.AnchorProvider(connection, user, {
    commitment: 'processed',
});

anchor.setProvider(provider);

const program = anchor.workspace.HorseRace as anchor.Program<HorseRace>;


const createBetParams : CancelBetParams = {
    user: new PublicKey('7wVwUpoUTUKwRXSaKMgHEcF8AJpkAxPogJyWvdcBm5CJ'),
    poolKey: new PublicKey('ADAG9ga5fEccoPyemEotXFJ39AizENq8nUxZWWtHAeMJ'),
    betHash: new PublicKey('9GTw54S8VJytoCvzw7NGyFdJSVwi2qPM78hFDPxRewbc'),
}


async function main() {
  try {

    if (!createBetParams.poolKey) {
        throw new Error('Pool key is required');
    }
    
  const betTx = await cancelBetEntry(program, createBetParams);

  const poolBalanceBefore = await program.provider.connection.getBalance(new PublicKey(createBetParams.poolKey));

  const betSig = await signAndSendVTx(betTx, payer, program.provider.connection);
  await confirmTransaction(betSig, program);

  const poolBalanceAfter = await program.provider.connection.getBalance(new PublicKey(createBetParams.poolKey));

  console.log('Pool Balance Before:', poolBalanceBefore);
  console.log('Pool Balance After:', poolBalanceAfter);

  } catch (error) {
    console.error('Error creating competition:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
