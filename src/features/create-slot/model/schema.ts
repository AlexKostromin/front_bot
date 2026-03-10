import { z } from 'zod';

export const createSlotSchema = z
  .object({
    tutor_id:       z.coerce.number().gt(0, 'Выберите репетитора'),
    subject_id:     z.coerce.number().gt(0, 'Выберите предмет'),
    class_group_id: z.coerce.number().gt(0, 'Выберите группу'),
    slot_date:      z.string().min(1, 'Выберите дату'),
    start_time:     z.string().regex(/^\d{2}:\d{2}$/, 'Формат: HH:MM'),
    end_time:       z.string().regex(/^\d{2}:\d{2}$/, 'Формат: HH:MM'),
  })
  .refine(data => data.end_time > data.start_time, {
    message: 'Время окончания должно быть позже начала',
    path: ['end_time'],
  });

export type CreateSlotFormValues = z.infer<typeof createSlotSchema>;
