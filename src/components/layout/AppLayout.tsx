import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  LoginOutlined as LogoutIcon,
  MenuOutlined as MenuIcon,
  PersonOutlined as ProfileIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/useAuth';
import { DRAWER_WIDTH, Sidebar } from '@/components/layout/Sidebar';
import { ROUTES } from '@/utils/routes';

/**
 * Authenticated shell: fixed Topbar (title, user, logout) + role-based
 * Sidebar (menu config) + main content via <Outlet />.
 * Wraps authenticated routes only (see App.tsx ProtectedRoute).
 */
export function AppLayout() {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="default"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 2 } }}>
          <IconButton
            edge="start"
            aria-label="Open navigation"
            onClick={() => setMobileOpen((open) => !open)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
            Ticket Desk
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="body2" sx={{ lineHeight: 1.2, fontWeight: 600 }}>
              {username ?? 'User'}
            </Typography>
            <Chip label={role} size="small" variant="outlined" sx={{ height: 18, fontSize: 11 }} />
          </Box>
          <IconButton
            aria-label="My Profile"
            title="My Profile"
            onClick={() => navigate(ROUTES.profile)}
            sx={{ color: 'text.secondary' }}
          >
            <ProfileIcon />
          </IconButton>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ fontWeight: 600, color: 'error.main' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
