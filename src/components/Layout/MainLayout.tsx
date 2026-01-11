import { Box, Drawer, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { Sidebar } from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/api/mock';

interface MainLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  title?: string;
}

const DRAWER_WIDTH = 240;
const RIGHT_DRAWER_WIDTH = 280;

/**
 * Main layout with sidebar, content area, and optional right panel
 */
export const MainLayout = ({ children, rightPanel, title }: MainLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title || 'Trio Admin Panel'}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Left Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <Sidebar />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: rightPanel
            ? `calc(100% - ${DRAWER_WIDTH}px - ${RIGHT_DRAWER_WIDTH}px)`
            : `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Right Panel */}
      {rightPanel && (
        <Drawer
          variant="permanent"
          anchor="right"
          sx={{
            width: RIGHT_DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: RIGHT_DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          {rightPanel}
        </Drawer>
      )}
    </Box>
  );
};
