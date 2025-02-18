import { PublicKey } from '@solana/web3.js'
import { Program, BN } from '@coral-xyz/anchor'
import { HorseRace } from '../types/horse_race'
import { TREASURY_SEED, TREASURY_VAULT_SEED } from '../constants'


export interface TreasuryData {
  adminAuthorities: string[];
  minSignatures: number;
  totalDeposits: number;
  totalWithdrawals: number;
  bump: number;
  vaultKey: string;
  vaultBump: number;
  treasuryKey: string;
}
export class TreasuryAccount {

  constructor(
    public adminAuthorities: PublicKey[],
    public minSignatures: number,
    public totalDeposits: BN,
    public totalWithdrawals: BN,
    public bump: number,
    public vaultKey: PublicKey,
    public vaultBump: number,
    public treasuryKey: PublicKey,
  ) {
    this.adminAuthorities = adminAuthorities
    this.minSignatures = minSignatures
    this.totalDeposits = totalDeposits
    this.totalWithdrawals = totalWithdrawals
    this.bump = bump
    this.vaultKey = vaultKey
    this.vaultBump = vaultBump
    this.treasuryKey = treasuryKey
  }


  static async toTreasuryData(treasury: TreasuryAccount): Promise<TreasuryData> {
    return {
      adminAuthorities: treasury.adminAuthorities.map(a => a.toString()),
      minSignatures: treasury.minSignatures,
      totalDeposits: treasury.totalDeposits.toString(),
      totalWithdrawals: treasury.totalWithdrawals.toString(),
      bump: treasury.bump,
      vaultKey: treasury.vaultKey.toString(),
      vaultBump: treasury.vaultBump,
      treasuryKey: treasury.treasuryKey.toString(),
    }
  }

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
      treasuryKey,
    )
  }

  static async getTreasuryPda(program: Program<HorseRace>): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(TREASURY_SEED)],
      program.programId,
    )
  }

  static async getTreasuryVaultPda(program: Program<HorseRace>): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(TREASURY_VAULT_SEED)],
      program.programId,
    )
  }

  static async getInstance(program: Program<HorseRace>): Promise<TreasuryAccount> {
    const treasury = await program.account.treasury.all();
    return treasury.map(t => new TreasuryAccount(
      t.account.adminAuthorities,
      t.account.minSignatures,
      t.account.totalDeposits,
      t.account.totalWithdrawals,
      t.account.bump,
      t.account.vaultKey,
      t.account.vaultBump,
      t.publicKey,
    ))[0];
  }

  static async getTreasuryData(program: Program<HorseRace>): Promise<TreasuryData> {
    const treasury = await TreasuryAccount.getInstance(program);
    return TreasuryAccount.toTreasuryData(treasury);
  }

  static async getTreasuryKey(program: Program<HorseRace>): Promise<PublicKey> {
    const treasury = await program.account.treasury.all();
    return treasury[0].publicKey;
  }

  static async getBalance(
    program: Program<HorseRace>
  ): Promise<bigint> {
    const connection = program.provider.connection
    const [treasuryVaultKey] = await TreasuryAccount.getTreasuryVaultPda(program);
    const balance = await connection.getBalance(treasuryVaultKey)
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