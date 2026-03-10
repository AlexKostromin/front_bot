import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/stats');
      if (error) throw error;
      return data!;
    },
    refetchInterval: 60_000, // Автообновление раз в минуту
  });
}
