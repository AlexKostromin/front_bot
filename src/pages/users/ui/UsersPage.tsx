import { useState, useCallback } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { DataTable } from '@/shared/ui/DataTable';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useUsers, useBlockUser, useUnblockUser } from '@/entities/user/api';
import toast from 'react-hot-toast';

interface User {
  ID: number;
  TgChatID: number;
  TgUsername: string;
  FullName: string;
  Phone: string;
  ClassNumber: number;
  ClassGroupID: number;
  IsActive: boolean;
  RegisteredAt: string;
}

export function UsersPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [action, setAction] = useState<'block' | 'unblock' | null>(null);

  const { data, isLoading } = useUsers({
    page: page + 1,
    limit,
    ...(search && { search }),
  });

  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const handleConfirm = useCallback(async () => {
    if (!selectedUserId || !action) return;
    try {
      if (action === 'block') {
        await blockUser.mutateAsync(selectedUserId);
        toast.success('Пользователь заблокирован');
      } else {
        await unblockUser.mutateAsync(selectedUserId);
        toast.success('Пользователь разблокирован');
      }
    } catch {
      toast.error('Ошибка при выполнении действия');
    } finally {
      setSelectedUserId(null);
      setAction(null);
    }
  }, [selectedUserId, action, blockUser, unblockUser]);

  const columns = [
    { key: 'FullName',     label: 'Имя' },
    { key: 'Phone',        label: 'Телефон' },
    { key: 'TgUsername',   label: 'Telegram' },
    { key: 'ClassNumber',  label: 'Класс' },
    {
      key: 'IsActive',
      label: 'Статус',
      render: (u: User) => (
        <Typography variant="body2" sx={{ color: u.IsActive ? 'success.main' : 'error.main' }}>
          {u.IsActive ? 'Активен' : 'Заблокирован'}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: 150,
      render: (u: User) => (
        <Button
          size="small"
          color={u.IsActive ? 'error' : 'success'}
          onClick={() => {
            setSelectedUserId(u.ID);
            setAction(u.IsActive ? 'block' : 'unblock');
          }}
        >
          {u.IsActive ? 'Заблокировать' : 'Разблокировать'}
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Пользователи</Typography>

      {/* Поиск */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Box
            component="input"
            type="text"
            placeholder="Поиск по имени или телефону..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            sx={{
              flex: 1,
              padding: '10px 15px',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              fontSize: '14px',
            }}
          />
        </Stack>
      </Box>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        rowsPerPage={limit}
        loading={isLoading}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
        getRowKey={u => u.ID}
      />

      {/* Подтверждение действия */}
      <ConfirmDialog
        open={selectedUserId !== null && action !== null}
        title={action === 'block' ? 'Заблокировать пользователя?' : 'Разблокировать пользователя?'}
        message={action === 'block'
          ? 'Пользователь не сможет пользоваться сервисом.'
          : 'Пользователь снова получит доступ к сервису.'
        }
        confirmLabel={action === 'block' ? 'Заблокировать' : 'Разблокировать'}
        onConfirm={handleConfirm}
        onClose={() => { setSelectedUserId(null); setAction(null); }}
        loading={blockUser.isPending || unblockUser.isPending}
      />
    </Box>
  );
}
