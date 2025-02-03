import { useAnchorProviderWithPrivy } from '@/components/hooks/useAnchorProviderWithPrivy';
import { Program } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import { IDL } from '../../anchor/sdk/src';

export function useAnchorProgram() {
  const { provider } = useAnchorProviderWithPrivy();

  // Create memoized program instance
  const program = useMemo(() => {
    if (!provider) {
      return null;
    }
    
    try {
      return new Program(
        IDL,
        provider
      );
    } catch (error) {
      console.error('Error creating program:', error);
      return null;
    }
  }, [provider]);

  return program;
}