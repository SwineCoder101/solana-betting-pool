import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackend } from './use-backend';

interface CreateBetParams {
  amount: number;
  lowerBoundPrice: number;
  upperBoundPrice: number;
  poolKey: string;
  competitionKey: string;
}

interface CancelBetParams {
  poolKey: string;
  betHash: string;
}

export function useCreateBetBackend() {
  const { user } = usePrivy();
  const queryClient = useQueryClient();
  const { baseUrl } = useBackend();

  const createBetMutation = useMutation({
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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create bet');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBets'] });
      queryClient.invalidateQueries({ queryKey: ['userBets'] });
    },
    onError: (error) => {
      console.error('Failed to create bet:', error);
    },
  });

  const cancelBetMutation = useMutation({
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
          betHash: params.betHash,
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
