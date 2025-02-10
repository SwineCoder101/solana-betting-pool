import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { useBackend } from './use-backend';

interface SettlementResponse {
  signature: string;
}

export type SettlementParams = {
  poolKey: string;
  lowerBoundPrice: number;
  upperBoundPrice: number;
};

export function useSettlementBackend() {
  const { user } = usePrivy();
  const { baseUrl } = useBackend();

  const settleByPrice = useMutation<SettlementResponse, Error, SettlementParams>({
    mutationKey: ['settleByPrice'],
    mutationFn: async (params) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${baseUrl}/settlement/settle-by-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to settle pool');
      }

      return response.json();
    },
    onError: (error: Error) => {
      console.error('Failed to settle pool:', error.message);
    },
    onSuccess: (data) => {
      console.log('Pool settled successfully:', data);
    },
  });

  return {
    settleByPrice,
  };
} 