// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SolanabettingapplicationIDL from '../target/idl/solanabettingapplication.json'
import type { Solanabettingapplication } from '../target/types/solanabettingapplication'

// Re-export the generated IDL and type
export { Solanabettingapplication, SolanabettingapplicationIDL }

// The programId is imported from the program IDL.
export const SOLANABETTINGAPPLICATION_PROGRAM_ID = new PublicKey(SolanabettingapplicationIDL.address)

// This is a helper function to get the Solanabettingapplication Anchor program.
export function getSolanabettingapplicationProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...SolanabettingapplicationIDL, address: address ? address.toBase58() : SolanabettingapplicationIDL.address } as Solanabettingapplication, provider)
}

// This is a helper function to get the program ID for the Solanabettingapplication program depending on the cluster.
export function getSolanabettingapplicationProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Solanabettingapplication program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return SOLANABETTINGAPPLICATION_PROGRAM_ID
  }
}
