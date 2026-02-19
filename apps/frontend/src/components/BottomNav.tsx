import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VerifiedIcon from '@mui/icons-material/Verified';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const mainNavItems = [
  { label: 'Home', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Shifts', icon: <ScheduleIcon />, path: '/shifts' },
  { label: 'Exports', icon: <AssignmentIcon />, path: '/exports' },
  { label: 'Assistant', icon: <HelpOutlineIcon />, path: '/assistant' },
];

const moreItems = [
  { label: 'Incidents', icon: <WarningAmberIcon color="warning" />, path: '/incidents' },
  { label: 'Certifications', icon: <VerifiedIcon sx={{ color: '#0288d1' }} />, path: '/certifications' },
  { label: 'Notifications', icon: <NotificationsIcon color="primary" />, path: '/notifications' },
  { label: 'Account', icon: <AccountCircleIcon color="action" />, path: '/profile' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const currentValue = mainNavItems.findIndex((item) =>
    location.pathname.startsWith(item.path)
  );

  const isMoreActive = moreItems.some((item) => location.pathname.startsWith(item.path));

  return (
    <>
      <Box
        sx={{
          display: { xs: 'block', sm: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
        }}
      >
        <Paper elevation={8} sx={{ borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
          <BottomNavigation
            value={isMoreActive ? 4 : (currentValue === -1 ? false : currentValue)}
            onChange={(_, newValue) => {
              if (newValue === 4) {
                setMoreOpen(true);
              } else {
                navigate(mainNavItems[newValue].path);
              }
            }}
            showLabels
            sx={{ height: 64 }}
          >
            {mainNavItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
                sx={{
                  minWidth: 0,
                  '& .MuiBottomNavigationAction-label': { fontSize: '0.65rem' },
                }}
              />
            ))}
            <BottomNavigationAction
              label="More"
              icon={<MoreHorizIcon />}
              sx={{
                minWidth: 0,
                '& .MuiBottomNavigationAction-label': { fontSize: '0.65rem' },
              }}
            />
          </BottomNavigation>
        </Paper>
      </Box>

      {/* More Drawer */}
      <Drawer
        anchor="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px 16px 0 0',
            pb: 2,
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: 'grey.300',
              borderRadius: 2,
              mx: 'auto',
              mb: 2,
            }}
          />
          <Typography variant="subtitle1" fontWeight={700}>More</Typography>
        </Box>
        <Divider />
        <List>
          {moreItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname.startsWith(item.path)}
                onClick={() => {
                  navigate(item.path);
                  setMoreOpen(false);
                }}
                sx={{ py: 1.5, px: 3 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: location.pathname.startsWith(item.path) ? 700 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default BottomNav;
