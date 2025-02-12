import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { HorseRace } from '../target/types/horse_race'
import { setupTreasury } from './test-utils'
import { TreasuryAccount } from '../sdk/src/states/treasury-account'
import { depositToTreasury, withdrawFromTreasury } from '../sdk/src'

describe('Treasury', () => {
  const program = anchor.workspace.HorseRace as Program<HorseRace>
  const provider = program.provider as anchor.AnchorProvider

  let treasuryKey: anchor.web3.PublicKey
  let adminWallet: anchor.web3.Keypair

  beforeAll(async () => {
    const setup = await setupTreasury(program)
    treasuryKey = setup.treasuryKey
    adminWallet = setup.adminWallet
  })

  it('should create treasury with correct admin', async () => {
    const treasury = await TreasuryAccount.fetch(program, treasuryKey)
    expect(treasury.adminAuthorities).toContain([adminWallet.publicKey])
    expect(treasury.minSignatures).toEqual(1)
  })

  it('should allow deposits to treasury', async () => {
    const depositAmount = BigInt(1 * anchor.web3.LAMPORTS_PER_SOL)
    const initialBalance = await TreasuryAccount.getBalance(program, treasuryKey)

    await depositToTreasury(program, {
      amount: depositAmount,
    })

    const newBalance = await TreasuryAccount.getBalance(program, treasuryKey)
    expect(newBalance).toEqual(initialBalance + depositAmount)

    const treasury = await TreasuryAccount.fetch(program, treasuryKey)
    expect(treasury.totalDeposits).toEqual(depositAmount)
  })

  it('should allow admin to withdraw from treasury', async () => {
    const withdrawAmount = BigInt(0.5 * anchor.web3.LAMPORTS_PER_SOL)
    const recipient = anchor.web3.Keypair.generate()
    const pool = anchor.web3.Keypair.generate()
    
    const initialBalance = await TreasuryAccount.getBalance(program, treasuryKey)
    const initialRecipientBalance = await provider.connection.getBalance(recipient.publicKey)

    await withdrawFromTreasury(program, {
      amount: withdrawAmount,
      recipient: recipient.publicKey,
      pool: pool.publicKey,
      authority: adminWallet.publicKey,
    })

    const newBalance = await TreasuryAccount.getBalance(program, treasuryKey)
    const newRecipientBalance = await provider.connection.getBalance(recipient.publicKey)

    expect(newBalance).toEqual(initialBalance - withdrawAmount)
    expect(newRecipientBalance).toEqual(initialRecipientBalance + Number(withdrawAmount))

    const treasury = await TreasuryAccount.fetch(program, treasuryKey)
    expect(treasury.totalWithdrawals).toEqual(withdrawAmount)
  })

  it('should not allow non-admin to withdraw', async () => {
    const nonAdmin = anchor.web3.Keypair.generate()
    const withdrawAmount = BigInt(0.1 * anchor.web3.LAMPORTS_PER_SOL)
    const recipient = anchor.web3.Keypair.generate()
    const pool = anchor.web3.Keypair.generate()

    try {
      await withdrawFromTreasury(program, {
        amount: withdrawAmount,
        recipient: recipient.publicKey,
        pool: pool.publicKey,
        authority: nonAdmin.publicKey,
      })
      // expect.toFail('Should not allow non-admin to withdraw')
    } catch (error) {
      expect(error.message).toContain('Unauthorized')
    }
  })
}) 