import { Program } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';
import { Keypair, PublicKey, TransactionSignature } from '@solana/web3.js';

export async function updateFeed(
  program: Program<HorseRace>,
  authority: Keypair,
  poolKey: PublicKey,
  priceFeedId: string,
  priceFeedAccount: PublicKey,
): Promise<TransactionSignature> {
  // Get pool oracle PDA
  const [poolOraclePDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("pool_oracle"),
      poolKey.toBuffer(),
      Buffer.from(priceFeedId)
    ],
    program.programId
  );

  const tx = await program.methods
    .runUpdatePoolPriceFeed()
    .accountsStrict({
      authority: authority.publicKey,
      poolOracle: poolOraclePDA,
      priceUpdate: priceFeedAccount,
    })
    .signers([authority])
    .rpc();

  return tx;
} 