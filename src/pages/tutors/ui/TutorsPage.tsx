import { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Add } from '@mui/icons-material';
import { DataTable } from '@/shared/ui/DataTable';
import { useTutors } from '@/entities/tutor/api';
import { CreateTutorForm } from '@/features/create-tutor/ui/CreateTutorForm';

interface Tutor {
  id: number;
  full_name: string;
  created_at: string;
}

export function TutorsPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useTutors({
    page: page + 1,
    limit,
  });

  const columns = [
    { key: 'full_name', label: 'Имя' },
    {
      key: 'created_at',
      label: 'Дата создания',
      render: (t: Tutor) => new Date(t.created_at).toLocaleDateString('ru-RU'),
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Репетиторы</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Добавить репетитора
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={Array.isArray(data) ? data : data?.items ?? []}
        total={Array.isArray(data) ? data.length : data?.total ?? 0}
        page={page}
        rowsPerPage={limit}
        loading={isLoading}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
        getRowKey={t => t.id}
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новый репетитор</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <CreateTutorForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
