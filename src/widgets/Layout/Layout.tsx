import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/widgets/Sidebar';
import { Header } from '@/widgets/Header';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 72;

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <Box
        display="flex"
        flexDirection="column"
        flex={1}
        overflow="hidden"
        sx={{ ml: `${sidebarWidth}px`, transition: 'margin-left 0.2s ease' }}
      >
        <Header />
        <Box component="main" flex={1} overflow="auto" bgcolor="background.default">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
