import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

const API_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3001';

export function useCreateBetBackend() {
  const { user } = usePrivy();
  const queryClient = useQueryClient();

  const createBetMutation = useMutation({
    mutationFn: async (params: CreateBetParams) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/order/create-bet`, {
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
      // Invalidate relevant queries
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

      const response = await fetch(`${API_URL}/order/cancel-bet`, {
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
      // Invalidate relevant queries
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
