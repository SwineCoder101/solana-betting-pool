import * as anchor from '@coral-xyz/anchor'
import { BN, web3 } from '@coral-xyz/anchor'
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js'
import { depositToTreasury, getVersionTxFromInstructions, HorseRace, withdrawFromTreasury } from '../sdk/src'
import { TreasuryAccount } from '../sdk/src/states/treasury-account'
import { getActiveBetAccountsForPool, getBetAccountsForPool, getBetAccountsForUser } from "../sdk/src"
import { settlePoolByPrice } from "../sdk/src/instructions/admin/settle-pool-by-price"
import { setupCompetitionWithPools, SetupDTO } from "./common-setup"
import { createUserWithFunds, signAndSendVTx, executeCreateBet } from "./test-utils"

// Helper to create an empty pool account (required by the withdraw instruction)
async function createPoolAccount(
  connection: web3.Connection,
  payer: Keypair,
  pool: Keypair
) {
  const lamports = await connection.getMinimumBalanceForRentExemption(0)
  const ix = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: pool.publicKey,
    lamports,
    space: 0,
    programId: SystemProgram.programId,
  })
  const tx = new web3.Transaction().add(ix)
  await connection.sendTransaction(tx, [payer, pool])
}

describe.skip("Bets, Settlements and Treasury", () => {
  let setupDto: SetupDTO
  let program: anchor.Program<HorseRace>, poolKeys: PublicKey[], competitionPubkey: PublicKey, connection: web3.Connection
  let signer: Keypair
  let treasuryKey: PublicKey
  const poolsToBetCountMap = new Map<PublicKey, number>()
  let numberOfBetsForSigner: number

  beforeAll(async () => {
    // Use your setupCompetitionWithPools function.
    setupDto = await setupCompetitionWithPools() // by default bypassTreasury is false
    program = setupDto.program;    
    poolKeys = setupDto.poolKeys ?? [Keypair.generate().publicKey]
    competitionPubkey = setupDto.competitionPubkey
    connection = setupDto.sdkConfig.connection
    treasuryKey = setupDto.treasury // treasury is set in the setup DTO
    signer = setupDto.testAdmin

    // Initialize bet counts for each pool
    for (const poolKey of poolKeys) {
      const betAccounts = await getBetAccountsForPool(program, poolKey)
      poolsToBetCountMap.set(poolKey, betAccounts.length)
    }
    numberOfBetsForSigner = (await getBetAccountsForUser(program, signer.publicKey)).length
  }, 30000)

  describe("Treasury Operations", () => {
    it("should allow deposits to treasury", async () => {
      const depositAmount = new BN(anchor.web3.LAMPORTS_PER_SOL)
      const initialBalance = await TreasuryAccount.getBalance(program)

      const tx = await depositToTreasury(program, {
        amount: depositAmount,
        depositor: signer.publicKey,
      })
      const vtx = await getVersionTxFromInstructions(connection, [tx])
      await signAndSendVTx(vtx, signer, connection)

      const newBalance = await TreasuryAccount.getBalance(program)
      expect(newBalance.toString()).toBe(
        (BigInt(initialBalance) + BigInt(depositAmount)).toString()
      )

      const treasuryData = await TreasuryAccount.fetch(program, treasuryKey)
      expect(treasuryData.totalDeposits.toString()).toBe(depositAmount.toString())
    }, 10000)

    it("should fail deposit with insufficient funds", async () => {
      // Create a 'poor' depositor (only enough lamports for fees)
      const poorDepositor = Keypair.generate()
      await connection.requestAirdrop(poorDepositor.publicKey, 1_000_000) // ~0.001 SOL
      const depositAmount = new BN(anchor.web3.LAMPORTS_PER_SOL)

      const tx = await depositToTreasury(program, {
        amount: depositAmount,
        depositor: poorDepositor.publicKey,
      })
      const vtx = await getVersionTxFromInstructions(connection, [tx])
      await expect(
        signAndSendVTx(vtx, poorDepositor, connection)
      ).rejects.toThrow(/(insufficient funds|no logs available)/i)
    }, 10000)

    it("should allow admin to withdraw from treasury", async () => {
      // Deposit extra funds so that the treasury PDA has enough lamports.
      {
        const depositAmount = new BN(anchor.web3.LAMPORTS_PER_SOL)
        const txDeposit = await depositToTreasury(program, {
          amount: depositAmount,
          depositor: signer.publicKey,
        })
        const vtxDeposit = await getVersionTxFromInstructions(connection, [txDeposit])
        await signAndSendVTx(vtxDeposit, signer, connection)
      }

      const withdrawAmount = new BN(anchor.web3.LAMPORTS_PER_SOL / 2)
      const recipient = await createUserWithFunds(connection)
      const pool = Keypair.generate()

      // Create a dummy pool account (as required by the instruction)
      await createPoolAccount(connection, signer, pool)

      const initialBalance = await TreasuryAccount.getBalance(program)
      const initialRecipientBalance = await connection.getBalance(recipient.publicKey)

      const tx = await withdrawFromTreasury(program, {
        amount: withdrawAmount,
        recipient: recipient.publicKey,
        pool: pool.publicKey,
        authority: signer.publicKey,
      })
      const vtx = await getVersionTxFromInstructions(connection, [tx])
      await signAndSendVTx(vtx, signer, connection)

      const newBalance = await TreasuryAccount.getBalance(program)
      const newRecipientBalance = await connection.getBalance(recipient.publicKey)
      expect(newBalance.toString()).toBe(
        (BigInt(initialBalance) - BigInt(withdrawAmount)).toString()
      )
      expect(newRecipientBalance.toString()).toBe(
        (BigInt(initialRecipientBalance) + BigInt(withdrawAmount)).toString()
      )

      const treasuryData = await TreasuryAccount.fetch(program, treasuryKey)
      expect(treasuryData.totalWithdrawals.toString()).toBe(withdrawAmount.toString())
    }, 20000)

    it("should not allow withdrawal exceeding treasury balance", async () => {
      const excessiveAmount = new BN(1000 * anchor.web3.LAMPORTS_PER_SOL)
      const recipient = Keypair.generate()
      const pool = Keypair.generate()
      await createPoolAccount(connection, signer, pool)

      const tx = await withdrawFromTreasury(program, {
        amount: excessiveAmount,
        recipient: recipient.publicKey,
        pool: pool.publicKey,
        authority: signer.publicKey,
      })
      const vtx = await getVersionTxFromInstructions(connection, [tx])
      await expect(
        signAndSendVTx(vtx, signer, connection)
      ).rejects.toThrow(/insufficient funds/i)
    }, 10000)

    it("should not allow non-admin to withdraw", async () => {
      const nonAdmin = await createUserWithFunds(connection)
      const withdrawAmount = new BN(0.1 * anchor.web3.LAMPORTS_PER_SOL)
      const recipient = Keypair.generate()
      const pool = Keypair.generate()
      await createPoolAccount(connection, nonAdmin, pool)

      const tx = await withdrawFromTreasury(program, {
        amount: withdrawAmount,
        recipient: recipient.publicKey,
        pool: pool.publicKey,
        authority: nonAdmin.publicKey,
      })
      const vtx = await getVersionTxFromInstructions(connection, [tx])
      await expect(
        signAndSendVTx(vtx, nonAdmin, connection)
      ).rejects.toThrow(/unauthorized/i)
    }, 20000)
  })

  describe("Bets and Settlements", () => {
    it("should settle all funds from pool to treasury if no bet has won", async () => {
      const amount = new BN(5 * LAMPORTS_PER_SOL)
      const betLowerBoundPrice = 50
      const betUpperBoundPrice = 150
      // Oracle prices outside the bet range force a loss.
      const oracleLowerBoundPrice = 200
      const oracleUpperBoundPrice = 250
      const poolKey = poolKeys[0]

      // Get initial balances
      const userBalanceBefore = await connection.getBalance(signer.publicKey)
      const treasuryBalanceBefore = await connection.getBalance(treasuryKey)
      const poolBalanceBeforeBet = await connection.getBalance(poolKey)

      console.log('treasuryKey', treasuryKey.toBase58())
      console.log('signer', signer.publicKey.toBase58())
      console.log('treasuryBalanceBefore', treasuryBalanceBefore / LAMPORTS_PER_SOL)
      console.log('userBalanceBefore', userBalanceBefore / LAMPORTS_PER_SOL)

      // Create a bet
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
      )

      // Verify that the pool received the bet amount.
      const poolBalanceAfterBet = await connection.getBalance(poolKey)
      expect(poolBalanceAfterBet - poolBalanceBeforeBet).toBe(amount.toNumber())

      // Settle the pool (since the oracle prices are outside the bet range,
      // no bet wins and funds go to the treasury)
      const settleTx = await settlePoolByPrice(
        program,
        signer.publicKey,
        poolKey,
        oracleLowerBoundPrice,
        oracleUpperBoundPrice
      )
      await signAndSendVTx(settleTx, signer, connection)

      const userBalanceAfter = await connection.getBalance(signer.publicKey)
      const treasuryBalanceAfter = await connection.getBalance(treasuryKey)
      const poolBalanceAfter = await connection.getBalance(poolKey)

      console.log('treasuryBalanceAfter', treasuryBalanceAfter / LAMPORTS_PER_SOL)
      console.log('userBalanceAfter', userBalanceAfter / LAMPORTS_PER_SOL)
      console.log('poolBalanceAfter', poolBalanceAfter / LAMPORTS_PER_SOL)

      const betAccounts = await getActiveBetAccountsForPool(program, poolKey)
      expect(betAccounts.length).toBe(0)

      const userBalanceDiff = userBalanceBefore - userBalanceAfter
      expect(userBalanceDiff).toBeGreaterThanOrEqual(amount.toNumber())
      expect(userBalanceDiff).toBeLessThan(amount.toNumber() + 0.1 * LAMPORTS_PER_SOL)

      expect(treasuryBalanceAfter).toBe(treasuryBalanceBefore + amount.toNumber())
      expect(poolBalanceAfter).toBe(poolBalanceBeforeBet)
    })

    it("should settle to user if bet has won on the exact range", async () => {
      const amount = new BN(5 * LAMPORTS_PER_SOL)
      const lowerBoundPrice = 50
      const upperBoundPrice = 150
      const poolKey = poolKeys[1]

      const treasuryBalanceBefore = await connection.getBalance(treasuryKey)
      const poolBalanceBeforeBet = await connection.getBalance(poolKey)

      await executeCreateBet(
        program,
        signer,
        amount.toNumber(),
        lowerBoundPrice,
        upperBoundPrice,
        1,
        poolKey,
        competitionPubkey,
        signer
      )

      // Settle the pool using oracle prices that match the bet range (so the bet wins)
      const settleTx = await settlePoolByPrice(
        program,
        signer.publicKey,
        poolKey,
        lowerBoundPrice,
        upperBoundPrice
      )
      await signAndSendVTx(settleTx, signer, connection)

      const betAccounts = await getActiveBetAccountsForPool(program, poolKey)
      expect(betAccounts.length).toBe(0)

      const poolBalanceAfter = await connection.getBalance(poolKey)
      const treasuryBalanceAfter = await connection.getBalance(treasuryKey)

      // In a winning settlement the treasury should not lose funds.
      expect(treasuryBalanceBefore - treasuryBalanceAfter).toBe(0)
      expect(poolBalanceAfter).toBe(poolBalanceBeforeBet)
    })
  })
})
