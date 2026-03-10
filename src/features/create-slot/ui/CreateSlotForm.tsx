import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button, TextField, MenuItem, Stack, Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { createSlotSchema } from '../model/schema';
import { useTutors } from '@/entities/tutor/api';
import { useSubjects } from '@/entities/subject/api';
import { useClassGroups } from '@/entities/class-group/api';
import { useCreateSlot } from '../api/useCreateSlot';
import dayjs from 'dayjs';

interface Props {
  onSuccess: () => void;
}

export function CreateSlotForm({ onSuccess }: Props) {
  const { data: tutorsData } = useTutors({});
  const { data: subjectsData } = useSubjects({});
  const groups = useClassGroups();
  const createSlot = useCreateSlot();

  const tutors = (Array.isArray(tutorsData) ? tutorsData : tutorsData?.items ?? []) as any[];
  const subjects = (Array.isArray(subjectsData) ? subjectsData : subjectsData?.items ?? []) as any[];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(createSlotSchema),
  });

  const onSubmit: SubmitHandler<any> = async (values: any) => {
    try {
      await createSlot.mutateAsync(values);
      onSuccess();
    } catch {
      // ошибка отображается через createSlot.isError
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {createSlot.isError && (
          <Alert severity="error">Ошибка при создании слота</Alert>
        )}

        <TextField
          select
          label="Репетитор"
          error={!!errors.tutor_id}
          helperText={typeof errors.tutor_id?.message === 'string' ? errors.tutor_id.message : ''}
          defaultValue=""
          {...register('tutor_id')}
        >
          <MenuItem value="" disabled>Выберите...</MenuItem>
          {tutors.map(t => (
            <MenuItem key={t.id} value={t.id}>{t.full_name || t.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Предмет"
          error={!!errors.subject_id}
          helperText={typeof errors.subject_id?.message === 'string' ? errors.subject_id.message : ''}
          defaultValue=""
          {...register('subject_id')}
        >
          <MenuItem value="" disabled>Выберите...</MenuItem>
          {subjects.map(s => (
            <MenuItem key={s.ID ?? s.id} value={s.ID ?? s.id}>{s.Name || s.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Группа классов"
          error={!!errors.class_group_id}
          helperText={typeof errors.class_group_id?.message === 'string' ? errors.class_group_id.message : ''}
          defaultValue=""
          {...register('class_group_id')}
        >
          <MenuItem value="" disabled>Выберите...</MenuItem>
          {groups.map((g: any) => (
            <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
          ))}
        </TextField>

        <Controller
          name="slot_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Дата"
              value={field.value ? dayjs(field.value) : null}
              onChange={d => field.onChange(d?.format('YYYY-MM-DD') ?? '')}
              slotProps={{
                textField: {
                  error: !!errors.slot_date,
                  helperText: typeof errors.slot_date?.message === 'string' ? errors.slot_date.message : '',
                },
              }}
            />
          )}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            label="Начало (HH:MM)"
            placeholder="09:00"
            error={!!errors.start_time}
            helperText={typeof errors.start_time?.message === 'string' ? errors.start_time.message : ''}
            fullWidth
            {...register('start_time')}
          />
          <TextField
            label="Конец (HH:MM)"
            placeholder="10:30"
            error={!!errors.end_time}
            helperText={typeof errors.end_time?.message === 'string' ? errors.end_time.message : ''}
            fullWidth
            {...register('end_time')}
          />
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? 'Создание...' : 'Создать слот'}
        </Button>
      </Stack>
    </form>
  );
}
