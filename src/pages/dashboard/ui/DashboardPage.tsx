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
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
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
          {stats?.bookings_chart?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.bookings_chart}>
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
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={280}>
              <Typography color="text.secondary">Нет данных</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
