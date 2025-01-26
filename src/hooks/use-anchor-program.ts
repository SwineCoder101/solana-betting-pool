import { useAnchorProviderWithPrivy } from '@/components/hooks/useAnchorProviderWithPrivy';
import { Program } from '@coral-xyz/anchor';
import { IDL } from '../../anchor/sdk/src';
import { HorseRace } from '../../anchor/target/types/horse_race';

export function useAnchorProgram() {
  const {provider} = useAnchorProviderWithPrivy();
  return new Program<HorseRace>(
    IDL,
    provider,
  );
}