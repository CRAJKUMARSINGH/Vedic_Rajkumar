import { useQuery } from '@tanstack/react-query';
import { transitService, type NatalChart } from '@/services/transits/transitService';

export const useTransits = (natal: NatalChart | null, asOf: Date) =>
  useQuery({
    queryKey: ['transits', natal?.lagnaSign, natal?.planets, asOf.toISOString().slice(0, 13)],
    queryFn: () => transitService.snapshot(natal!, asOf),
    enabled: !!natal,
    staleTime: 1000 * 60 * 30,
  });
