import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Logout, DarkMode, LightMode, Menu } from '@mui/icons-material';
import { useColorMode } from '@/app/providers/ThemeProvider';
import { useTheme } from '@mui/material/styles';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { toggle } = useColorMode();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        px: 2,
      }}
    >
      {onMenuClick && (
        <IconButton onClick={onMenuClick} color="inherit" sx={{ mr: 1 }}>
          <Menu />
        </IconButton>
      )}
      <Box flex={1} />
      <Tooltip title={theme.palette.mode === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
        <IconButton onClick={toggle} color="inherit">
          {theme.palette.mode === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Выход">
        <IconButton onClick={handleLogout} color="inherit">
          <Logout />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
