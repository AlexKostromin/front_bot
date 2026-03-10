import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useTutors(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: ['tutors', filters],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/tutors', {
        params: { query: filters },
      });
      if (error) throw error;
      return data!;
    },
  });
}

export function useCreateTutor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { full_name: string; subject_ids: number[] }) => {
      const { data, error } = await apiClient.POST('/api/admin/tutors', { body });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutors'] }),
  });
}
