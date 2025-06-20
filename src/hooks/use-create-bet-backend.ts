import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackend } from './use-backend';
import { BetData } from '@/types';

interface CreateBetParams {
  amount: number;
  lowerBoundPrice: number;
  upperBoundPrice: number;
  poolKey: string;
  competitionKey: string;
  leverageMultiplier: number;
}

interface CancelBetParams {
  poolKey: string;
  userKey: string;
}

export interface CreateBetResponse {
  txHash: string;
}

export interface CancelBetResponse {
  txs: string[];
  bets: BetData[];
}

export function useCreateBetBackend() {
  const { user } = usePrivy();
  const queryClient = useQueryClient();
  const { baseUrl } = useBackend();

  const createBetMutation = useMutation<CreateBetResponse, Error, CreateBetParams>({
    mutationFn: async (params: CreateBetParams) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${baseUrl}/order/create-bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: params.amount,
          lowerBoundPrice: params.lowerBoundPrice,
          upperBoundPrice: params.upperBoundPrice,
          poolKey: params.poolKey,
          competitionKey: params.competitionKey,
          leverageMultiplier: params.leverageMultiplier,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create bet');
      }

      return response.json() as unknown as CreateBetResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['allBets'],
        exact: true,
        refetchType: 'active'
      });
      
      queryClient.refetchQueries({ 
        queryKey: ['allBets'],
        exact: true
      });
    },
    onError: (error) => {
      console.error('Failed to create bet:', error);
    },
  });

  const cancelBetMutation = useMutation<CancelBetResponse, Error, CancelBetParams>({
    mutationFn: async (params: CancelBetParams) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${baseUrl}/order/cancel-bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          poolKey: params.poolKey,
          userKey: params.userKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel bet');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBets'] });
      queryClient.invalidateQueries({ queryKey: ['userBets'] });
    },
    onError: (error) => {
      console.error('Failed to cancel bet:', error);
    },
  });

  return {
    createBet: createBetMutation,
    cancelBet: cancelBetMutation,
  };
}
