import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useSubjects(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: ['subjects', filters],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/subjects', {
        params: { query: filters },
      });
      if (error) throw error;
      return data!;
    },
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; class_group_id: number }) => {
      const { data, error } = await apiClient.POST('/api/admin/subjects', { body });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  });
}
