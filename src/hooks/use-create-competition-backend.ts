import { useMutation } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';

interface CreateCompetitionDto {
  competitionHash: string;
  tokenA: string;
  priceFeedId: string;
  adminKeys: string[];
  houseCutFactor: number;
  minPayoutRatio: number;
  interval: number;
  startTime: number;
  endTime: number;
  treasury: string;
  userId: string;
}

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

const API_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function useCreateCompetitionBackend() {
  const { user } = usePrivy();

  const createCompetition = useMutation<CompetitionResponse, Error, Omit<CreateCompetitionDto, 'userId'>>({
    mutationKey: ['createCompetitionBackend'],
    mutationFn: async (params) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/competition/create`, {
        method: 'POST',
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

      const response = await fetch(`${API_URL}/competition/update`, {
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