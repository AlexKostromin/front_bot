import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Stack, Alert, Box, Typography } from '@mui/material';
import { loginSchema } from '../model/schema';
import { apiClient } from '@/shared/api/client';
import toast from 'react-hot-toast';

export function LoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<any>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: any) => {
    try {
      const { data, error } = await apiClient.POST('/api/admin/login', {
        body: values,
      });
      if (error) {
        setError('root', { message: 'Неверные учётные данные' });
        return;
      }
      if (data?.token) {
        localStorage.setItem('admin_token', data.token);
        toast.success('Успешно вошли');
        navigate('/');
      }
    } catch {
      setError('root', { message: 'Ошибка при входе' });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: 4,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.06)',
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ mb: 1 }}>
          Вход
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Админ-панель для Telegram репетитора
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            {errors.root && (
              <Alert severity="error">{errors.root.message}</Alert>
            )}

            <TextField
              label="Имя пользователя"
              error={!!errors.username}
              helperText={typeof errors.username?.message === 'string' ? errors.username.message : ''}
              fullWidth
              autoFocus
              {...register('username')}
            />

            <TextField
              label="Пароль"
              type="password"
              error={!!errors.password}
              helperText={typeof errors.password?.message === 'string' ? errors.password.message : ''}
              fullWidth
              {...register('password')}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Вход...' : 'Войти'}
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
