import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApiStatus from '../components/ApiStatus';

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const navCards = [
    {
      icon: <ScheduleIcon fontSize="large" color="primary" />,
      title: 'Shift Companion',
      description: 'Start a new shift or view your active shift.',
      action: () => navigate('/shifts'),
      label: 'Go to Shifts',
      color: 'primary' as const,
    },
    {
      icon: <AssignmentIcon fontSize="large" color="secondary" />,
      title: 'Weekly Export',
      description: 'Generate your weekly summary for ESP submission.',
      action: () => navigate('/exports'),
      label: 'Weekly Export',
      color: 'secondary' as const,
    },
    {
      icon: <WarningAmberIcon fontSize="large" sx={{ color: '#f57c00' }} />,
      title: 'Incidents',
      description: 'Log and manage incident reports.',
      action: () => navigate('/incidents'),
      label: 'View Incidents',
      color: 'warning' as const,
    },
    {
      icon: <HelpOutlineIcon fontSize="large" sx={{ color: '#7b1fa2' }} />,
      title: 'Knowledge Assistant',
      description: 'Ask IHSS and ESP workflow questions.',
      action: () => navigate('/assistant'),
      label: 'Open Assistant',
      color: 'secondary' as const,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Welcome back{profile?.name ? `, ${profile.name}` : ''}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              What would you like to do today?
            </Typography>
          </Box>
          <ApiStatus />
        </Box>

        {/* Navigation Cards */}
        <Grid container spacing={3}>
          {navCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={card.action}>
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    {card.icon}
                    <Typography variant="h6" fontWeight={600}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                    <Button variant="contained" color={card.color} size="small" fullWidth>
                      {card.label}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Disclaimer */}
        <Card sx={{ bgcolor: '#fff8e1', border: '1px solid #ffe082' }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Chip label="Reminder" size="small" color="warning" />
              <Typography variant="body2" color="text.secondary">
                This application is a workflow support tool and does not replace official IHSS or ESP
                systems. Always verify information with official IHSS resources before taking action.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default Dashboard;
