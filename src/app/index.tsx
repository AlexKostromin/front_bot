import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Toaster } from 'react-hot-toast';
import { AppThemeProvider } from './providers/ThemeProvider';
import { RouterProvider } from './providers/RouterProvider';
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
