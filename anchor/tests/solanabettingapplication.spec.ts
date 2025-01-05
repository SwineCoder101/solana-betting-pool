import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Solanabettingapplication} from '../target/types/solanabettingapplication'

describe('solanabettingapplication', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Solanabettingapplication as Program<Solanabettingapplication>

  const solanabettingapplicationKeypair = Keypair.generate()

  it('Initialize Solanabettingapplication', async () => {
    await program.methods
      .initialize()
      .accounts({
        solanabettingapplication: solanabettingapplicationKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([solanabettingapplicationKeypair])
      .rpc()

    const currentCount = await program.account.solanabettingapplication.fetch(solanabettingapplicationKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Solanabettingapplication', async () => {
    await program.methods.increment().accounts({ solanabettingapplication: solanabettingapplicationKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanabettingapplication.fetch(solanabettingapplicationKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Solanabettingapplication Again', async () => {
    await program.methods.increment().accounts({ solanabettingapplication: solanabettingapplicationKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanabettingapplication.fetch(solanabettingapplicationKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Solanabettingapplication', async () => {
    await program.methods.decrement().accounts({ solanabettingapplication: solanabettingapplicationKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanabettingapplication.fetch(solanabettingapplicationKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set solanabettingapplication value', async () => {
    await program.methods.set(42).accounts({ solanabettingapplication: solanabettingapplicationKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanabettingapplication.fetch(solanabettingapplicationKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the solanabettingapplication account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        solanabettingapplication: solanabettingapplicationKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.solanabettingapplication.fetchNullable(solanabettingapplicationKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
