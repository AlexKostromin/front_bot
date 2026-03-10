import { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, IconButton, Card, CardContent,
  TextField, MenuItem, Stack, Chip, CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Delete, AccessTime, Person, MenuBook } from '@mui/icons-material';
import dayjs from 'dayjs';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useSlots, useDeleteSlot } from '@/entities/slot/api/slotApi';
import { useBookings } from '@/entities/booking/api';
import { formatDate, formatTime } from '@/shared/lib/format';
import { useSubjects } from '@/entities/subject/api';
import toast from 'react-hot-toast';
import type { Slot } from '@/entities/slot/model/types';

function useAllSlots(filters: { date: string; available?: boolean }) {
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const query = useSlots({
    page,
    limit: 20,
    date: filters.date,
    ...(filters.available !== undefined && { available: filters.available }),
  });

  useEffect(() => {
    setAllSlots([]);
    setPage(1);
    setLoading(true);
  }, [filters.date, filters.available]);

  useEffect(() => {
    if (!query.data) return;
    const items = (query.data.items ?? []) as Slot[];
    setAllSlots(prev => {
      const ids = new Set(prev.map(s => s.ID));
      return [...prev, ...items.filter(s => !ids.has(s.ID))];
    });
    const total = (query.data as any).total ?? 0;
    if (page * 20 < total) {
      setPage(p => p + 1);
    } else {
      setLoading(false);
    }
  }, [query.data, page]);

  return { slots: allSlots, isLoading: loading };
}

export function SlotsPage() {
  const [available, setAvailable] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: subjectsData } = useSubjects({});
  const { data: bookingsData } = useBookings({ page: 1, limit: 100 });

  const subjects = (Array.isArray(subjectsData) ? subjectsData : subjectsData?.items ?? []) as any[];
  const bookings = (bookingsData?.items ?? []) as any[];

  const subjectName = (id: number) => {
    const s = subjects.find(s => (s.ID ?? s.id) === id);
    return s?.Name || s?.name || `#${id}`;
  };

  const bookingBySlotId = useMemo(() => {
    const map: Record<number, any> = {};
    bookings.forEach(b => { map[b.slot_id] = b; });
    return map;
  }, [bookings]);

  const { slots, isLoading } = useAllSlots({
    date: dateFilter,
    ...(available !== '' && { available: available === 'true' }),
  });

  const deleteSlot = useDeleteSlot();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSlot.mutateAsync(deleteId);
      toast.success('Слот удалён');
    } catch {
      toast.error('Не удалось удалить слот');
    } finally {
      setDeleteId(null);
    }
  };

  // Группировка: дата → время → слоты
  const grouped = useMemo(() => {
    const dateMap: Record<string, Record<string, Slot[]>> = {};
    slots.forEach(s => {
      const date = s.SlotDate?.split('T')[0] ?? 'unknown';
      const time = `${formatTime(s.StartTime)} – ${formatTime(s.EndTime)}`;
      if (!dateMap[date]) dateMap[date] = {};
      if (!dateMap[date][time]) dateMap[date][time] = [];
      dateMap[date][time].push(s);
    });
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, times]) => ({
        date,
        times: Object.entries(times).sort(([a], [b]) => a.localeCompare(b)),
      }));
  }, [slots]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3}>Временные слоты</Typography>

      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        <DatePicker
          label="Дата"
          value={dateFilter ? dayjs(dateFilter) : null}
          onChange={d => { setDateFilter(d?.format('YYYY-MM-DD') ?? ''); }}
          slotProps={{ textField: { size: 'small' } }}
        />

        <TextField
          select label="Доступность" value={available}
          onChange={e => { setAvailable(e.target.value); }}
          size="small" sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="true">Свободные</MenuItem>
          <MenuItem value="false">Занятые</MenuItem>
        </TextField>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : grouped.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">Слотов нет</Typography>
        </Box>
      ) : (
        grouped.map(({ date, times }) => (
          <Box key={date} mb={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {formatDate(date)}
            </Typography>
            <Stack spacing={2}>
              {times.map(([time, timeSlots]) => (
                <Card key={time} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ pb: '12px !important' }}>
                    {(() => {
                      const bookedSlots = timeSlots.filter(s => !s.IsAvailable);
                      const freeSlots = timeSlots.filter(s => s.IsAvailable);
                      const allFree = bookedSlots.length === 0;
                      const bookedWithInfo = bookedSlots
                        .map(s => bookingBySlotId[s.ID])
                        .filter(Boolean);

                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <AccessTime sx={{ fontSize: 22, color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight={700}>{time}</Typography>
                            {bookedWithInfo.map((booking: any) => (
                              <Box key={booking.id} display="flex" alignItems="center" gap={0.5}>
                                <Chip
                                  icon={<Person sx={{ fontSize: '16px !important' }} />}
                                  label={booking.user_name}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip
                                  icon={<MenuBook sx={{ fontSize: '16px !important' }} />}
                                  label={booking.subject_name}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            ))}
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={allFree ? 'Свободен' : 'Занят'}
                              size="small"
                              color={allFree ? 'success' : 'error'}
                            />
                            {allFree && (
                              <IconButton size="small" color="error" onClick={() => setDeleteId(freeSlots[0]?.ID)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      );
                    })()}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        ))
      )}


      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить слот?"
        message="Это действие нельзя отменить. Слот будет удалён безвозвратно."
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
        loading={deleteSlot.isPending}
      />
    </Box>
  );
}
