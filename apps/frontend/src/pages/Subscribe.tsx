import { useState } from 'react';
import { Box, Button, Card, CircularProgress, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import { subscriptionApi } from '../services/apiClient';
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  'Shift tracking with event logging',
  'Auto-generated care notes',
  'Incident reporting & smart structuring',
  'Weekly export for ESP submission',
  'IHSS Knowledge Assistant',
  'Certification reminders',
];

const Subscribe = () => {
  const [loading, setLoading] = useState<'monthly' | 'annual' | 'portal' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { subscription, isSubscribed, isLoadingSubscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();

  const handleCheckout = async (plan: 'monthly' | 'annual') => {
    setLoading(plan);
    setError(null);
    try {
      const res = await subscriptionApi.createCheckout(plan);
      window.location.href = res.data.url;
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading('portal');
    setError(null);
    try {
      const res = await subscriptionApi.openPortal();
      window.location.href = res.data.url;
    } catch (err: any) {
      setError(err.message || 'Failed to open billing portal.');
      setLoading(null);
    }
  };

  if (isLoadingSubscription) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Already subscribed — show management view
  if (isSubscribed) {
    const trialEnd = subscription?.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
    const subEnd = subscription?.subscriptionEndsAt ? new Date(subscription.subscriptionEndsAt) : null;
    const isTrialing = subscription?.status === 'trialing';

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: { xs: 6, md: 10 }, px: 2 }}>
        <Container maxWidth="sm">
          <Card sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <Typography fontSize="2rem">✓</Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} mb={1}>
              {isTrialing ? 'Free Trial Active' : 'Subscription Active'}
            </Typography>
            <Typography color="text.secondary" mb={3}>
              {isTrialing && trialEnd
                ? `Your 7-day trial ends on ${trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
                : subscription?.plan === 'annual'
                ? 'You are on the Annual plan ($85/year).'
                : 'You are on the Monthly plan ($10/month).'}
              {subEnd && !isTrialing && ` Renews ${subEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`}
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ borderRadius: 2.5, fontWeight: 700 }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handlePortal}
                disabled={loading === 'portal'}
                sx={{ borderRadius: 2.5, fontWeight: 700 }}
              >
                {loading === 'portal' ? <CircularProgress size={20} /> : 'Manage Billing'}
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: { xs: 6, md: 10 }, px: 2 }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight={900} textAlign="center" mb={1} sx={{ fontSize: { xs: '2rem', md: '2.8rem' } }}>
          Start Your 7-Day Trial
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={1} fontSize="1.05rem">
          Full access to every feature. No charge until your trial ends.
        </Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary" mb={5}>
          Cancel anytime before the trial ends and you will not be charged.
        </Typography>

        {error && (
          <Box sx={{ bgcolor: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 2, p: 2, mb: 3, textAlign: 'center' }}>
            <Typography color="error" variant="body2">{error}</Typography>
          </Box>
        )}

        <Grid container spacing={3} justifyContent="center">
          {/* Monthly */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                p: 4,
                borderRadius: 3,
                border: '2px solid #e0e0e0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={2}>
                Monthly
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1, mb: 0.5 }}>
                <Typography variant="h3" fontWeight={900}>$10</Typography>
                <Typography color="text.secondary">/month</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Billed monthly after trial
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={1.5} mb={4} flex={1}>
                {FEATURES.map(f => (
                  <Box key={f} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#1565c0', mt: 0.7, flexShrink: 0 }} />
                    <Typography variant="body2">{f}</Typography>
                  </Box>
                ))}
              </Stack>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => handleCheckout('monthly')}
                disabled={!!loading}
                sx={{ borderRadius: 2.5, fontWeight: 700, py: 1.5, borderColor: '#1565c0', color: '#1565c0', '&:hover': { bgcolor: '#e3f2fd', borderColor: '#1565c0' } }}
              >
                {loading === 'monthly' ? <CircularProgress size={22} /> : 'Start 7-Day Trial'}
              </Button>
            </Card>
          </Grid>

          {/* Annual */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                p: 4,
                borderRadius: 3,
                border: '2px solid #1565c0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: '#e65100',
                  color: 'white',
                  px: 2.5,
                  py: 0.5,
                  borderRadius: 10,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                BEST VALUE — SAVE 29%
              </Box>
              <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={2}>
                Annual
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1, mb: 0.5 }}>
                <Typography variant="h3" fontWeight={900}>$85</Typography>
                <Typography color="text.secondary">/year</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Only $7.08/mo — billed annually after trial
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={1.5} mb={4} flex={1}>
                {FEATURES.map(f => (
                  <Box key={f} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#1565c0', mt: 0.7, flexShrink: 0 }} />
                    <Typography variant="body2">{f}</Typography>
                  </Box>
                ))}
              </Stack>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => handleCheckout('annual')}
                disabled={!!loading}
                sx={{ borderRadius: 2.5, fontWeight: 700, py: 1.5, bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' } }}
              >
                {loading === 'annual' ? <CircularProgress size={22} /> : 'Start 7-Day Trial'}
              </Button>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="caption" textAlign="center" display="block" mt={4} color="text.secondary">
          By starting a trial you agree to our{' '}
          <a href="/terms" style={{ color: 'inherit' }}>Terms of Service</a> and{' '}
          <a href="/privacy" style={{ color: 'inherit' }}>Privacy Policy</a>.
          You will be charged after the 7-day trial unless you cancel.
        </Typography>
      </Container>
    </Box>
  );
};

export default Subscribe;
