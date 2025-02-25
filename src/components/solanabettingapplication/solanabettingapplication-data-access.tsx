import { getSolanabettingapplicationProgram, getSolanabettingapplicationProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '@/hooks/use-toaster'
import { CLUSTER_TO_USE } from '@/config'

export function useSolanabettingapplicationProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast(CLUSTER_TO_USE)
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSolanabettingapplicationProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getSolanabettingapplicationProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['solanabettingapplication', 'all', { cluster }],
    queryFn: () => program.account.solanabettingapplication.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['solanabettingapplication', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ solanabettingapplication: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useSolanabettingapplicationProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast(CLUSTER_TO_USE)
  const { program, accounts } = useSolanabettingapplicationProgram()

  const accountQuery = useQuery({
    queryKey: ['solanabettingapplication', 'fetch', { cluster, account }],
    queryFn: () => program.account.solanabettingapplication.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['solanabettingapplication', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ solanabettingapplication: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['solanabettingapplication', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ solanabettingapplication: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['solanabettingapplication', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ solanabettingapplication: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['solanabettingapplication', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ solanabettingapplication: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
