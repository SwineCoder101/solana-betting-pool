import { PublicKey } from '@solana/web3.js'
import { Program, BN } from '@coral-xyz/anchor'
import { HorseRace } from '../types/horse_race'
import { TREASURY_SEED } from '../constants'

export class TreasuryAccount {
  constructor(
    public adminAuthorities: PublicKey[],
    public minSignatures: number,
    public totalDeposits: BN,
    public totalWithdrawals: BN,
    public bump: number,
  ) {}

  static async fetch(
    program: Program<HorseRace>,
    treasuryKey: PublicKey,
  ): Promise<TreasuryAccount> {
    const account = await program.account.treasury.fetch(treasuryKey)
    return new TreasuryAccount(
      account.adminAuthorities,
      account.minSignatures,
      account.totalDeposits,
      account.totalWithdrawals,
      account.bump,
    )
  }

  static async getPda(program: Program<HorseRace>): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(TREASURY_SEED)],
      program.programId,
    )
  }

  static async getBalance(
    program: Program<HorseRace>,
    treasuryKey: PublicKey,
  ): Promise<bigint> {
    const connection = program.provider.connection
    const balance = await connection.getBalance(treasuryKey)
    return BigInt(balance)
  }
} 