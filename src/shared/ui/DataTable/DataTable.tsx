import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TablePagination,
  CircularProgress, Box, Typography,
} from '@mui/material';

interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: number | string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  total: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rpp: number) => void;
  getRowKey: (row: T) => string | number;
}

export function DataTable<T>({
  columns, rows, total, page, rowsPerPage,
  loading, onPageChange, onRowsPerPageChange, getRowKey,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rows.length) {
    return (
      <Box textAlign="center" py={6}>
        <Typography color="text.secondary">Данных нет</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={String(col.key)} width={col.width}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow
                key={getRowKey(row)}
                hover
                sx={{ '&:last-child td': { border: 0 } }}
              >
                {columns.map(col => (
                  <TableCell key={String(col.key)}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={e => onRowsPerPageChange(+e.target.value)}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="На странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
        sx={{
          '.MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-end' },
          },
        }}
      />
    </Paper>
  );
}
