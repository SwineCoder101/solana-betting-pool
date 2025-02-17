jest.setTimeout(30000);

import { web3 } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { setupEnvironment } from '../../anchor/tests/common-setup';
import { createPool, getVersionTxFromInstructions } from '../../anchor/sdk/src';

describe("Pool", () => {

  const competitionKey = Keypair.generate().publicKey;
  const treasury = Keypair.generate().publicKey;
  const startTime = Math.floor(Date.now() / 1000)
  const endTime = startTime + 3600; // 1 hour later

  it("Create pool successfully", async () => {  // <-- Optionally, you can also pass 30000 as timeout here: }, 30000)

    const { program, adminKp } = await setupEnvironment();
    // Generate a pool hash
    const poolHash = Keypair.generate().publicKey;

    // Create the pool
    const { ix } = await createPool(
      program,
      adminKp.publicKey,
      competitionKey,
      startTime,
      endTime,
      treasury,
      poolHash
    );

    // Create and send transaction
    const tx = await getVersionTxFromInstructions(program.provider.connection, [ix]);
    tx.sign([adminKp]);
    const signature = await program.provider.connection.sendTransaction(tx);
    await program.provider.connection.confirmTransaction(signature, 'confirmed');

    // Fetch the pool account to verify it was created successfully
    const [poolPda] = await web3.PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), competitionKey.toBuffer(), poolHash.toBuffer()],
      program.programId
    );

    console.log('fetching account for Pool PDA:', poolPda.toBase58());
    const poolAccount = await program.account.pool.fetch(poolPda);
    console.log('Pool account:', poolAccount);

    // Verify the pool account data
    expect(poolAccount.competition.toString()).toEqual(competitionKey.toString());
    expect(poolAccount.startTime.toNumber()).toEqual(startTime);
    expect(poolAccount.endTime.toNumber()).toEqual(endTime);
    expect(poolAccount.treasury.toString()).toEqual(treasury.toString());
  });
}); 