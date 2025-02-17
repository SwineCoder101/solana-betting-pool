import { PublicKey } from '@solana/web3.js'
import { Program, BN } from '@coral-xyz/anchor'
import { HorseRace } from '../types/horse_race'
import { TREASURY_SEED, TREASURY_VAULT_SEED } from '../constants'

export class TreasuryAccount {
  constructor(
    public adminAuthorities: PublicKey[],
    public minSignatures: number,
    public totalDeposits: BN,
    public totalWithdrawals: BN,
    public bump: number,
    public vaultKey: PublicKey,
    public vaultBump: number,
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
      account.vaultKey,
      account.vaultBump,
    )
  }

  static async getTreasuryPda(program: Program<HorseRace>): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(TREASURY_SEED)],
      program.programId,
    )
  }

  static async getTreasuryVaultPda(program: Program<HorseRace>, treasuryKey: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(TREASURY_VAULT_SEED), treasuryKey.toBuffer()],
      program.programId,
    )
  }

  static async getTreasuryKey(program: Program<HorseRace>): Promise<PublicKey> {
    const treasury = (await program.account.treasury.all());
    return treasury[0].publicKey;
  }

  static async getBalance(
    program: Program<HorseRace>,
    treasuryKey: PublicKey,
  ): Promise<bigint> {
    const connection = program.provider.connection
    const balance = await connection.getBalance(treasuryKey)
    return BigInt(balance)
  }

  static async isInitialized(program: Program<HorseRace>): Promise<boolean> {
    try {
      const [treasuryPda] = await TreasuryAccount.getTreasuryPda(program)
      // Attempt to fetch the treasury account; if it does not exist, an error will be thrown.
      await program.account.treasury.fetch(treasuryPda)
      return true
    } catch (err) {
      console.log('treasury not initialized', err);
      return false
    }
  }
} 