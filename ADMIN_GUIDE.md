# Админ-панель для Telegram-бота: итеративная разработка

> **Как читать этот гайд.** Каждая итерация — это рабочее состояние проекта. После каждой итерации у вас на руках работающая программа, которую можно запустить и потрогать руками. Следующая итерация добавляет новый слой функциональности поверх. Такой подход позволяет увидеть результат на каждом шаге и не потерять мотивацию.

---

## Контекст задачи

В [GUIDE_ITERATIVE](GUIDE_ITERATIVE%20(1).md) мы построили Telegram-бота и REST API (итерация 11). Теперь строим React-админку, которая будет обращаться к этим API-ручкам.

**Стек:** React + TypeScript + react-hook-form + Zod + Material UI + SCSS + FSD

**Что мы строим:**

| Раздел | Что можно делать |
|---|---|
| **Dashboard** | Статистика: брони сегодня, всего слотов, активных учеников |
| **Пользователи** | Просмотр, фильтрация, блокировка учеников |
| **Слоты** | Создание, редактирование, удаление временных слотов |
| **Брони** | Список броней, смена статусов, отмена |
| **Репетиторы** | Управление репетиторами, их предметами и группами |
| **Предметы** | Создание предметов, привязка к группе классов |

---

## Итерация 0. Инициализация проекта

> **Цель:** создать скелет React-приложения с FSD-структурой, настроить сборку и зависимости.

### Создание проекта и установка зависимостей

```bash
npm create vite@latest admin-panel -- --template react-ts
cd admin-panel

# Основные зависимости
npm install \
  @mui/material @mui/icons-material @emotion/react @emotion/styled \
  @mui/x-date-pickers \
  react-hook-form @hookform/resolvers zod \
  @tanstack/react-query \
  openapi-fetch \
  react-router-dom \
  sass \
  recharts \
  react-hot-toast \
  dayjs

# Dev-зависимости
npm install -D \
  openapi-typescript \
  @types/node \
  vite-tsconfig-paths
```

### vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  css: {
    preprocessorOptions: {
      scss: {
        // Глобальные переменные и миксины доступны в каждом .scss файле
        additionalData: `@use "src/app/styles/variables" as *;`,
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

### tsconfig.json — алиасы путей

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Структура проекта по FSD

Feature-Sliced Design делит проект на слои с явными правилами зависимостей: слой может импортировать только из слоёв **ниже** себя.

```
src/
├── app/                    # Слой 6: инициализация, провайдеры, роутинг
│   ├── providers/
│   │   ├── ThemeProvider.tsx
│   │   ├── RouterProvider.tsx
│   │   └── QueryProvider.tsx
│   ├── styles/
│   │   ├── global.scss
│   │   └── variables.scss
│   └── index.tsx
│
├── pages/                  # Слой 5: страницы (композиция виджетов)
│   ├── dashboard/
│   ├── users/
│   ├── slots/
│   ├── bookings/
│   ├── tutors/
│   └── login/
│
├── widgets/                # Слой 4: крупные независимые блоки UI
│   ├── Sidebar/
│   ├── Header/
│   ├── StatsCards/
│   └── Layout/
│
├── features/               # Слой 3: бизнес-действия (формы, фильтры)
│   ├── create-slot/
│   ├── edit-booking-status/
│   ├── manage-tutor/
│   ├── filter-users/
│   └── auth/
│
├── entities/               # Слой 2: бизнес-сущности
│   ├── slot/
│   ├── booking/
│   ├── user/
│   ├── tutor/
│   └── subject/
│
└── shared/                 # Слой 1: переиспользуемое, без бизнес-логики
    ├── api/                # Сгенерированный клиент
    ├── ui/                 # Базовые UI-компоненты
    ├── lib/                # Хелперы: formatDate, formatTime
    └── config/             # ENV-переменные
```

**Правило зависимостей:**
- `pages` → `widgets` → `features` → `entities` → `shared`
- Каждый слой экспортирует публичный API через `index.tsx`
- Импорты внутри слоя — только через `index.tsx` соседнего сегмента

**Проверка:** `npm run dev` открывает пустую страницу на `http://localhost:5173` без ошибок в консоли.

---

## Итерация 1. Тема, глобальные стили, Layout

> **Цель:** настроить SCSS-переменные, MUI ThemeProvider с переключением light/dark, Layout с сайдбаром.

### SCSS-переменные

```scss
// src/app/styles/variables.scss

// Цветовая палитра
$color-primary:       #6C63FF;   // Индиго-фиолетовый — основной акцент
$color-primary-light: #9C94FF;
$color-primary-dark:  #4A42CC;

$color-success:  #22C55E;
$color-warning:  #F59E0B;
$color-error:    #EF4444;
$color-info:     #3B82F6;

// Фоны (light)
$bg-default:  #F8FAFC;
$bg-paper:    #FFFFFF;
$bg-sidebar:  #1E1E2E;   // Тёмный сайдбар на светлой теме

// Типографика
$font-family: 'Inter', 'Roboto', sans-serif;
$font-size-xs: 0.75rem;
$font-size-sm: 0.875rem;
$font-size-md: 1rem;
$font-size-lg: 1.125rem;
$font-size-xl: 1.25rem;

// Размеры
$sidebar-width:         260px;
$sidebar-collapsed:     72px;
$header-height:         64px;
$border-radius-sm:      8px;
$border-radius-md:      12px;
$border-radius-lg:      16px;

// Тени
$shadow-card:   0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.06);
$shadow-dialog: 0 8px 40px rgba(0,0,0,.18);

// Переходы
$transition-fast:   150ms ease;
$transition-normal: 250ms ease;
```

### MUI-тема с переключением light/dark

```ts
// src/app/providers/ThemeProvider.tsx

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { useMemo, useState, createContext, useContext } from 'react';

const ColorModeContext = createContext({ toggle: () => {} });
export const useColorMode = () => useContext(ColorModeContext);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary:   { main: '#6C63FF', light: '#9C94FF', dark: '#4A42CC' },
          success:   { main: '#22C55E' },
          warning:   { main: '#F59E0B' },
          error:     { main: '#EF4444' },
          background: {
            default: mode === 'light' ? '#F8FAFC' : '#0F0F1A',
            paper:   mode === 'light' ? '#FFFFFF'  : '#1A1A2E',
          },
        },
        typography: {
          fontFamily: "'Inter', 'Roboto', sans-serif",
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 10,
                padding: '8px 20px',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: '0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.06)',
                borderRadius: 16,
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                '& .MuiTableCell-root': {
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: mode === 'light' ? '#64748B' : '#94A3B8',
                  backgroundColor: mode === 'light' ? '#F1F5F9' : '#1E293B',
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { fontWeight: 600, borderRadius: 8 },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ toggle: () => setMode(m => m === 'light' ? 'dark' : 'light') }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
```

### Layout

```tsx
// src/widgets/Layout/Layout.tsx

import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/widgets/Sidebar';
import { Header }  from '@/widgets/Header';

export function Layout() {
  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar />
      <Box display="flex" flexDirection="column" flex={1} overflow="hidden">
        <Header />
        <Box component="main" flex={1} overflow="auto" bgcolor="background.default">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
```

### Sidebar

```tsx
// src/widgets/Sidebar/Sidebar.tsx

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Tooltip, Divider, Box, Typography, IconButton,
} from '@mui/material';
import {
  Dashboard, People, CalendarMonth, BookOnline,
  School, Subject, ChevronLeft, ChevronRight,
} from '@mui/icons-material';
import styles from './Sidebar.module.scss';

const NAV_ITEMS = [
  { path: '/',          icon: <Dashboard />,     label: 'Дашборд' },
  { path: '/users',     icon: <People />,        label: 'Пользователи' },
  { path: '/slots',     icon: <CalendarMonth />, label: 'Слоты' },
  { path: '/bookings',  icon: <BookOnline />,    label: 'Брони' },
  { path: '/tutors',    icon: <School />,        label: 'Репетиторы' },
  { path: '/subjects',  icon: <Subject />,       label: 'Предметы' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const width = collapsed ? 72 : 260;

  return (
    <Drawer
      variant="permanent"
      PaperProps={{
        className: styles.sidebar,
        sx: { width, transition: 'width 0.2s ease', overflow: 'hidden' },
      }}
    >
      {/* Лого */}
      <Box className={styles.logoArea} sx={{ width }}>
        {!collapsed && (
          <Typography variant="h6" className={styles.logoText}>
            Репетитор Admin
          </Typography>
        )}
        <IconButton onClick={() => setCollapsed(c => !c)} size="small">
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ px: collapsed ? 0.5 : 1, py: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  selected={active}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: '#fff',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: collapsed ? 0 : 36, color: active ? 'inherit' : 'text.secondary' }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: active ? 600 : 400 }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
```

```scss
// src/widgets/Sidebar/Sidebar.module.scss

.sidebar {
  background-color: #1E1E2E !important;
  color: #CBD5E1 !important;
  border-right: none !important;

  :global(.MuiListItemIcon-root) {
    color: #94A3B8;
  }
}

.logoArea {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  min-height: 64px;

  :global(.MuiIconButton-root) {
    color: #94A3B8;
  }
}

.logoText {
  color: #F1F5F9;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
}
```

**Проверка:** видим тёмный сайдбар слева с иконками навигации и пустую область контента справа. Кнопка сворачивания сайдбара работает.

---

## Итерация 2. API-клиент и автогенерация типов

> **Цель:** подключить типобезопасный API-клиент, сгенерировать типы из Swagger-схемы Go-сервера.

### Скрипт генерации типов

Добавить в `package.json`:

```json
{
  "scripts": {
    "generate:api": "openapi-typescript http://localhost:8080/swagger/doc.json -o src/shared/api/schema.d.ts"
  }
}
```

```bash
npm run generate:api
```

Это создаёт файл `src/shared/api/schema.d.ts` с типами всех запросов и ответов из Swagger-схемы Go-сервера (итерация 11 GUIDE_ITERATIVE).

### API-клиент с JWT-интерцептором

```ts
// src/shared/api/client.ts

import createClient from 'openapi-fetch';
import type { paths } from './schema';

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
});

// Интерцептор для JWT
apiClient.use({
  onRequest({ request }) {
    const token = localStorage.getItem('admin_token');
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
  onResponse({ response }) {
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return response;
  },
});
```

### Использование в коде

```ts
// Типобезопасный запрос — IDE подскажет параметры и тип ответа
const { data, error } = await apiClient.GET('/api/admin/slots', {
  params: {
    query: { page: 1, limit: 20, available: true },
  },
});

// data автоматически типизирован как SlotListResponse
console.log(data?.items);
```

**Проверка:** `npm run generate:api` создаёт файл `src/shared/api/schema.d.ts` с типами. Импорт `paths` из `schema.d.ts` работает без ошибок TypeScript.

---

## Итерация 3. Shared UI-компоненты

> **Цель:** создать переиспользуемые компоненты: DataTable, StatusChip, ConfirmDialog, хелперы форматирования.

### StatusChip — цветной бейдж статуса брони

```tsx
// src/shared/ui/StatusChip/StatusChip.tsx

import { Chip, ChipProps } from '@mui/material';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: ChipProps['color'] }> = {
  pending:   { label: 'Ожидает',    color: 'warning'  },
  confirmed: { label: 'Подтверждено', color: 'success' },
  cancelled: { label: 'Отменено',   color: 'error'    },
  completed: { label: 'Завершено',  color: 'default'  },
};

export function StatusChip({ status }: { status: BookingStatus }) {
  const { label, color } = STATUS_CONFIG[status];
  return <Chip label={label} color={color} size="small" />;
}
```

### DataTable — переиспользуемая таблица

```tsx
// src/shared/ui/DataTable/DataTable.tsx

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
      />
    </Paper>
  );
}
```

### ConfirmDialog

```tsx
// src/shared/ui/ConfirmDialog/ConfirmDialog.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Удалить',
  onConfirm, onClose, loading,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### Хелперы форматирования

```ts
// src/shared/lib/format.ts

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

export const formatDate = (d: string) => dayjs(d).format('D MMM YYYY');
export const formatDateTime = (d: string) => dayjs(d).format('D MMM YYYY, HH:mm');
export const formatTime = (t: string) => t.slice(0, 5); // "09:00:00" → "09:00"
```

**Проверка:** компоненты рендерятся с мок-данными. `DataTable` показывает пустое состояние, `StatusChip` отображает цветные бейджи для каждого статуса, `ConfirmDialog` открывается и закрывается.

---

## Итерация 4. Dashboard

> **Цель:** создать страницу дашборда с карточками-метриками и графиком бронирований.

### Хук для статистики

```ts
// src/entities/stats/api/index.tsx

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/stats');
      if (error) throw error;
      return data!;
    },
    refetchInterval: 60_000, // Автообновление раз в минуту
  });
}
```

### Страница Dashboard

```tsx
// src/pages/dashboard/ui/DashboardPage.tsx

