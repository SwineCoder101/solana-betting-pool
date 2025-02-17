import { BN } from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getActiveBetAccountsForPool, getBetAccountsForPool, getBetAccountsForUser } from "../sdk/src";
import { settlePoolByPrice } from "../sdk/src/instructions/admin/settle-pool-by-price";
import { setupCompetitionWithPools, SetupDTO } from "./common-setup";
import { executeCreateBet, signAndSendVTx } from "./test-utils";

describe.skip("settlements with bets", () => {
  let setupDto: SetupDTO;
  let program, poolKeys: PublicKey[], competitionPubkey, connection;
  let signer: Keypair;
  let treasuryKey: PublicKey;
  const poolsToBetCountMap = new Map<PublicKey, number>();
  let numberOfBetsForSigner: number;


  beforeAll(async () => {
    setupDto = await setupCompetitionWithPools();
    program = setupDto.program;
    poolKeys = setupDto.poolKeys ?? [Keypair.generate().publicKey];
    competitionPubkey = setupDto.competitionPubkey;
    connection = setupDto.sdkConfig.connection;
    numberOfBetsForSigner = 0;
    treasuryKey = setupDto.treasury;
    signer = setupDto.adminKp;
    // signer = await createUserWithFunds(connection);

    // Initialize bet counts for each pool
    for (const poolKey of poolKeys) {
      const betAccounts = await getBetAccountsForPool(program, poolKey);
      poolsToBetCountMap.set(poolKey, betAccounts.length);
    }
    numberOfBetsForSigner = (await getBetAccountsForUser(program, signer.publicKey)).length;
  }, 30000);

  it("should settle all funds from pool to treasury if no bet has won", async () => {
    const amount = new BN(5 * LAMPORTS_PER_SOL);
    const betLowerBoundPrice = 50;
    const betUpperBoundPrice = 150;
    const oracleLowerBoundPrice = 200; // Outside bet range
    const oracleUpperBoundPrice = 250; // Outside bet range

    const poolKey = poolKeys[0];
    
    // Get initial balances
    const userBalanceBefore = await connection.getBalance(signer.publicKey);
    const treasuryBalanceBefore = await connection.getBalance(treasuryKey);
    const poolBalanceBeforeBet = await connection.getBalance(poolKey);

    console.log('treasuryKey', treasuryKey.toBase58());
    console.log('signer', signer.publicKey.toBase58());

    console.log('treasuryBalanceBefore', treasuryBalanceBefore/LAMPORTS_PER_SOL);
    console.log('userBalanceBefore', userBalanceBefore/LAMPORTS_PER_SOL);

    // Get pool balance before bet creation
    const poolBalanceBefore = await connection.getBalance(poolKey);

    // Create bet
    await executeCreateBet(
      program, 
      signer, 
      amount.toNumber(), 
      betLowerBoundPrice, 
      betUpperBoundPrice, 
      1,
      poolKey, 
      competitionPubkey, 
      signer
    );

    // Check pool received bet amount
    const poolBalanceAfterBet = await connection.getBalance(poolKey);
    expect(poolBalanceAfterBet - poolBalanceBefore).toBe(amount.toNumber());

    // Settle pool
    const settleTx = await settlePoolByPrice(
      program, 
      signer.publicKey, 
      poolKey, 
      oracleLowerBoundPrice, 
      oracleUpperBoundPrice
    );
    await signAndSendVTx(settleTx, signer, connection);

    const userBalanceAfter = await connection.getBalance(signer.publicKey);
    const treasuryBalanceAfter = await connection.getBalance(treasuryKey);
    const poolBalanceAfter = await connection.getBalance(poolKey);

    console.log('treasuryBalanceAfter', treasuryBalanceAfter/LAMPORTS_PER_SOL);
    console.log('userBalanceAfter', userBalanceAfter/LAMPORTS_PER_SOL);
    console.log('poolBalanceAfter', poolBalanceAfter/LAMPORTS_PER_SOL);

    const betAccounts = await getActiveBetAccountsForPool(program, poolKey);
    expect(betAccounts.length).toBe(0);

    const userBalanceDiff = userBalanceBefore - userBalanceAfter;
    expect(userBalanceDiff).toBeGreaterThanOrEqual(amount.toNumber());
    expect(userBalanceDiff).toBeLessThan(amount.toNumber() + 0.1 * LAMPORTS_PER_SOL);

    expect(treasuryBalanceAfter).toBe(treasuryBalanceBefore + amount.toNumber());

    expect(poolBalanceAfter).toBe(poolBalanceBeforeBet);
  });

  it("should settle to user if bet has won on the exact range", async () => {
    const amount = new BN(5 * LAMPORTS_PER_SOL);
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[1];

    const treasuryBalanceBefore = await connection.getBalance(treasuryKey);
    const poolBalanceBeforeBet = await connection.getBalance(poolKey);

    await executeCreateBet(program, signer, amount.toNumber(), lowerBoundPrice, upperBoundPrice, 1, poolKey, competitionPubkey, signer);

    //settle pool by price
    const settleTx = await settlePoolByPrice(program, signer.publicKey, poolKey, lowerBoundPrice, upperBoundPrice);
    await signAndSendVTx(settleTx, signer, connection);

    //get bet accounts for pool
    const betAccounts = await getActiveBetAccountsForPool(program, poolKey);
    expect(betAccounts.length).toBe(0);

    const poolBalanceAfter = await connection.getBalance(poolKey);
    
    //check balance of treasury
    const treasuryBalanceAfter = await connection.getBalance(treasuryKey);
    
    expect(treasuryBalanceBefore - treasuryBalanceAfter).toBe(0);
    expect(poolBalanceAfter).toBe(poolBalanceBeforeBet);
  });

//TODO: Uncomment these when we have a way to test time travel
//   it("should not settle if pool is not ended", async () => {
//   });

//   it("should not settle if competition has ended", async () => {
//   });

//   it('should handle multiple winning bets correctly', async () => {
//   });

});
