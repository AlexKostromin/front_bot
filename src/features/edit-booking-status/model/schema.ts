import { z } from 'zod';

export const bookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  comment: z.string().max(500).optional(),
});

export type BookingStatusFormValues = z.infer<typeof bookingStatusSchema>;