import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { TrendingUp, People, CalendarToday, CheckCircle } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStats } from '@/entities/stats/api';
import styles from './DashboardPage.module.scss';

export function DashboardPage() {
  const { data: stats, isLoading } = useStats();

  const STAT_CARDS = [
    { label: 'Брони сегодня', value: stats?.bookings_today,   icon: <CalendarToday />, color: '#6C63FF' },
    { label: 'Всего броней',  value: stats?.bookings_total,   icon: <TrendingUp />,    color: '#22C55E' },
    { label: 'Учеников',      value: stats?.users_total,      icon: <People />,        color: '#3B82F6' },
    { label: 'Подтверждено',  value: stats?.confirmed_total,  icon: <CheckCircle />,   color: '#F59E0B' },
  ];

  return (
    <div className={styles.page}>
      <Typography variant="h4" gutterBottom>Дашборд</Typography>

      {/* Карточки-метрики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STAT_CARDS.map(card => (
          <Grid item xs={12} sm={6} xl={3} key={card.label}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.label}
                    </Typography>
                    {isLoading ? (
                      <Skeleton width={60} height={40} />
                    ) : (
                      <Typography variant="h4" fontWeight={700}>
                        {card.value ?? 0}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: card.color + '18',
                      color: card.color,
                      display: 'flex',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* График броней за последние 7 дней */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Брони за последние 7 дней</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats?.bookings_chart ?? []}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                name="Броней"
                stroke="#6C63FF"
                strokeWidth={2.5}
                fill="url(#grad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
```

```scss
// src/pages/dashboard/ui/DashboardPage.module.scss

.page {
  padding: 32px;
  max-width: 1400px;
}
```

**Проверка:** дашборд показывает 4 карточки с цифрами из API (`GET /api/admin/stats`) и график бронирований за 7 дней. Данные обновляются автоматически каждые 60 секунд.

---

## Итерация 5. Страница записей учеников (Bookings)

> **Цель:** таблица бронирований с фильтрами и сменой статуса через Drawer.

### Entities: типы и хук

```ts
// src/entities/booking/model/types.ts

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  slot_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  status: BookingStatus;
  comment?: string;
  booked_at: string;
}
```

```ts
// src/entities/booking/api/index.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useBookings(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/bookings', {
        params: { query: filters },
      });
      if (error) throw error;
      return data!;
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, comment }: { id: number; status: string; comment?: string }) => {
      const { error } = await apiClient.PATCH('/api/admin/bookings/{id}/status', {
        params: { path: { id } },
        body: { status, comment },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
```

### Features: форма смены статуса

```ts
// src/features/edit-booking-status/model/schema.ts

import { z } from 'zod';

export const bookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed'], {
    required_error: 'Выберите статус',
  }),
  comment: z.string().max(500).optional(),
});

