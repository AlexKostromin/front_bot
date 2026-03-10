import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

export const formatDate = (d?: string) => d ? dayjs(d).format('D MMM YYYY') : '—';
export const formatDateTime = (d?: string) => d ? dayjs(d).format('D MMM YYYY, HH:mm') : '—';
export const formatTime = (t?: string) => t ? t.slice(0, 5) : '—'; // "09:00:00" → "09:00"
