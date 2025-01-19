import { setupCompetitionWithPools, SetupDTO } from "./common-setup";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BetStatus, getBetAccountsForPool, getBetData } from "../sdk/src";
import { createUserWithFunds } from "./test-utils";
import { createBet } from "../sdk/src/instructions/user/create-bet";
import { cancelBet } from "../sdk/src/instructions/user/cancel-bet";

describe("Bets", () => {
  let setupDto: SetupDTO;
  let program, user, userOne, userTwo, userThree, poolKeys, competitionPubkey, connection;

  beforeAll(async () => {
    setupDto = await setupCompetitionWithPools();
    program = setupDto.program;
    poolKeys = setupDto.poolKeys ?? [Keypair.generate().publicKey];
    competitionPubkey = setupDto.competitionPubkey;
    connection = setupDto.sdkConfig.connection;

    user = createUserWithFunds(connection);
    userOne = createUserWithFunds(connection);
    userTwo = createUserWithFunds(connection);
    userThree = createUserWithFunds(connection);
  });

  it("should create bet against a pool", async () => {
    const amount = 100;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    const tx = await createBet(program, user, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    console.log('Transaction signature:', tx);

    const betAccounts = await getBetAccountsForPool(program, poolKey);
    expect(betAccounts.length).toBeGreaterThan(0);
    const bet = betAccounts[0];
    expect(bet.user).toEqual(user.toString());
    expect(bet.amount).toEqual(amount);
    expect(bet.lowerBoundPrice).toEqual(lowerBoundPrice);
    expect(bet.upperBoundPrice).toEqual(upperBoundPrice);
    expect(bet.poolKey).toEqual(poolKey.toString());
    expect(bet.competition).toEqual(competitionPubkey.toString());
  });

  it("should create multiple bets against a pool", async () => {
    const amount = 100;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    const numBets = 3;
    for (let i = 0; i < numBets; i++) {
      await createBet(program, user, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    }

    const betAccounts = await getBetAccountsForPool(program, poolKey);
    expect(betAccounts.length).toEqual(numBets);
  });

  it("should create multiple bets against multiple pools", async () => {
    const amount = 100;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;

    const numBetsPerPool = 2;

    for (const poolKey of poolKeys) {
      for (let i = 0; i < numBetsPerPool; i++) {
        await createBet(program, user, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
      }
    }

    for (const poolKey of poolKeys) {
      const betAccounts = await getBetAccountsForPool(program, poolKey);
      expect(betAccounts.length).toEqual(numBetsPerPool);
    }
  });

  it("should create bets from multiple users against a pool", async () => {
    const amount = 100;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    await createBet(program, userOne, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    await createBet(program, userTwo, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    await createBet(program, userThree, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);

    const betAccounts = await getBetAccountsForPool(program, poolKey);
    expect(betAccounts.length).toEqual(3);
  });

  it("should cancel a bet after a bet is already created", async () => {
    const amount = 100;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys? poolKeys[0] : Keypair.generate().publicKey;

    const txCreate = await createBet(program, user, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    console.log('Transaction signature (create):', txCreate);

    const betAccounts = await getBetAccountsForPool(program, poolKey);
    expect(betAccounts.length).toBeGreaterThan(0);
    const bet = betAccounts[0];

    const txCancel = await cancelBet(program, user, new PublicKey(bet.user), poolKey);
    console.log('Transaction signature (cancel):', txCancel);

    const updatedBet = await getBetData(program, new PublicKey(bet.user));
    expect(updatedBet.status).toEqual(BetStatus.Cancelled);
  });

  it("should not allow bet when time has surpassed the competition end time", async () => {
    const amount = 100;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    const tx = await createBet(program, user, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    console.log('Transaction signature:', tx);

    const betAccounts = await getBetAccountsForPool(program, poolKey);
    expect(betAccounts.length).toEqual(0);
  });

  it("should not allow bet when time has surpassed the pool end time", async () => {
    const amount = 100;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    const tx = await createBet(program, user, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey);
    console.log('Transaction signature:', tx);

    const betAccounts = await getBetAccountsForPool(program, poolKey);
    expect(betAccounts.length).toEqual(0);
  });
});