export type BookingStatusFormValues = z.infer<typeof bookingStatusSchema>;
```

```tsx
// src/features/edit-booking-status/ui/BookingStatusForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, MenuItem, Button, Stack } from '@mui/material';
import { bookingStatusSchema, BookingStatusFormValues } from '../model/schema';
import type { Booking } from '@/entities/booking/model/types';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Ожидает подтверждения' },
  { value: 'confirmed', label: 'Подтверждено' },
  { value: 'cancelled', label: 'Отменено' },
  { value: 'completed', label: 'Завершено' },
];

export function BookingStatusForm({
  booking,
  onSubmit,
}: {
  booking: Booking;
  onSubmit: (values: BookingStatusFormValues) => Promise<void>;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<BookingStatusFormValues>({
      resolver: zodResolver(bookingStatusSchema),
      defaultValues: {
        status:  booking.status,
        comment: booking.comment ?? '',
      },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        <TextField
          select
          label="Статус"
          defaultValue={booking.status}
          error={!!errors.status}
          helperText={errors.status?.message}
          {...register('status')}
        >
          {STATUS_OPTIONS.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Комментарий"
          multiline
          rows={3}
          error={!!errors.comment}
          helperText={errors.comment?.message}
          {...register('comment')}
        />

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </Stack>
    </form>
  );
}
```

**Проверка:** видим таблицу записей с пагинацией, фильтры по статусу и дате работают. При клике на запись открывается Drawer с формой смены статуса. После сохранения таблица обновляется.

---

## Итерация 6. Страница слотов

> **Цель:** таблица слотов с фильтрами, создание и удаление.

### Entities: типы и хуки

```ts
// src/entities/slot/model/types.ts

export interface Slot {
  id: number;
  tutor_id: number;
  tutor_name: string;
  subject_id: number;
  subject_name: string;
  class_group_id: number;
  group_name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface SlotFilters {
  date?: string;
  group_id?: number;
  available?: boolean;
  page: number;
  limit: number;
}
```

```ts
// src/entities/slot/api/slotApi.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { SlotFilters } from '../model/types';

export const slotKeys = {
  all: ['slots'] as const,
  list: (filters: SlotFilters) => [...slotKeys.all, 'list', filters] as const,
  detail: (id: number) => [...slotKeys.all, 'detail', id] as const,
};

export function useSlots(filters: SlotFilters) {
  return useQuery({
    queryKey: slotKeys.list(filters),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/slots', {
        params: { query: filters },
      });
      if (error) throw error;
      return data!;
    },
  });
}

export function useDeleteSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await apiClient.DELETE('/api/admin/slots/{id}', {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: slotKeys.all }),
  });
}
```

### Features: форма создания слота (react-hook-form + Zod)

```ts
// src/features/create-slot/model/schema.ts

import { z } from 'zod';

