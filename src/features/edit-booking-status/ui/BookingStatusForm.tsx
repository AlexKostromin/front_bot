import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, MenuItem, Button, Stack } from '@mui/material';
import { bookingStatusSchema, type BookingStatusFormValues } from '../model/schema';
import type { Booking } from '@/entities/booking/model/types';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Ожидает подтверждения' },
  { value: 'confirmed', label: 'Подтверждено' },
  { value: 'cancelled', label: 'Отменено' },
  { value: 'completed', label: 'Завершено' },
];

export function BookingStatusForm({
  booking,
  onSubmit,
}: {
  booking: Booking;
  onSubmit: (values: BookingStatusFormValues) => Promise<void>;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<BookingStatusFormValues>({
      resolver: zodResolver(bookingStatusSchema),
      defaultValues: {
        status:  booking.status,
        comment: '',
      },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        <TextField
          select
          label="Статус"
          defaultValue={booking.status}
          error={!!errors.status}
          helperText={errors.status?.message}
          {...register('status')}
        >
          {STATUS_OPTIONS.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Комментарий"
          multiline
          rows={3}
          error={!!errors.comment}
          helperText={errors.comment?.message}
          {...register('comment')}
        />

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </Stack>
    </form>
  );
}
