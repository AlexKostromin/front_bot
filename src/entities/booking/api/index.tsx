import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useBookings(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/bookings', {
        params: { query: filters },
      });
      if (error) throw error;
      return data!;
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, comment }: { id: number; status: string; comment?: string }) => {
      const { error } = await apiClient.PATCH('/api/admin/bookings/{id}/status', {
        params: { path: { id } },
        body: { status, comment },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
