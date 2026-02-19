import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SchoolIcon from '@mui/icons-material/School';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Shifts', path: '/shifts', icon: <ScheduleIcon fontSize="small" /> },
  { label: 'Exports', path: '/exports', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Incidents', path: '/incidents', icon: <WarningAmberIcon fontSize="small" /> },
  { label: 'Assistant', path: '/assistant', icon: <HelpOutlineIcon fontSize="small" /> },
  { label: 'Certifications', path: '/certifications', icon: <SchoolIcon fontSize="small" /> },
  { label: 'Account', path: '/profile', icon: <AccountCircleIcon fontSize="small" /> },
];

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: { xs: '0.95rem', sm: '1.15rem', md: '1.25rem' },
            }}
            onClick={() => navigate(user ? '/dashboard' : '/')}
          >
            IHSS Companion
          </Typography>

          {/* Desktop nav links */}
          {user && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  color="inherit"
                  size="small"
                  onClick={() => navigate(link.path)}
                  sx={{
                    fontWeight: isActive(link.path) ? 700 : 400,
                    borderBottom: isActive(link.path) ? '2px solid white' : '2px solid transparent',
                    borderRadius: 0,
                    px: 1.5,
                    minWidth: 0,
                    fontSize: '0.8rem',
                  }}
                >
                  {link.label}
                </Button>
              ))}
              <Button
                color="inherit"
                size="small"
                startIcon={<LogoutIcon fontSize="small" />}
                onClick={handleLogout}
                sx={{ ml: 1, fontSize: '0.8rem' }}
              >
                Logout
              </Button>
            </Box>
          )}

          {/* Mobile: hamburger */}
          {user && (
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' } }}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Not logged in */}
          {!user && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" size="small" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => navigate('/register')}
                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 260 } }}
      >
        {/* User info header */}
        <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }}>
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </Avatar>
          <Typography variant="body2" sx={{ opacity: 0.9, wordBreak: 'break-all' }}>
            {user?.email}
          </Typography>
        </Box>

        <Divider />

        <List sx={{ pt: 1 }}>
          {navLinks.map((link) => (
            <ListItem key={link.path} disablePadding>
              <ListItemButton
                selected={isActive(link.path)}
                onClick={() => {
                  navigate(link.path);
                  setDrawerOpen(false);
                }}
                sx={{ py: 1.5 }}
              >
                <ListItemIcon
                  sx={{ minWidth: 36, color: isActive(link.path) ? 'primary.main' : 'inherit' }}
                >
                  {link.icon}
                </ListItemIcon>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontWeight: isActive(link.path) ? 700 : 400,
                    color: isActive(link.path) ? 'primary.main' : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate('/notifications');
                setDrawerOpen(false);
              }}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <NotificationsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ color: 'error' }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Box sx={{ p: 2, mt: 'auto' }}>
          <Typography variant="caption" color="text.secondary">
            IHSS Companion v1.0.0
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default NavBar;
