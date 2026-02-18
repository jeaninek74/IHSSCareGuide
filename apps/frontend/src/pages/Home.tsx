import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApiStatus from '../components/ApiStatus';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <ScheduleIcon fontSize="large" color="primary" />,
      title: 'Shift Companion',
      description: 'Start shifts, log care activities in real time, and end shifts with a complete timeline.',
    },
    {
      icon: <AssignmentIcon fontSize="large" color="primary" />,
      title: 'Structured Documentation',
      description: 'AI converts your raw shift notes into professional care documentation automatically.',
    },
    {
      icon: <HelpOutlineIcon fontSize="large" color="primary" />,
      title: 'Knowledge Assistant',
      description: 'Get answers to IHSS and ESP workflow questions grounded in curated official resources.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: 8,
          px: 2,
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h3" fontWeight={700}>
              IHSS Caregiver Companion
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
              A structured workflow assistant that reduces documentation burden and helps you stay
              organized — so you can focus on delivering quality care.
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => navigate('/dashboard')}
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: '#f5f5f5' } }}
                  >
                    Create Account
                  </Button>
                </>
              )}
            </Stack>
            <Box mt={2}>
              <ApiStatus />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" gutterBottom fontWeight={600}>
          Everything you need for your shift
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          mb={6}
          maxWidth={600}
          mx="auto"
        >
          This tool does not replace IHSS or ESP systems. It works alongside them to reduce your
          documentation burden and keep you organized.
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <Card sx={{ height: '100%', p: 1 }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    {feature.icon}
                    <Typography variant="h6" fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
