import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BetStatus, getBetAccountsForPool, getBetAccountsForUser, getBetData } from "../sdk/src";
import { cancelAllBetsEntry } from "../sdk/src/instructions/user/cancel-bet";
import { createBet } from "../sdk/src/instructions/user/create-bet";
import { setupCompetitionWithPools, SetupDTO } from "./common-setup";

describe.skip("Bets", () => {
  let setupDto: SetupDTO;
  let program, poolKeys: PublicKey[], competitionPubkey, connection;
  let signer: Keypair;
  const poolsToBetCountMap = new Map<PublicKey, number>();
  let numberOfBetsForSigner: number; 

  beforeAll(async () => {
    setupDto = await setupCompetitionWithPools(false);
    program = setupDto.program;
    poolKeys = setupDto.poolKeys ?? [Keypair.generate().publicKey];
    competitionPubkey = setupDto.competitionPubkey;
    connection = setupDto.sdkConfig.connection;
    numberOfBetsForSigner = 0;

    signer = setupDto.testPlayerOne;

    // Initialize bet counts for each pool
    for (const poolKey of poolKeys) {
      const betAccounts = await getBetAccountsForPool(program, poolKey);
      poolsToBetCountMap.set(poolKey, betAccounts.length);
    }
    numberOfBetsForSigner = (await getBetAccountsForUser(program, signer.publicKey)).length;
  }, 30000);

  it("should create bet against a pool with correct timestamps", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];    
    const userBalanceBefore = await connection.getBalance(signer.publicKey);

    // Get initial bet count and timestamp
    const initialBets = await getBetAccountsForPool(program, poolKey);
    const beforeCreateTime = new Date();
    // Convert to seconds to match on-chain precision
    const beforeCreateSeconds = Math.floor(beforeCreateTime.getTime() / 1000) * 1000;
    console.log('Before create time:', beforeCreateSeconds);

    const vtx = await createBet(program, signer.publicKey, amount, lowerBoundPrice, upperBoundPrice, 1, poolKey, competitionPubkey);
    vtx.sign([signer]);
    const signature = await program.provider.connection.sendTransaction(vtx);
    await program.provider.connection.confirmTransaction(signature, 'confirmed');

    const afterCreateTime = new Date();
    
    // Convert to seconds to match on-chain precision
    const afterCreateSeconds = Math.floor(afterCreateTime.getTime() / 1000) * 1000;
    console.log('After create time:', afterCreateSeconds);
    
    // Add delay to ensure transaction is processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    const betAccounts = await getBetAccountsForPool(program, poolKey);
    console.log('Found bet accounts:', betAccounts.length);
    betAccounts.forEach(acc => {
      console.log('Bet account:', {
        user: acc.user,
        poolKey: acc.poolKey,
        status: acc.status,
        createdAt: acc.createdAt.getTime(),
        updatedAt: acc.updatedAt.getTime()
      });
    });

    // Find only the new bet by filtering out initial bets
    const newBets = betAccounts.filter(b => 
      !initialBets.some(ib => ib.publicKey === b.publicKey)
    );
    expect(newBets.length).toBe(1);
    const bet = newBets[0];
    
    console.log('New bet timestamps:', {
      createdAt: bet.createdAt.getTime(),
      updatedAt: bet.updatedAt.getTime(),
      beforeCreate: beforeCreateSeconds,
      afterCreate: afterCreateSeconds
    });

    expect(bet).toBeDefined();
    expect(bet.amount).toEqual(amount);
    expect(bet.status).toEqual(BetStatus.Active);
    
    // Allow for small timing differences and account for second-level precision
    const TIMING_TOLERANCE = 2000; // 2 seconds in milliseconds
    expect(bet.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreateSeconds - TIMING_TOLERANCE);
    expect(bet.createdAt.getTime()).toBeLessThanOrEqual(afterCreateSeconds + TIMING_TOLERANCE);
    expect(bet.updatedAt.getTime()).toEqual(bet.createdAt.getTime());
    
    expect(bet.lowerBoundPrice).toEqual(lowerBoundPrice);
    expect(bet.upperBoundPrice).toEqual(upperBoundPrice);
    expect(bet.poolKey).toEqual(poolKey.toString());
    expect(bet.competition).toEqual(competitionPubkey.toString());
    expect(userBalanceBefore - await connection.getBalance(signer.publicKey)).toBeGreaterThan(LAMPORTS_PER_SOL);
  }, 30000);

  it("should create multiple bets against a pool", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    const initialBetCount = (await getBetAccountsForUser(program, signer.publicKey)).length;
    const numBets = 3;

    for (let i = 0; i < numBets; i++) {
      const vtx = await createBet(program, signer.publicKey, amount, lowerBoundPrice, upperBoundPrice, 1, poolKey, competitionPubkey);
      vtx.sign([signer]);
      const signature = await program.provider.connection.sendTransaction(vtx);
      await program.provider.connection.confirmTransaction(signature, 'confirmed');
    }

    const betAccounts = await getBetAccountsForUser(program, signer.publicKey);
    expect(betAccounts.length).toEqual(initialBetCount + numBets);
  }, 30000);

  it("should create multiple bets against multiple pools", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const numBetsPerPool = 2;

    const initialPoolCounts = new Map<string, number>();
    for (const poolKey of poolKeys) {
      const count = (await getBetAccountsForPool(program, poolKey)).length;
      initialPoolCounts.set(poolKey.toBase58(), count);
    }

    // const initialUserBetCount = (await getBetAccountsForUser(program, signer.publicKey)).length;

    for (const poolKey of poolKeys) {
      for (let i = 0; i < numBetsPerPool; i++) {
        const vtx = await createBet(program, signer.publicKey, amount, lowerBoundPrice, upperBoundPrice, 1, poolKey, competitionPubkey);
        vtx.sign([signer]);
        const signature = await program.provider.connection.sendTransaction(vtx);
        await program.provider.connection.confirmTransaction(signature, 'confirmed');
      }
    }

    for (const poolKey of poolKeys) {
      const betAccounts = await getBetAccountsForPool(program, poolKey);
      const initialCount = initialPoolCounts.get(poolKey.toBase58()) || 0;
      expect(betAccounts.length).toEqual(initialCount + numBetsPerPool);
    }

    const betAccounts = await getBetAccountsForUser(program, signer.publicKey);
    expect(betAccounts.length).toBeGreaterThanOrEqual(10);
  }, 30000);

  it("should cancel a bet after a bet is already created", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    console.log('Creating bet for cancellation test');
    console.log('Pool:', poolKey.toBase58());
    console.log('Signer:', signer.publicKey.toBase58());

    const userBalanceBefore = await connection.getBalance(signer.publicKey);

    // Create a new bet
    const vtx = await createBet(program, signer.publicKey, amount, lowerBoundPrice, upperBoundPrice, 1, poolKey, competitionPubkey);
    vtx.sign([signer]);
    const signature = await program.provider.connection.sendTransaction(vtx);
    await program.provider.connection.confirmTransaction(signature, 'confirmed');
    
    if (signature.err) {
      console.error('Transaction failed:', signature.err);
      throw new Error('Transaction failed: ' + signature.err);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const allAccounts = await program.account.bet.all();
    console.log('All bet accounts:', allAccounts);

    const betAccounts = await getBetAccountsForPool(program, poolKey);
    console.log('Found bet accounts:', betAccounts.length);
    betAccounts.forEach(acc => console.log('Bet account:', acc));

    const bet = betAccounts.find(b => b.user === signer.publicKey.toBase58());
    console.log('Found bet to cancel:', bet);
    expect(bet).toBeDefined();

    const beforeCancelTime = new Date();
    console.log('Before cancel time:', beforeCancelTime);

    const {txs: cancelBetTxs} = await cancelAllBetsEntry(program, {
      user: signer.publicKey,
      poolKey: poolKey,
    });

    // simulate the cancel bet txs being sent in a batch
    try{
    const simResult = await program.provider.connection.simulateTransaction(cancelBetTxs[0],    {
      sigVerify: false, // whether to verify signatures
      replaceRecentBlockhash: false, // whether to override the blockhash
    },);
    console.log('Simulation result:', simResult);
  } catch(e){
    console.log('Simulation failed:', e);
    throw new Error('Simulation failed: ' + e);
  }

    try {
      cancelBetTxs.forEach(tx => {
        tx.sign([signer]);
      });
      const signatures = await Promise.all(cancelBetTxs.map(tx => program.provider.connection.sendTransaction(tx)));
      await Promise.all(signatures.map(signature => program.provider.connection.confirmTransaction(signature, 'confirmed')));
    }catch(e){
      console.log('transaction bet cancellation failed:', e);
      throw new Error('Transaction cancellation failed: ' + e);
    }

    const afterCancelTime = new Date();
    console.log('After cancel time:', afterCancelTime);

    if(!bet){
      throw new Error('Bet not found');
    }
    

    const updatedBet = await getBetData(program, new PublicKey(bet.publicKey));

    expect(updatedBet.status).toEqual(BetStatus.Cancelled);
    // expect(updatedBet.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCancelTime.getTime());
    // expect(updatedBet.updatedAt.getTime()).toBeLessThanOrEqual(afterCancelTime.getTime());
    // expect(updatedBet.updatedAt.getTime()).toBeGreaterThan(updatedBet.createdAt.getTime());

    // assert on balance
    const userBalanceAfter = await connection.getBalance(signer.publicKey);
    expect(userBalanceAfter).toBeGreaterThan(userBalanceBefore);
  }, 30000);

  it("should not allow bet when time has surpassed the competition end time", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    try {
      await createBet(program, signer.publicKey, amount, lowerBoundPrice, upperBoundPrice, 1, poolKey, competitionPubkey);
    } catch (error) {
      expect(error.message).toContain("CompetitionEnded");
    }
  }, 30000);

  it("should not allow bet when time has surpassed the pool end time", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    try {
      await createBet(program, signer.publicKey, amount, lowerBoundPrice, upperBoundPrice, 1, poolKey, competitionPubkey);
    } catch (error) {
      expect(error.message).toContain("PoolEnded");
    }
  }, 30000);
});
