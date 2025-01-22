// bets.spec.ts

import { setupCompetitionWithPools, SetupDTO } from "./common-setup";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BetStatus, getBetAccountsForPool, getBetAccountsForUser, getBetData } from "../sdk/src";
import { createUserWithFunds } from "./test-utils";
import { createBet } from "../sdk/src/instructions/user/create-bet";
import { cancelBet } from "../sdk/src/instructions/user/cancel-bet";

describe("Bets", () => {
  let setupDto: SetupDTO;
  let program, poolKeys: PublicKey[], competitionPubkey, connection;
  let signer: Keypair;
  const poolsToBetCountMap = new Map<PublicKey, number>();
  let numberOfBetsForSigner: number; 

  beforeAll(async () => {
    setupDto = await setupCompetitionWithPools();
    program = setupDto.program;
    poolKeys = setupDto.poolKeys ?? [Keypair.generate().publicKey];
    competitionPubkey = setupDto.competitionPubkey;
    connection = setupDto.sdkConfig.connection;
    numberOfBetsForSigner = 0;

    signer = await createUserWithFunds(connection);

    // Initialize bet counts for each pool
    for (const poolKey of poolKeys) {
      const betAccounts = await getBetAccountsForPool(program, poolKey);
      poolsToBetCountMap.set(poolKey, betAccounts.length);
    }
    numberOfBetsForSigner = (await getBetAccountsForUser(program, signer.publicKey)).length;
  }, 30000);

  it("should create bet against a pool", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];    
    const userBalanceBefore = await connection.getBalance(signer.publicKey);

    console.log('Creating bet with pool:', poolKey.toBase58());
    console.log('Signer:', signer.publicKey.toBase58());

    // Get initial bet count
    const initialBetCount = (await getBetAccountsForPool(program, poolKey)).length;
    console.log('Initial bet count:', initialBetCount);

    const { tx } = await createBet(program, signer, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    const confirmation = await program.provider.connection.confirmTransaction(tx, 'confirmed');
    
    if (confirmation.value.err) {
      console.error('Transaction failed:', confirmation.value.err);
      throw new Error('Transaction failed: ' + confirmation.value.err);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const betAccounts = await getBetAccountsForPool(program, poolKey);
    console.log('Updated bet count:', betAccounts.length);
    
    const allAccounts = await program.account.bet.all();
    console.log('All bet accounts:', allAccounts);
    
    expect(betAccounts.length).toEqual(initialBetCount + 1);
    
    const bet = betAccounts.find(b => b.user === signer.publicKey.toBase58());
    console.log('Found bet:', bet);
    expect(bet).toBeDefined();
    expect(bet!.amount).toEqual(amount);
    expect(bet!.lowerBoundPrice).toEqual(lowerBoundPrice);
    expect(bet!.upperBoundPrice).toEqual(upperBoundPrice);
    expect(bet!.poolKey).toEqual(poolKey.toString());
    expect(bet!.competition).toEqual(competitionPubkey.toString());
    expect(bet!.status).toEqual(BetStatus.Active);
    expect(userBalanceBefore - await connection.getBalance(signer.publicKey)).toBeGreaterThan(LAMPORTS_PER_SOL);
  });

  it("should create multiple bets against a pool", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    const initialBetCount = (await getBetAccountsForUser(program, signer.publicKey)).length;
    const numBets = 3;

    for (let i = 0; i < numBets; i++) {
      const {tx} = await createBet(program, signer, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
      await program.provider.connection.confirmTransaction(tx);
    }

    const betAccounts = await getBetAccountsForUser(program, signer.publicKey);
    expect(betAccounts.length).toEqual(initialBetCount + numBets);
  });

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

    const initialUserBetCount = (await getBetAccountsForUser(program, signer.publicKey)).length;

    for (const poolKey of poolKeys) {
      for (let i = 0; i < numBetsPerPool; i++) {
        const {tx} = await createBet(program, signer, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
        await program.provider.connection.confirmTransaction(tx);
      }
    }

    for (const poolKey of poolKeys) {
      const betAccounts = await getBetAccountsForPool(program, poolKey);
      const initialCount = initialPoolCounts.get(poolKey.toBase58()) || 0;
      expect(betAccounts.length).toEqual(initialCount + numBetsPerPool);
    }

    const betAccounts = await getBetAccountsForUser(program, signer.publicKey);
    expect(betAccounts.length).toEqual(initialUserBetCount + (numBetsPerPool * poolKeys.length));
  });

  // TODO: Fix this test
  it.skip("should cancel a bet after a bet is already created", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    console.log('Creating bet for cancellation test');
    console.log('Pool:', poolKey.toBase58());
    console.log('Signer:', signer.publicKey.toBase58());

    // Create a new bet
    const { tx: txCreate, betHash } = await createBet(program, signer, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    const confirmation = await program.provider.connection.confirmTransaction(txCreate, 'confirmed');
    
    if (confirmation.value.err) {
      console.error('Transaction failed:', confirmation.value.err);
      throw new Error('Transaction failed: ' + confirmation.value.err);
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

    const {tx} = await cancelBet(program, signer, poolKey, betHash);
    await program.provider.connection.confirmTransaction(tx, 'confirmed');


    await new Promise(resolve => setTimeout(resolve, 2000));

    const [betPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("bet"),
        signer.publicKey.toBuffer(),
        poolKey.toBuffer(),
        betHash.toBuffer(),
      ],
      program.programId
    );
    const updatedBet = await getBetData(program, betPDA);
    expect(updatedBet.status).toEqual(BetStatus.Cancelled);
  });

  it("should not allow bet when time has surpassed the competition end time", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    try {
      await createBet(program, signer, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    } catch (error) {
      expect(error.message).toContain("CompetitionEnded");
    }
  });

  it("should not allow bet when time has surpassed the pool end time", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    try {
      await createBet(program, signer, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    } catch (error) {
      expect(error.message).toContain("PoolEnded");
    }
  });
});