export const createSlotSchema = z
  .object({
    // z.coerce.number() корректно конвертирует строковое значение из
    // MUI Select в число, в отличие от z.number() + valueAsNumber
    tutor_id:       z.coerce.number({ invalid_type_error: 'Выберите репетитора' }).gt(0, 'Выберите репетитора'),
    subject_id:     z.coerce.number({ invalid_type_error: 'Выберите предмет' }).gt(0, 'Выберите предмет'),
    class_group_id: z.coerce.number({ invalid_type_error: 'Выберите группу' }).gt(0, 'Выберите группу'),
    slot_date:      z.string().min(1, 'Выберите дату'),
    start_time:     z.string().regex(/^\d{2}:\d{2}$/, 'Формат: HH:MM'),
    end_time:       z.string().regex(/^\d{2}:\d{2}$/, 'Формат: HH:MM'),
  })
  .refine(data => data.end_time > data.start_time, {
    message: 'Время окончания должно быть позже начала',
    path: ['end_time'],
  });

export type CreateSlotFormValues = z.infer<typeof createSlotSchema>;
```

```ts
// src/features/create-slot/api/useCreateSlot.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { CreateSlotFormValues } from '../model/schema';

export function useCreateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: CreateSlotFormValues) => {
      const { data, error } = await apiClient.POST('/api/admin/slots', {
        body: values,
      });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots'] }),
  });
}
```

```tsx
// src/features/create-slot/ui/CreateSlotForm.tsx

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button, TextField, MenuItem, Stack, Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { createSlotSchema, CreateSlotFormValues } from '../model/schema';
import { useTutors } from '@/entities/tutor/api';
import { useSubjects } from '@/entities/subject/api';
import { useClassGroups } from '@/entities/class-group/api';
import { useCreateSlot } from '../api/useCreateSlot';
import dayjs from 'dayjs';

interface Props {
  onSuccess: () => void;
}

