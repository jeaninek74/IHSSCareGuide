import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const navItems = [
  { label: 'Home', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Shifts', icon: <ScheduleIcon />, path: '/shifts' },
  { label: 'Exports', icon: <AssignmentIcon />, path: '/exports' },
  { label: 'Assistant', icon: <HelpOutlineIcon />, path: '/assistant' },
  { label: 'More', icon: <MoreHorizIcon />, path: '/incidents' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentValue = navItems.findIndex((item) =>
    location.pathname.startsWith(item.path)
  );

  return (
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
          value={currentValue === -1 ? false : currentValue}
          onChange={(_, newValue) => {
            navigate(navItems[newValue].path);
          }}
          showLabels
          sx={{ height: 64 }}
        >
          {navItems.map((item) => (
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
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default BottomNav;
