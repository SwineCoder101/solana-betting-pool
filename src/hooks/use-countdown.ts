import { useQuery } from "@tanstack/react-query";

interface Countdown {
  remainingSeconds: number;
  minutes: number;
  seconds: number;
}

/**
 * Calculates the countdown based on start and end timestamps.
 * @param startTime Timestamp for when the session starts (in ms)
 * @param endTime Timestamp for when the session ends (in ms)
 */
export function useCountdown({ startTime, endTime }: { startTime: number; endTime: number }) {
  return useQuery<Countdown>({
    queryKey: ['countdown', startTime, endTime],
    queryFn: () => {
      const now = Date.now();
      // If the session hasn't started yet, use the start time as the effective start
      const effectiveStart = Math.max(now, startTime);
      const timeLeft = Math.max(0, endTime - effectiveStart);
      const remainingSeconds = Math.floor(timeLeft / 1000);
      return {
        remainingSeconds,
        minutes: Math.floor(remainingSeconds / 60),
        seconds: remainingSeconds % 60,
      };
    },
    // Automatically re-run the query every 1000ms (1 second) to update the countdown
    refetchInterval: 1000,
    // Provide initial data to avoid waiting for the first refetch
    initialData: (() => {
      const now = Date.now();
      const effectiveStart = Math.max(now, startTime);
      const timeLeft = Math.max(0, endTime - effectiveStart);
      const remainingSeconds = Math.floor(timeLeft / 1000);
      return {
        remainingSeconds,
        minutes: Math.floor(remainingSeconds / 60),
        seconds: remainingSeconds % 60,
      };
    })(),
  });
}
