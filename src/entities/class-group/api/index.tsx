import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useClassGroups() {
  const { data } = useQuery({
    queryKey: ['classGroups'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/class-groups');
      if (error) throw error;
      return data!;
    },
  });
  const items = Array.isArray(data) ? data : [];
  return items as Array<{ id: number; name: string }>;
}
