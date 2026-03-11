import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DataTable } from '@/shared/ui/DataTable';
import { useSubjects } from '@/entities/subject/api';

export function SubjectsPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useSubjects({
    page: page + 1,
    limit,
  });

  const rows = (Array.isArray(data) ? data : data?.items ?? [])
    .slice()
    .sort((a: any, b: any) => (a.ID ?? a.id) - (b.ID ?? b.id));

  const columns = [
    { key: 'ID',   label: 'ID' },
    { key: 'Name', label: 'Название' },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" gutterBottom>Предметы</Typography>

      <DataTable
        columns={columns}
        rows={rows}
        total={rows.length}
        page={page}
        rowsPerPage={limit}
        loading={isLoading}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
        getRowKey={s => s.ID ?? s.id}
      />
    </Box>
  );
}
