import { useState } from 'react';
import {
  Box, Drawer, Typography, IconButton, TextField, MenuItem, Stack,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { DataTable } from '@/shared/ui/DataTable';
import { BookingStatusForm } from '@/features/edit-booking-status/ui/BookingStatusForm';
import { useBookings, useUpdateBookingStatus } from '@/entities/booking/api';
import { formatDate, formatTime } from '@/shared/lib/format';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { Booking } from '@/entities/booking/model/types';

export function BookingsPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useBookings({
    page: page + 1,
    limit,
    ...(status !== '' && { status }),
    ...(fromDate && { from_date: fromDate }),
    ...(toDate && { to_date: toDate }),
  });

  const updateStatus = useUpdateBookingStatus();

  const handleStatusUpdate = async (values: any) => {
    if (!selectedBooking) return;
    try {
      await updateStatus.mutateAsync({
        id: selectedBooking.id,
        status: values.status,
        comment: values.comment,
      });
      toast.success('Статус обновлён');
      setDrawerOpen(false);
      setSelectedBooking(null);
    } catch {
      toast.error('Не удалось обновить статус');
    }
  };

  const columns = [
    { key: 'user_name',    label: 'Ученик' },
    { key: 'user_phone',   label: 'Телефон' },
    { key: 'subject_name', label: 'Предмет' },
    {
      key: 'slot_date',
      label: 'Дата',
      render: (r: Booking) => formatDate(r.slot_date),
    },
    {
      key: 'time',
      label: 'Время',
      render: (r: Booking) => `${formatTime(r.start_time)} – ${formatTime(r.end_time)}`,
    },
    {
      key: 'status',
      label: 'Статус',
      render: (r: Booking) => {
        const map: Record<string, { label: string; color: string }> = {
          pending:   { label: 'Ожидает',      color: 'warning.main' },
          confirmed: { label: 'Подтверждено', color: 'success.main' },
          cancelled: { label: 'Отменено',     color: 'error.main' },
          completed: { label: 'Завершено',    color: 'info.main' },
        };
        const s = map[r.status] ?? { label: r.status, color: 'text.secondary' };
        return <Typography variant="body2" sx={{ color: s.color, fontWeight: 600 }}>{s.label}</Typography>;
      },
    },
    {
      key: 'actions',
      label: '',
      width: 50,
      render: (r: Booking) => (
        <IconButton
          size="small"
          onClick={() => {
            setSelectedBooking(r);
            setDrawerOpen(true);
          }}
        >
          <Edit fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Брони</Typography>

      {/* Фильтры */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
        <TextField
          select
          label="Статус"
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Все статусы</MenuItem>
          <MenuItem value="pending">Ожидает</MenuItem>
          <MenuItem value="confirmed">Подтверждено</MenuItem>
          <MenuItem value="cancelled">Отменено</MenuItem>
          <MenuItem value="completed">Завершено</MenuItem>
        </TextField>

        <DatePicker
          label="От даты"
          value={fromDate ? dayjs(fromDate) : null}
          onChange={d => { setFromDate(d?.format('YYYY-MM-DD') ?? ''); setPage(0); }}
          slotProps={{ textField: { size: 'small' } }}
        />

        <DatePicker
          label="До даты"
          value={toDate ? dayjs(toDate) : null}
          onChange={d => { setToDate(d?.format('YYYY-MM-DD') ?? ''); setPage(0); }}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Stack>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        rowsPerPage={limit}
        loading={isLoading}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
        getRowKey={r => r.id}
      />

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 400, p: 3 } }}
      >
        <Typography variant="h6" gutterBottom>Смена статуса брони</Typography>
        {selectedBooking && (
          <BookingStatusForm
            booking={selectedBooking}
            onSubmit={handleStatusUpdate}
          />
        )}
      </Drawer>
    </Box>
  );
}
