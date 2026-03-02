import { useEffect } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful checkout
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #6a1b9a 100%)',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#e8f5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Typography fontSize="2.5rem">✓</Typography>
          </Box>
          <Typography variant="h4" fontWeight={900} mb={2}>
            You're all set!
          </Typography>
          <Typography color="text.secondary" mb={4} fontSize="1.05rem">
            Your 7-day trial has started. You now have full access to IHSS Care Guide.
            We'll remind you before your trial ends.
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{
                borderRadius: 3,
                fontWeight: 800,
                py: 1.5,
                fontSize: '1rem',
                bgcolor: '#1565c0',
                '&:hover': { bgcolor: '#0d47a1' },
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/subscribe')}
              sx={{ color: 'text.secondary', fontWeight: 600 }}
            >
              Manage Subscription
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default SubscriptionSuccess;
