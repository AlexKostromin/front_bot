import { Chip, type ChipProps } from '@mui/material';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: ChipProps['color'] }> = {
  pending:   { label: 'Ожидает',       color: 'warning'  },
  confirmed: { label: 'Подтверждено', color: 'success'  },
  cancelled: { label: 'Отменено',     color: 'error'    },
  completed: { label: 'Завершено',    color: 'default'  },
};

export function StatusChip({ status }: { status: BookingStatus }) {
  const { label, color } = STATUS_CONFIG[status];
  return <Chip label={label} color={color} size="small" />;
}
