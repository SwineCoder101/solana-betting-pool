import { tokens } from '@/data/data-constants';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { useBackend } from './use-backend';


interface UpdateCompetitionDto {
  userId: string;
  competitionKey: string;
  tokenA: string;
  priceFeedId: string;
  adminKeys: string[];
  houseCutFactor: number;
  minPayoutRatio: number;
  interval: number;
  startTime: number;
  endTime: number;
}

interface CompetitionResponse {
  signature: string;
  poolKeys: string[];
}


export type CreateCompetitionParams = {
  tokenSymbol: string;
  houseCutFactor: number;
  minPayoutRatio: number;
  interval: number;
  startTime: number;
  endTime: number;
  adminKeys?: string[];
  treasury?: string;
};

// curl -X POST http://localhost:3000/api/competition \               
// -H "Content-Type: application/json" \
// -d '{
//   "tokenA": "7yfCkYodjoferYftgGT91H8nPpnspRAv8uv1HzEfhdhm",  "priceFeedId": "12345",
//   "houseCutFactor": 5,          
//   "minPayoutRatio": 80,        
//   "interval": 600,
//   "startTime": 4070908800,
//   "endTime": 4070910600,
//   "treasury": "ES28kowUxgJ9HiwENF2Jh8fJJZSQ1a1qwM4PS4TWMcEP" 
// }'

export function useCreateCompetitionBackend() {
  const { user } = usePrivy();
  const { baseUrl } = useBackend();

  const createCompetition = useMutation<CompetitionResponse, Error, Omit<CreateCompetitionParams, 'userId'>>({
    mutationKey: ['createCompetitionBackend'],
    mutationFn: async (params) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const tokenData = tokens.find(t => t.symbol === params.tokenSymbol);
        if (!tokenData) {
          throw new Error('Invalid token symbol');
      }
      
      const response = await fetch(`${baseUrl}/competition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          tokenA: tokenData.tokenAddress,
          priceFeedId: tokenData.priceFeedId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create competition');
      }

      return response.json();
    },
    onError: (error: Error) => {
      console.error('Failed to create competition:', error.message);
    },
    onSuccess: (data) => {
      console.log('Competition created successfully:', data);
    },
  });

  const updateCompetition = useMutation<CompetitionResponse, Error, Omit<UpdateCompetitionDto, 'userId'>>({
    mutationKey: ['updateCompetitionBackend'],
    mutationFn: async (params) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${baseUrl}/competition`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update competition');
      }

      return response.json();
    },
    onError: (error: Error) => {
      console.error('Failed to update competition:', error.message);
    },
    onSuccess: (data) => {
      console.log('Competition updated successfully:', data);
    },
  });

  return {
    createCompetition,
    updateCompetition,
  };
} 