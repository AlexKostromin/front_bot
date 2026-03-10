import { z } from 'zod';

export const createTutorSchema = z.object({
  full_name:   z.string().min(1, 'Введите имя'),
  subject_ids: z.array(z.number()).min(1, 'Выберите хотя бы один предмет'),
});

export type CreateTutorFormValues = z.infer<typeof createTutorSchema>;