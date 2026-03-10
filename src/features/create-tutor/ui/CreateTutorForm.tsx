import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button, TextField, Stack, Alert,
  Autocomplete, Chip,
} from '@mui/material';
import { createTutorSchema, type CreateTutorFormValues } from '../model/schema';
import { useCreateTutor } from '@/entities/tutor/api';
import { useSubjects } from '@/entities/subject/api';

interface Props {
  onSuccess: () => void;
}

export function CreateTutorForm({ onSuccess }: Props) {
  const { data: subjectsRaw } = useSubjects({ page: 1, limit: 100 });
  const subjects = (Array.isArray(subjectsRaw) ? subjectsRaw : subjectsRaw?.items ?? []) as any[];
  const createTutor = useCreateTutor();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateTutorFormValues>({
    resolver: zodResolver(createTutorSchema),
    defaultValues: { full_name: '', subject_ids: [] },
  });

  const onSubmit = async (values: CreateTutorFormValues) => {
    await createTutor.mutateAsync(values);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {createTutor.isError && (
          <Alert severity="error">Ошибка при создании репетитора</Alert>
        )}

        <TextField
          label="ФИО"
          error={!!errors.full_name}
          helperText={errors.full_name?.message}
          {...register('full_name')}
        />

        <Controller
          name="subject_ids"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={subjects}
              getOptionLabel={(o: any) => o.Name || o.name}
              value={subjects.filter((s: any) => field.value.includes(s.ID ?? s.id))}
              onChange={(_, selected) => field.onChange(selected.map((s: any) => s.ID ?? s.id))}
              renderTags={(value, getTagProps) =>
                value.map((option: any, index) => (
                  <Chip label={option.Name || option.name} size="small" {...getTagProps({ index })} key={option.ID ?? option.id} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Предметы"
                  error={!!errors.subject_ids}
                  helperText={errors.subject_ids?.message}
                />
              )}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? 'Создание...' : 'Создать репетитора'}
        </Button>
      </Stack>
    </form>
  );
}