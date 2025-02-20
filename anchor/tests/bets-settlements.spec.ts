import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getActiveBetAccountsForPool, HorseRace } from "../sdk/src";
import { settlePoolByPrice } from "../sdk/src/instructions/admin/settle-pool-by-price";
import { setupCompetitionWithPools, SetupDTO } from "./common-setup";
import { executeCreateBet, signAndSendVTx } from "./test-utils";

jest.setTimeout(30000);

describe("Bets Settlement", () => {
  let setupDto: SetupDTO;
  let program: anchor.Program<HorseRace>;
  let poolKeys: PublicKey[];
  let competitionPubkey: PublicKey;
  let connection: anchor.web3.Connection;
  let admin: Keypair, playerOne: Keypair;

  beforeAll(async () => {
    // This common setup creates a competition with pools and returns the shared treasury PDA, testAdmin, etc.
    setupDto = await setupCompetitionWithPools(false);
    program = setupDto.program;
    poolKeys = setupDto.poolKeys ?? [Keypair.generate().publicKey];
    competitionPubkey = setupDto.competitionPubkey;
    connection = setupDto.sdkConfig.connection;
    admin = setupDto.testAdmin;
    playerOne = setupDto.testPlayerOne;
  });

  // Test scenario: one bet wins and one bet loses
  it.skip("should settle with one winning bet and one losing bet", async () => {
    const poolKey = poolKeys[0];

    // Define bet parameters:
    const betAmount = new BN(1 * LAMPORTS_PER_SOL);
    // Admin's bet: winning bet parameters
    const adminBetLower = 50;
    const adminBetUpper = 150;
    // PlayerOne's bet: losing bet parameters
    const playerOneBetLower = 300;
    const playerOneBetUpper = 400;

    const userOneBalanceBefore = await connection.getBalance(playerOne.publicKey);
    const userTwoBalanceBefore = await connection.getBalance(admin.publicKey);

    // Create a bet from admin (winning)
    await executeCreateBet(
      program,
      admin,
      betAmount.toNumber(),
      adminBetLower,
      adminBetUpper,
      1.5, // leverage multiplier
      poolKey,
      competitionPubkey,
      admin
    );
    // Create a bet from playerOne (losing)
    await executeCreateBet(
      program,
      playerOne,
      betAmount.toNumber(),
      playerOneBetLower,
      playerOneBetUpper,
      1.5,
      poolKey,
      competitionPubkey,
      playerOne
    );

    // Settle pool with a settlement price range that covers admin's bet only
    const settlementLower = 50;
    const settlementUpper = 150;
    const settleTx = await settlePoolByPrice(
      program,
      admin.publicKey, // authority (use admin which is in treasury admin list)
      poolKey,
      settlementLower,
      settlementUpper
    );
    await signAndSendVTx(settleTx, admin, connection);


    const userOneBalanceAfter = await connection.getBalance(playerOne.publicKey);
    const userTwoBalanceAfter = await connection.getBalance(admin.publicKey);
    
    // Verify that no active bets remain in this pool
    const activeBets = await getActiveBetAccountsForPool(program, poolKey);
    expect(activeBets.length).toBe(0);

    expect(userOneBalanceAfter).toBeLessThan(userOneBalanceBefore);
    expect(userTwoBalanceAfter).toBeGreaterThan(userTwoBalanceBefore);
  });

  // Test scenario: both bets lose
  it("should settle with both bets losing", async () => {
    const poolKey = poolKeys[1] || Keypair.generate().publicKey;
    const betAmount = new BN(1 * LAMPORTS_PER_SOL);
    // Both bets: losing bet parameters (range outside settlement)
    const betLower = 300;
    const betUpper = 400;

    const treasuryBalanceBefore = await connection.getBalance(setupDto.treasury);

    await executeCreateBet(program, admin, betAmount.toNumber(), betLower, betUpper, 1, poolKey, competitionPubkey, admin);
    await executeCreateBet(program, playerOne, betAmount.toNumber(), betLower, betUpper, 1, poolKey, competitionPubkey, playerOne);

    // Settle pool with a settlement range that does not satisfy either bet.
    const settlementLower = 50;
    const settlementUpper = 150;
    const settleTx = await settlePoolByPrice(
      program,
      admin.publicKey,
      poolKey,
      settlementLower,
      settlementUpper
    );
    await signAndSendVTx(settleTx, admin, connection);

    const activeBets = await getActiveBetAccountsForPool(program, poolKey);
    const treasuryBalanceAfter = await connection.getBalance(setupDto.treasury);
    
    expect(activeBets.length).toBe(0);
    expect(treasuryBalanceAfter).toBeGreaterThan(treasuryBalanceBefore);
  });

  it.skip("should settle with both bets winning", async () => {
    const poolKey = poolKeys[2] || Keypair.generate().publicKey;
    const betAmount = new BN(1 * LAMPORTS_PER_SOL);
    // Both bets: winning parameters
    const betLower = 50;
    const betUpper = 150;

    const userOneBalanceBefore = await connection.getBalance(playerOne.publicKey);
    const userTwoBalanceBefore = await connection.getBalance(admin.publicKey);

    await executeCreateBet(program, admin, betAmount.toNumber(), betLower, betUpper, 1, poolKey, competitionPubkey, admin);
    await executeCreateBet(program, playerOne, betAmount.toNumber(), betLower, betUpper, 1, poolKey, competitionPubkey, playerOne);

    // Settle pool with a settlement range that covers both bets.
    const settlementLower = 50;
    const settlementUpper = 150;
    const settleTx = await settlePoolByPrice(
      program,
      admin.publicKey,
      poolKey,
      settlementLower,
      settlementUpper
    );
    await signAndSendVTx(settleTx, admin, connection);

    const activeBets = await getActiveBetAccountsForPool(program, poolKey);
    expect(activeBets.length).toBe(0);

    const userOneBalanceAfter = await connection.getBalance(playerOne.publicKey);
    const userTwoBalanceAfter = await connection.getBalance(admin.publicKey);

    expect(userOneBalanceAfter).toBeGreaterThan(userOneBalanceBefore);
    expect(userTwoBalanceAfter).toBeGreaterThan(userTwoBalanceBefore);
  });
});
