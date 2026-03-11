import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/widgets/Sidebar';
import { Header } from '@/widgets/Header';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 72;

export function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar
        collapsed={isMobile ? false : collapsed}
        onToggle={isMobile ? () => setMobileOpen(false) : () => setCollapsed(c => !c)}
        mobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        display="flex"
        flexDirection="column"
        flex={1}
        overflow="hidden"
        sx={{
          ml: isMobile ? 0 : `${sidebarWidth}px`,
          transition: 'margin-left 0.2s ease',
        }}
      >
        <Header onMenuClick={isMobile ? () => setMobileOpen(true) : undefined} />
        <Box component="main" flex={1} overflow="auto" bgcolor="background.default">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
