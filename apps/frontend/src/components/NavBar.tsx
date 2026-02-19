import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { isAuthenticated, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/');
  };

  const navTo = (path: string) => {
    handleClose();
    navigate(path);
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 700 }}
          onClick={() => navigate('/')}
        >
          IHSS Caregiver Companion
        </Typography>
        {isAuthenticated ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {profile?.name}
            </Typography>
            <IconButton color="inherit" onClick={handleMenu}>
              <AccountCircleIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={() => navTo('/dashboard')}>Dashboard</MenuItem>
              <Divider />
              <MenuItem onClick={() => navTo('/shifts')}>Shifts</MenuItem>
              <MenuItem onClick={() => navTo('/incidents')}>Incidents</MenuItem>
              <MenuItem onClick={() => navTo('/exports')}>Weekly Exports</MenuItem>
              <MenuItem onClick={() => navTo('/assistant')}>AI Assistant</MenuItem>
              <Divider />
              <MenuItem onClick={() => navTo('/certifications')}>Certifications</MenuItem>
              <MenuItem onClick={() => navTo('/notifications')}>Notification Settings</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
