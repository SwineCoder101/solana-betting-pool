import * as anchor from '@coral-xyz/anchor'
import { BN } from '@coral-xyz/anchor'
import { depositToTreasury, getVersionTxFromInstructions, withdrawFromTreasury } from '../sdk/src'
import { TreasuryAccount } from '../sdk/src/states/treasury-account'
import { CommonSetup, setupCommon } from './common-setup'
import { createUserWithFunds, signAndSendVTx } from './test-utils'

describe('Treasury', () => {
  let setup: CommonSetup
  let depositor: anchor.web3.Keypair

  beforeAll(async () => {
    setup = await setupCommon()
    depositor = await createUserWithFunds(setup.program.provider.connection)
  }, 100000)

  it('should create treasury with correct admin', async () => {
    const treasury = await TreasuryAccount.fetch(setup.program, setup.treasuryKey)
    expect(treasury.adminAuthorities[0].toString()).toBe(setup.adminWallet.publicKey.toString())
    expect(treasury.minSignatures).toBe(1)
  }, 10000)

  it('should allow deposits to treasury', async () => {
    const depositAmount = new BN(anchor.web3.LAMPORTS_PER_SOL)
    const initialBalance = await TreasuryAccount.getBalance(setup.program, setup.treasuryKey)

    const tx = await depositToTreasury(setup.program, {
      amount: depositAmount,
      depositor: depositor.publicKey,
    })
    const vtx = await getVersionTxFromInstructions(setup.program.provider.connection, [tx]);
    await signAndSendVTx(vtx, depositor, setup.program.provider.connection)

    const newBalance = await TreasuryAccount.getBalance(setup.program, setup.treasuryKey)
    expect(newBalance.toString()).toBe((initialBalance + depositAmount).toString())

    const treasury = await TreasuryAccount.fetch(setup.program, setup.treasuryKey)
    expect(treasury.totalDeposits.toString()).toBe(depositAmount.toString())
  }, 10000)

  it('should fail deposit with insufficient funds', async () => {
    const poorDepositor = anchor.web3.Keypair.generate() // No funds
    const depositAmount = new BN(anchor.web3.LAMPORTS_PER_SOL)

    const tx = await depositToTreasury(setup.program, {
      amount: depositAmount,
      depositor: poorDepositor.publicKey,
    })
    const vtx = await getVersionTxFromInstructions(setup.program.provider.connection, [tx]);

    await expect(
      signAndSendVTx(vtx, poorDepositor, setup.program.provider.connection)
    ).rejects.toThrow(/insufficient funds/)
  }, 10000)

  it('should allow admin to withdraw from treasury', async () => {
    const withdrawAmount = new BN(anchor.web3.LAMPORTS_PER_SOL / 2)
    const recipient = await createUserWithFunds(setup.program.provider.connection)
    const pool = anchor.web3.Keypair.generate()
    
    const initialBalance = await TreasuryAccount.getBalance(setup.program, setup.treasuryKey)
    const initialRecipientBalance = await setup.program.provider.connection.getBalance(recipient.publicKey)

    const tx = await withdrawFromTreasury(setup.program, {
      amount: withdrawAmount,
      recipient: recipient.publicKey,
      pool: pool.publicKey,
      authority: setup.adminWallet.publicKey,
    })
    const vtx = await getVersionTxFromInstructions(setup.program.provider.connection, [tx]);

    await signAndSendVTx(vtx, setup.adminWallet, setup.program.provider.connection)

    const newBalance = await TreasuryAccount.getBalance(setup.program, setup.treasuryKey)
    const newRecipientBalance = await setup.program.provider.connection.getBalance(recipient.publicKey)

    expect(newBalance.toString()).toBe((initialBalance - withdrawAmount).toString())
    expect(newRecipientBalance.toString()).toBe((initialRecipientBalance + withdrawAmount).toString())

    const treasury = await TreasuryAccount.fetch(setup.program, setup.treasuryKey)
    expect(treasury.totalWithdrawals.toString()).toBe(withdrawAmount.toString())
  }, 10000)

  it('should not allow withdrawal exceeding treasury balance', async () => {
    const excessiveAmount = new BN(1000 * anchor.web3.LAMPORTS_PER_SOL) // More than treasury has
    const recipient = anchor.web3.Keypair.generate()
    const pool = anchor.web3.Keypair.generate()

    const tx = await withdrawFromTreasury(setup.program, {
      amount: excessiveAmount,
      recipient: recipient.publicKey,
      pool: pool.publicKey,
      authority: setup.adminWallet.publicKey,
    })
    const vtx = await getVersionTxFromInstructions(setup.program.provider.connection, [tx]);

    await expect(
      signAndSendVTx(vtx, setup.adminWallet, setup.program.provider.connection)
    ).rejects.toThrow(/insufficient funds/i)
  }, 10000)

  it('should not allow non-admin to withdraw', async () => {
    const nonAdmin = await createUserWithFunds(setup.program.provider.connection)
    const withdrawAmount = new BN(0.1 * anchor.web3.LAMPORTS_PER_SOL)
    const recipient = anchor.web3.Keypair.generate()
    const pool = anchor.web3.Keypair.generate()

    const tx = await withdrawFromTreasury(setup.program, {
      amount: withdrawAmount,
      recipient: recipient.publicKey,
      pool: pool.publicKey,
      authority: nonAdmin.publicKey,
    })
    const vtx = await getVersionTxFromInstructions(setup.program.provider.connection, [tx]);

    await expect(
      signAndSendVTx(vtx, nonAdmin, setup.program.provider.connection)
    ).rejects.toThrow(/unauthorized/i)
  }, 20000)
}) 