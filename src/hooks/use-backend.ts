import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface BackendStatus {
  isLive: boolean;
  baseUrl: string;
}

export function useBackend() {
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    // Add /api if it doesn't exist in the URL
    setBaseUrl(backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['backendStatus'],
    queryFn: async (): Promise<BackendStatus> => {
      try {
        const response = await fetch(`${baseUrl}/health`);
        if (!response.ok) throw new Error('Backend health check failed');
        
        return {
          isLive: true,
          baseUrl
        };
      } catch (error) {
        console.error('Backend health check failed:', error);
        return {
          isLive: false,
          baseUrl
        };
      }
    },
    enabled: !!baseUrl,
    refetchInterval: 30000, // Check every 30 seconds
    retry: 2
  });

  return {
    isLive: data?.isLive ?? false,
    isLoading,
    baseUrl: data?.baseUrl || baseUrl
  };
} 