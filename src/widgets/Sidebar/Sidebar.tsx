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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobile, mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const width = collapsed ? 72 : 260;

  const handleNavigate = (path: string) => {
    navigate(path);
    if (mobile && onMobileClose) onMobileClose();
  };

  return (
    <Drawer
      variant={mobile ? 'temporary' : 'permanent'}
      open={mobile ? mobileOpen : true}
      onClose={onMobileClose}
      PaperProps={{
        className: styles.sidebar,
        sx: { width: mobile ? 260 : width, transition: 'width 0.2s ease', overflow: 'hidden' },
      }}
      ModalProps={mobile ? { keepMounted: true } : undefined}
    >
      {/* Лого */}
      <Box className={styles.logoArea} sx={{ width }}>
        {!collapsed && (
          <Typography variant="h6" className={styles.logoText}>
            Репетитор Admin
          </Typography>
        )}
        <IconButton onClick={onToggle} size="small">
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
                  onClick={() => handleNavigate(item.path)}
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
