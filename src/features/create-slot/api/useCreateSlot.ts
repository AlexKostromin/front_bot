import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { slotKeys } from '@/entities/slot/api/slotApi';

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
