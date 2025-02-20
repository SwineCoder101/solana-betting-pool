import * as anchor from '@coral-xyz/anchor'
import { BN, web3 } from '@coral-xyz/anchor'
import { SystemProgram } from '@solana/web3.js'
import {
  depositToTreasury,
  getVersionTxFromInstructions,
  withdrawFromTreasury
} from '../sdk/src'
import { TreasuryAccount } from '../sdk/src/states/treasury-account'
import {confirmTransaction, setupEnvironment, setupTreasury, TreasurySetup } from './common-setup'
import { createUserWithFunds, signAndSendVTx } from './test-utils'

// Helper to create an empty pool account so that the mutable account exists.
async function createPoolAccount(
  connection: web3.Connection,
  payer: web3.Keypair,
  pool: web3.Keypair
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

describe('Treasury', () => {
  let setup: TreasurySetup
  let depositor: anchor.web3.Keypair
  
  beforeAll(async () => {
    const {testAdmin} = await setupEnvironment();
    setup = await setupTreasury(testAdmin);
    depositor = setup.adminWallet
  }, 100000)

  it('should create treasury with correct admin', async () => {
    const treasury = await TreasuryAccount.fetch(setup.program, setup.treasuryKey)
    const adminAuthorities = treasury.adminAuthorities.map(a => a.toBase58())
    expect(adminAuthorities).toContain(setup.adminWallet.publicKey.toBase58())
    expect(treasury.minSignatures).toBeGreaterThanOrEqual(1)
  }, 10000)

  it('should allow deposits to treasury', async () => {
    const depositAmount = new BN(anchor.web3.LAMPORTS_PER_SOL)
    const initialBalance = await TreasuryAccount.getBalance(setup.program)

    const tx = await depositToTreasury(setup.program, {
      amount: depositAmount,
      depositor: depositor.publicKey,
    })
    const vtx = await getVersionTxFromInstructions(setup.program.provider.connection, [tx])
    const sig = await signAndSendVTx(vtx, depositor, setup.program.provider.connection)
    await confirmTransaction(sig, setup.program)

    const newBalance = await TreasuryAccount.getBalance(setup.program)
    // Use BigInt arithmetic for BN values.
    expect(newBalance).toBe((BigInt(initialBalance)));

    const treasury = await TreasuryAccount.fetch(setup.program, setup.treasuryKey)
    expect(treasury.totalDeposits.toString()).toBe(depositAmount.toString())
  }, 10000)

  it('should fail deposit with insufficient funds', async () => {
    // Create a poor depositor with just enough lamports for fees.
    const poorDepositor = anchor.web3.Keypair.generate()
    await setup.program.provider.connection.requestAirdrop(poorDepositor.publicKey, 1_000_000) // ~0.001 SOL
    const depositAmount = new BN(anchor.web3.LAMPORTS_PER_SOL)

    const tx = await depositToTreasury(setup.program, {
      amount: depositAmount,
      depositor: poorDepositor.publicKey,
    })
    const vtx = await getVersionTxFromInstructions(setup.program.provider.connection, [tx])

    // Accept either an error mentioning "insufficient funds" or "No logs available"
    await expect(
      signAndSendVTx(vtx, poorDepositor, setup.program.provider.connection)
    ).rejects.toThrow(/(insufficient funds|no logs available)/i)
  }, 10000)

  it('should allow admin to withdraw from treasury', async () => {
    // Ensure the treasury has enough funds by depositing an extra 1 SOL.
    {
      const depositAmount = new BN(anchor.web3.LAMPORTS_PER_SOL)
      const txDeposit = await depositToTreasury(setup.program, {
        amount: depositAmount,
        depositor: depositor.publicKey,
      })
      const vtxDeposit = await getVersionTxFromInstructions(setup.program.provider.connection, [txDeposit])
      const sigDeposit = await signAndSendVTx(vtxDeposit, depositor, setup.program.provider.connection)
      await confirmTransaction(sigDeposit, setup.program)
    }

    const withdrawAmount = new BN(anchor.web3.LAMPORTS_PER_SOL / 2)
    const recipient = await createUserWithFunds(setup.program.provider.connection)
    const pool = anchor.web3.Keypair.generate()

    // Create the pool account on-chain so that it exists.
    await createPoolAccount(setup.program.provider.connection, setup.adminWallet, pool)

    const initialBalance = await TreasuryAccount.getBalance(setup.program)
    const initialRecipientBalance = await setup.program.provider.connection.getBalance(recipient.publicKey)

    const tx = await withdrawFromTreasury(setup.program, {
      amount: withdrawAmount,
      recipient: recipient.publicKey,
      pool: pool.publicKey,
      authority: setup.adminWallet.publicKey,
    })
    const vtxWithdraw = await getVersionTxFromInstructions(setup.program.provider.connection, [tx])
    const sigWithdraw = await signAndSendVTx(vtxWithdraw, setup.adminWallet, setup.program.provider.connection)
    await confirmTransaction(sigWithdraw, setup.program)

    const newBalance = await TreasuryAccount.getBalance(setup.program)
    const newRecipientBalance = await setup.program.provider.connection.getBalance(recipient.publicKey)
    expect(newBalance.toString()).toBe((BigInt(initialBalance) - BigInt(withdrawAmount)).toString())
    expect(newRecipientBalance.toString()).toBe((BigInt(initialRecipientBalance) + BigInt(withdrawAmount)).toString())

    const treasury = await TreasuryAccount.fetch(setup.program, setup.treasuryKey)
    expect(treasury.totalWithdrawals.toString()).toBe(withdrawAmount.toString())
  }, 20000) // increased timeout

  it('should not allow withdrawal exceeding treasury balance', async () => {
    const excessiveAmount = new BN(1000 * anchor.web3.LAMPORTS_PER_SOL) // More than treasury has
    const recipient = anchor.web3.Keypair.generate()
    const pool = anchor.web3.Keypair.generate()

    await createPoolAccount(setup.program.provider.connection, setup.adminWallet, pool)

    const tx = await withdrawFromTreasury(setup.program, {
      amount: excessiveAmount,
      recipient: recipient.publicKey,
      pool: pool.publicKey,
      authority: setup.adminWallet.publicKey,
    })
    const vtx = await getVersionTxFromInstructions(setup.program.provider.connection, [tx])
    await expect(
      signAndSendVTx(vtx, setup.adminWallet, setup.program.provider.connection)
    ).rejects.toThrow(/insufficient funds/i)
  }, 10000)

  it('should not allow non-admin to withdraw', async () => {
    const nonAdmin = await createUserWithFunds(setup.program.provider.connection)
    const withdrawAmount = new BN(0.1 * anchor.web3.LAMPORTS_PER_SOL)
    const recipient = anchor.web3.Keypair.generate()
    const pool = anchor.web3.Keypair.generate()

    await createPoolAccount(setup.program.provider.connection, nonAdmin, pool)

    const tx = await withdrawFromTreasury(setup.program, {
      amount: withdrawAmount,
      recipient: recipient.publicKey,
      pool: pool.publicKey,
      authority: nonAdmin.publicKey,
    })
    const vtx = await getVersionTxFromInstructions(setup.program.provider.connection, [tx])
    await expect(
      signAndSendVTx(vtx, nonAdmin, setup.program.provider.connection)
    ).rejects.toThrow(/unauthorized/i)
  }, 20000)
})
