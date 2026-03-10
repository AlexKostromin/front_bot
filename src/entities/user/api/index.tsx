import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useUsers(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/users', {
        params: { query: filters },
      });
      if (error) throw error;
      return data!;
    },
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await apiClient.PATCH('/api/admin/users/{id}', {
        params: { path: { id } },
        body: { is_active: false },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await apiClient.PATCH('/api/admin/users/{id}', {
        params: { path: { id } },
        body: { is_active: true },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
