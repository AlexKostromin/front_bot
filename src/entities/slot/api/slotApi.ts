import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { SlotFilters } from '../model/types';

export const slotKeys = {
  all: ['slots'] as const,
  list: (filters: SlotFilters) => [...slotKeys.all, 'list', filters] as const,
  detail: (id: number) => [...slotKeys.all, 'detail', id] as const,
};

export function useSlots(filters: SlotFilters) {
  return useQuery({
    queryKey: slotKeys.list(filters),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/slots', {
        params: { query: filters },
      });
      if (error) throw error;
      return data!;
    },
  });
}

export function useCreateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      tutor_id: number;
      subject_id: number;
      class_group_id: number;
      slot_date: string;
      start_time: string;
      end_time: string;
    }) => {
      const { data, error } = await apiClient.POST('/api/admin/slots', { body });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: slotKeys.all }),
  });
}

export function useDeleteSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await apiClient.DELETE('/api/admin/slots/{id}', {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: slotKeys.all }),
  });
}