export function CreateSlotForm({ onSuccess }: Props) {
  const { data: tutors } = useTutors();
  const { data: subjects } = useSubjects();
  const { data: groups } = useClassGroups();
  const createSlot = useCreateSlot();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateSlotFormValues>({
    resolver: zodResolver(createSlotSchema),
  });

  const onSubmit = async (values: CreateSlotFormValues) => {
    await createSlot.mutateAsync(values);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {createSlot.isError && (
          <Alert severity="error">Ошибка при создании слота</Alert>
        )}

        <TextField
          select
          label="Репетитор"
          error={!!errors.tutor_id}
          helperText={errors.tutor_id?.message}
          defaultValue=""
          {...register('tutor_id')}
        >
          <MenuItem value="" disabled>Выберите...</MenuItem>
          {tutors?.items.map(t => (
            <MenuItem key={t.id} value={t.id}>{t.full_name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Предмет"
          error={!!errors.subject_id}
          helperText={errors.subject_id?.message}
          defaultValue=""
          {...register('subject_id')}
        >
          <MenuItem value="" disabled>Выберите...</MenuItem>
          {subjects?.items.map(s => (
            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Группа классов"
          error={!!errors.class_group_id}
          helperText={errors.class_group_id?.message}
          defaultValue=""
          {...register('class_group_id')}
        >
          <MenuItem value="" disabled>Выберите...</MenuItem>
          {groups?.map(g => (
            <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
          ))}
        </TextField>

        <Controller
          name="slot_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Дата"
              value={field.value ? dayjs(field.value) : null}
              onChange={d => field.onChange(d?.format('YYYY-MM-DD') ?? '')}
              slotProps={{
                textField: {
                  error: !!errors.slot_date,
                  helperText: errors.slot_date?.message,
                },
              }}
            />
          )}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            label="Начало (HH:MM)"
            placeholder="09:00"
            error={!!errors.start_time}
            helperText={errors.start_time?.message}
            fullWidth
            {...register('start_time')}
          />
          <TextField
            label="Конец (HH:MM)"
            placeholder="10:30"
            error={!!errors.end_time}
            helperText={errors.end_time?.message}
            fullWidth
            {...register('end_time')}
          />
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? 'Создание...' : 'Создать слот'}
        </Button>
      </Stack>
    </form>
  );
}
```

### Страница слотов

```tsx
// src/pages/slots/ui/SlotsPage.tsx

import { useState } from 'react';
import {
  Box, Button, Drawer, Typography, IconButton,
  TextField, MenuItem, Stack,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { DataTable } from '@/shared/ui/DataTable';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { CreateSlotForm } from '@/features/create-slot/ui/CreateSlotForm';
import { useSlots, useDeleteSlot } from '@/entities/slot/api';
import { formatDate, formatTime } from '@/shared/lib/format';
import { useClassGroups } from '@/entities/class-group/api';
import toast from 'react-hot-toast';
import type { Slot } from '@/entities/slot/model/types';
import styles from './SlotsPage.module.scss';

export function SlotsPage() {
  const [page, setPage]             = useState(0);
  const [limit, setLimit]           = useState(20);
  const [groupId, setGroupId]       = useState<string>('');
  const [available, setAvailable]   = useState<string>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);

  const { data: groups } = useClassGroups();
  const { data, isLoading } = useSlots({
    page: page + 1,
    limit,
    ...(groupId   !== '' && { group_id: Number(groupId) }),
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

  const columns = [
    { key: 'slot_date',     label: 'Дата',      render: (r: Slot) => formatDate(r.slot_date) },
    {
      key: 'time',
      label: 'Время',
      render: (r: Slot) => `${formatTime(r.start_time)} – ${formatTime(r.end_time)}`,
    },
    { key: 'subject_name',  label: 'Предмет'  },
    { key: 'group_name',    label: 'Группа'   },
    { key: 'tutor_name',    label: 'Репетитор' },
    {
      key: 'is_available',
      label: 'Статус',
      render: (r: Slot) => (
        <Typography
          variant="body2"
          sx={{ color: r.is_available ? 'success.main' : 'error.main', fontWeight: 600 }}
        >
          {r.is_available ? 'Свободен' : 'Занят'}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: 100,
      render: (r: Slot) => (
        <IconButton
          size="small"
          color="error"
          disabled={!r.is_available}
          onClick={() => setDeleteId(r.id)}
        >
          <Delete fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      {/* Заголовок */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Временные слоты</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
        >
          Добавить слот
        </Button>
      </Box>

      {/* Фильтры */}
      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          select
          label="Группа классов"
          value={groupId}
          onChange={e => { setGroupId(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Все группы</MenuItem>
          {groups?.map(g => (
            <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Доступность"
          value={available}
          onChange={e => { setAvailable(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="true">Свободные</MenuItem>
          <MenuItem value="false">Занятые</MenuItem>
        </TextField>
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

      {/* Drawer создания слота */}
      <Drawer
        anchor="right"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        PaperProps={{ sx: { width: 420, p: 3 } }}
      >
        <Typography variant="h6" gutterBottom>Новый слот</Typography>
        <CreateSlotForm onSuccess={() => { setCreateOpen(false); toast.success('Слот создан'); }} />
      </Drawer>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить слот?"
        message="Это действие нельзя отменить. Слот будет удалён безвозвратно."
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
        loading={deleteSlot.isPending}
      />
    </div>
  );
}
```

**Проверка:** создаём слот через Drawer-форму — он появляется в таблице. Фильтры по группе и доступности работают. Удаление слота с подтверждением работает (только для свободных слотов).

---

## Итерация 7. Страница пользователей

> **Цель:** таблица пользователей с поиском, пагинацией и блокировкой/разблокировкой.

### Хуки сущностей

```ts
// src/entities/user/api/index.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useUsers(params: { search?: string; page: number; limit: number }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/users', {
        params: { query: params },
      });
      if (error) throw error;
      return data!;
    },
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const { error } = await apiClient.PATCH('/api/admin/users/{id}', {
        params: { path: { id } },
        body: { is_active: isActive },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
```

### Страница пользователей

Страница включает:
- Поиск по имени/телефону через `TextField` с debounce
- Таблицу с колонками: имя, телефон, класс, группа, статус, действия
- Кнопку блокировки/разблокировки с `ConfirmDialog`
- Пагинацию через `DataTable`

**Проверка:** видим учеников из API, поиск фильтрует в реальном времени. Кнопка блокировки меняет `is_active` через `PATCH /api/admin/users/{id}`.

---

## Итерация 8. Репетиторы и предметы

> **Цель:** CRUD-страницы для репетиторов и предметов.

### Хуки для репетиторов

```ts
// src/entities/tutor/api/index.tsx

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useTutors() {
  return useQuery({
    queryKey: ['tutors'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/tutors');
      if (error) throw error;
      return data!;
    },
  });
}
```

### Хуки для предметов

```ts
// src/entities/subject/api/index.tsx

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/subjects');
      if (error) throw error;
      return data!;
    },
  });
}
```

### Хуки для групп классов

```ts
// src/entities/class-group/api/index.tsx

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export function useClassGroups() {
  return useQuery({
    queryKey: ['class-groups'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/admin/class-groups');
      if (error) throw error;
      return data!;
    },
  });
}
```

### Страницы

Страница **репетиторов** включает:
- Таблицу с ФИО, предметами, количеством слотов
- Drawer с формой создания/редактирования (ФИО, chat_id, предметы — мульти-селект)
- Удаление с подтверждением

Страница **предметов** включает:
- Таблицу: название, группа классов
- Inline-создание и редактирование
- Удаление с подтверждением

**Проверка:** создаём репетитора, привязываем предметы — всё отображается в таблице. CRUD для предметов работает через `POST/PUT/DELETE /api/admin/subjects`.

---

## Итерация 9. Авторизация

> **Цель:** LoginPage, RequireAuth guard, JWT в localStorage с обработкой 401.

### Роутинг с авторизацией

```tsx
// src/app/providers/RouterProvider.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/widgets/Layout';
import { DashboardPage } from '@/pages/dashboard';
import { UsersPage }     from '@/pages/users';
import { SlotsPage }     from '@/pages/slots';
import { BookingsPage }  from '@/pages/bookings';
import { TutorsPage }    from '@/pages/tutors';
import { SubjectsPage }  from '@/pages/subjects';
import { LoginPage }     from '@/pages/login';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export function RouterProvider() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/"          element={<DashboardPage />} />
          <Route path="/users"     element={<UsersPage />}     />
          <Route path="/slots"     element={<SlotsPage />}     />
          <Route path="/bookings"  element={<BookingsPage />}  />
          <Route path="/tutors"    element={<TutorsPage />}    />
          <Route path="/subjects"  element={<SubjectsPage />}  />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Точка входа приложения

```tsx
// src/app/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Toaster } from 'react-hot-toast';
import { AppThemeProvider } from './providers/ThemeProvider';
import { RouterProvider }   from './providers/RouterProvider';
import './styles/global.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <RouterProvider />
          <Toaster position="top-right" />
        </LocalizationProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

JWT-интерцептор из итерации 2 автоматически добавляет токен ко всем запросам и обрабатывает 401-ответы (редирект на `/login`).

**Проверка:** без токена в localStorage любой переход редиректит на `/login`. После логина токен сохраняется, и все страницы доступны. При истечении токена (401 от API) происходит редирект на логин.

---

## Итерация 10. Деплой

> **Цель:** упаковать фронтенд в Docker, настроить nginx, HTTPS, CI/CD.

### Сборка

```bash
# Создать .env.production
echo "VITE_API_URL=https://your-domain.com" > .env.production

# Сборка
npm run build
# Результат: dist/
```

### Dockerfile для фронтенда

```dockerfile
# tutorbot-admin/Dockerfile

# Этап 1: сборка
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Этап 2: раздача через Nginx
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### nginx.conf (SPA + reverse proxy + gzip)

```nginx
# tutorbot-admin/nginx.conf

server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA: все пути отдаём index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Проксируем API-запросы на Go-бэкенд (отдельный репо/контейнер)
    # Если используете общую docker network — http://bot:8080
    # Если используете extra_hosts: host-gateway — http://host.docker.internal:8080
    location /api/ {
        proxy_pass         http://host.docker.internal:8080;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Кеширование статики
    location ~* \.(js|css|png|jpg|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
}
```

### Два репозитория

Бэкенд и фронтенд живут в **разных репозиториях**:

| Репозиторий | Содержимое | Деплой |
|---|---|---|
| `tg_bot` | Go-бот, REST API, миграции, docker-compose (инфра + бот) | Сервер: `/opt/tutorbot` |
| `tutorbot-admin` | React-админка, Dockerfile, nginx.conf | Сервер: `/opt/tutorbot-admin` |

Фронтенд подключается к API бэкенда через nginx reverse proxy (`/api/ → bot:8080`).

### docker-compose.yml (бэкенд-репо `tg_bot`)

Инфраструктура и бот. Фронтенд **не входит** — он в своём репо.

```yaml
# tg_bot/docker-compose.yml

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: tutorbot
      POSTGRES_USER: tutorbot
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tutorbot"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER:-guest}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD:-guest}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  bot:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      BOT_TOKEN:           ${BOT_TOKEN}
      DATABASE_URL:        postgres://tutorbot:${POSTGRES_PASSWORD}@postgres:5432/tutorbot
      REDIS_ADDR:          redis:6379
      REDIS_PASSWORD:      ${REDIS_PASSWORD}
      RABBITMQ_URL:        amqp://${RABBITMQ_USER:-guest}:${RABBITMQ_PASSWORD:-guest}@rabbitmq:5672/
      ADMIN_CHAT_ID:       ${ADMIN_CHAT_ID}
      HTTP_PORT:           8080
      ADMIN_JWT_SECRET:    ${ADMIN_JWT_SECRET}
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

### docker-compose.yml (фронтенд-репо `tutorbot-admin`)

Только фронтенд + certbot для HTTPS. Подключается к API бэкенда через docker network.

```yaml
# tutorbot-admin/docker-compose.yml

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
    volumes:
      - certbot_conf:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    extra_hosts:
      - "bot:host-gateway"  # доступ к API бэкенда на хосте (порт 8080)

  certbot:
    image: certbot/certbot
    volumes:
      - certbot_conf:/etc/letsencrypt
      - certbot_www:/var/www/certbot

volumes:
  certbot_conf:
  certbot_www:
```

> **Альтернатива `extra_hosts`:** если оба compose-файла на одном сервере, можно использовать общую docker network:
> ```bash
> # Создать общую сеть
> docker network create tutorbot-net
> # В бэкенд docker-compose.yml добавить:
> #   networks: default: { name: tutorbot-net, external: true }
> # В фронтенд docker-compose.yml — то же самое
> # Тогда nginx proxy_pass: http://bot:8080
> ```

### HTTPS с Let's Encrypt

Выполняется **в репозитории фронтенда** (`tutorbot-admin`):

```bash
# На сервере: /opt/tutorbot-admin
cd /opt/tutorbot-admin

# 1. Запустить без HTTPS, чтобы Certbot прошёл проверку домена
docker compose up -d

# 2. Получить сертификат
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  -d your-domain.com \
  --email admin@your-domain.com \
  --agree-tos \
  --no-eff-email

# 3. Обновить nginx.conf для HTTPS (добавить SSL-блок)
# 4. Пересобрать контейнер фронтенда
docker compose build frontend
docker compose up -d frontend

# 5. Автообновление сертификата (добавить в crontab):
# 0 3 * * * cd /opt/tutorbot-admin && docker compose run --rm certbot renew && docker compose restart frontend
```

### nginx.conf с HTTPS

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass       http://host.docker.internal:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }

    location ~* \.(js|css|png|jpg|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### GitHub Actions CI/CD

Два отдельных workflow — по одному на каждый репозиторий.

**Бэкенд** (`tg_bot/.github/workflows/deploy.yml`):

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host:     ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key:      ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/tutorbot
            git pull origin main
            docker compose build bot
            docker compose up -d --no-deps bot
            docker image prune -f
```

**Фронтенд** (`tutorbot-admin/.github/workflows/deploy.yml`):

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host:     ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key:      ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/tutorbot-admin
            git pull origin main
            docker compose build frontend
            docker compose up -d --no-deps frontend
            docker image prune -f
```

### Итоговая команда запуска

```bash
# === Бэкенд (бот + API + инфра) ===
git clone https://github.com/you/tg_bot /opt/tutorbot
cd /opt/tutorbot
cp .env.example .env
nano .env   # Заполнить BOT_TOKEN, ADMIN_CHAT_ID, POSTGRES_PASSWORD, ADMIN_JWT_SECRET
docker compose up -d

# === Фронтенд (React-админка) ===
git clone https://github.com/you/tutorbot-admin /opt/tutorbot-admin
cd /opt/tutorbot-admin
docker compose up -d
```

**Проверка:**
1. Бэкенд: `cd /opt/tutorbot && docker compose up -d` — поднимается PostgreSQL, Redis, RabbitMQ, Go-бот с REST API.
2. Фронтенд: `cd /opt/tutorbot-admin && docker compose up -d` — поднимается React-админка через nginx.
3. Открываем `https://your-domain.com` — видим логин-страницу. После авторизации — дашборд с данными.

---

## Что мы получили в итоге

| Итерация | Результат |
|---|---|
| 0 | Скелет React-проекта, Vite, FSD-структура |
| 1 | SCSS-тема, MUI ThemeProvider, Layout с сайдбаром |
| 2 | API-клиент с JWT, автогенерация типов из Swagger |
| 3 | Shared UI: DataTable, StatusChip, ConfirmDialog, хелперы |
| 4 | Dashboard с карточками-метриками и графиком |
| 5 | Страница бронирований с фильтрами и сменой статуса |
| 6 | Страница слотов: таблица, создание, удаление |
| 7 | Страница пользователей: поиск, блокировка |
| 8 | Страницы репетиторов и предметов (CRUD) |
| 9 | Авторизация: LoginPage, RequireAuth, обработка 401 |
| 10 | Деплой: Docker, nginx, HTTPS, CI/CD |

| Технология | Роль |
|---|---|
| **React + TypeScript** | UI и типобезопасность |
| **FSD** | Организация кода по слоям с явными зависимостями |
| **openapi-typescript + openapi-fetch** | Автогенерация типов и типобезопасные запросы из Swagger-схемы Go |
| **React Query** | Кеширование, фоновое обновление, состояния загрузки/ошибки |
| **react-hook-form + Zod** | Управление формами с валидацией в реальном времени |
| **Material UI** | Готовые компоненты: таблицы, диалоги, формы, навигация |
| **SCSS-модули** | Инкапсулированные стили с глобальными переменными |
| **Nginx** | Раздача SPA, реверс-прокси на API, HTTPS |
| **Docker Compose** | Одной командой поднимаем весь стек |
| **GitHub Actions** | Автоматический деплой при пуше в main |

После каждой итерации — рабочий, запускаемый код. Следующая итерация добавляет функциональность поверх, не ломая то, что уже работает.
