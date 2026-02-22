import { Box, Button, Container, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    title: 'Track Your Shifts',
    description:
      'Start a shift with one tap. Log meals, medications, and activities as you go. End the shift and everything is saved.',
    color: '#1565c0',
  },
  {
    title: 'AI Writes Your Notes',
    description:
      'After every shift, our AI turns your quick logs into a full professional care note — ready to save or share.',
    color: '#6a1b9a',
  },
  {
    title: 'Never Miss a Deadline',
    description:
      'Add your certifications and we will remind you before they expire — 30 days, 7 days, and 1 day out.',
    color: '#00695c',
  },
  {
    title: 'Report Incidents Fast',
    description:
      'Describe what happened in plain words. The AI structures it into a proper incident report in seconds.',
    color: '#c62828',
  },
  {
    title: 'Get IHSS Answers',
    description:
      'Ask any question about IHSS rules, timesheets, or your rights. Get clear answers based on official sources.',
    color: '#e65100',
  },
  {
    title: 'Export Weekly Reports',
    description:
      'Generate a full weekly summary of your care work — formatted, professional, and ready to print or share.',
    color: '#283593',
  },
];

const HOW_IT_WORKS = [
  { step: '1', text: 'Create an account in 30 seconds.' },
  { step: '2', text: 'Start a shift and log what you do as you care.' },
  { step: '3', text: 'End the shift — the AI writes your notes for you.' },
  { step: '4', text: 'Export your weekly report whenever you need it.' },
];

const Home = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();

  return (
    <Box>
      {/* HERO */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #6a1b9a 100%)',
          color: 'white',
          py: { xs: 10, md: 14 },
          px: 2,
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography
              variant="h4"
              sx={{ opacity: 0.95, letterSpacing: 3, fontSize: { xs: '1.4rem', md: '1.9rem' }, fontWeight: 800, textTransform: 'uppercase' }}
            >
              In-Home Supportive Services
            </Typography>
            <Typography
              variant="h2"
              fontWeight={900}
              sx={{ fontSize: { xs: '2.4rem', md: '3.5rem' }, lineHeight: 1.15, mt: '0 !important' }}
            >
              IHSS Care Guide
            </Typography>
            <Typography
              variant="h5"
              sx={{ opacity: 0.92, maxWidth: 600, fontWeight: 400, lineHeight: 1.5 }}
            >
              IHSS Care Guide handles your paperwork so you can focus on caring.
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.8, maxWidth: 520, fontSize: '1.05rem' }}
            >
              IHSS Care Guide gives California caregivers one app to track shifts, write notes, report incidents, and get answers.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    bgcolor: 'white',
                    color: '#1565c0',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    px: 5,
                    py: 1.5,
                    borderRadius: 3,
                    '&:hover': { bgcolor: '#e3f2fd' },
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: 'white',
                      color: '#1565c0',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      px: 5,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': { bgcolor: '#e3f2fd' },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.7)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    Log In
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* WHAT IT DOES */}
      <Box sx={{ bgcolor: '#f9f9f9', py: { xs: 8, md: 10 }, px: 2 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight={800}
            mb={2}
            sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' } }}
          >
            What does it do?
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            mb={7}
            maxWidth={560}
            mx="auto"
            fontSize="1.05rem"
          >
            Six tools built specifically for IHSS Care Guide users — no training required.
          </Typography>
          <Grid container spacing={3}>
            {FEATURES.map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f.title}>
                <Box
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 4,
                    p: 4,
                    height: '100%',
                    borderTop: `6px solid ${f.color}`,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  }}
                >
                  <Typography variant="h6" fontWeight={800} mb={1.5} sx={{ color: f.color }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7} fontSize="0.97rem">
                    {f.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* HOW IT WORKS */}
      <Box sx={{ bgcolor: '#1976d2', color: 'white', py: { xs: 8, md: 10 }, px: 2 }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight={800}
            mb={7}
            sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' } }}
          >
            How it works
          </Typography>
          <Stack spacing={4}>
            {HOW_IT_WORKS.map((item) => (
              <Box
                key={item.step}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  bgcolor: 'rgba(255,255,255,0.12)',
                  borderRadius: 3,
                  px: 4,
                  py: 3,
                }}
              >
                <Box
                  sx={{
                    minWidth: 52,
                    height: 52,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    color: '#1565c0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant="h6" fontWeight={500} sx={{ opacity: 0.95 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>
          {!isAuthenticated && (
            <Box textAlign="center" mt={8}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'white',
                  color: '#1565c0',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  px: 6,
                  py: 1.8,
                  borderRadius: 3,
                  '&:hover': { bgcolor: '#e3f2fd' },
                }}
              >
                Create Your Account
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* TRUST BAR */}
      <Box sx={{ bgcolor: '#fff8e1', py: { xs: 6, md: 8 }, px: 2 }}>
        <Container maxWidth="md">
          <Grid container spacing={4} textAlign="center">
            {[
              { stat: 'AI-Powered', label: 'Notes written in seconds, not minutes.' },
              { stat: 'IHSS-Specific', label: 'Built for California IHSS caregivers.' },
              { stat: 'Easy to Use', label: 'No training required. Start in under a minute.' },
            ].map((item) => (
              <Grid item xs={12} sm={4} key={item.stat}>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{ color: '#e65100', mb: 0.5, fontSize: { xs: '1.7rem', md: '2rem' } }}
                >
                  {item.stat}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize="0.97rem">
                  {item.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* PRICING */}
      <Box sx={{ bgcolor: '#f9f9f9', py: { xs: 8, md: 10 }, px: 2 }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight={800}
            mb={2}
            sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' } }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            mb={7}
            maxWidth={520}
            mx="auto"
            fontSize="1.05rem"
          >
            Start with a 7-day trial — no credit card required. Cancel anytime.
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {/* MONTHLY */}
            <Grid item xs={12} sm={6} md={5}>
              <Box
                sx={{
                  bgcolor: 'white',
                  borderRadius: 4,
                  p: 5,
                  height: '100%',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                  border: '2px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Typography variant="overline" sx={{ color: '#1976d2', fontWeight: 700, letterSpacing: 2 }}>
                  Monthly
                </Typography>
                <Typography variant="h2" fontWeight={900} sx={{ mt: 1, mb: 0, color: '#1565c0', fontSize: { xs: '3rem', md: '3.5rem' } }}>
                  $10
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  per month
                </Typography>
                <Stack spacing={1.5} mb={4} width="100%" alignItems="flex-start">
                  {['Full access to all features', 'AI-generated care notes', 'Incident reporting', 'Weekly exports', 'Certification reminders', 'IHSS AI Assistant'].map(f => (
                    <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2', flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary">{f}</Typography>
                    </Box>
                  ))}
                </Stack>
                {!isAuthenticated && (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/register')}
                    sx={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 700, borderRadius: 3, py: 1.5, '&:hover': { bgcolor: '#e3f2fd' } }}
                  >
                    Start 7-Day Trial
                  </Button>
                )}
              </Box>
            </Grid>
            {/* ANNUAL */}
            <Grid item xs={12} sm={6} md={5}>
              <Box
                sx={{
                  bgcolor: '#1976d2',
                  borderRadius: 4,
                  p: 5,
                  height: '100%',
                  boxShadow: '0 4px 24px rgba(25,118,210,0.3)',
                  border: '2px solid #1565c0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -14,
                    bgcolor: '#e65100',
                    color: 'white',
                    px: 2.5,
                    py: 0.5,
                    borderRadius: 10,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: 1,
                  }}
                >
                  BEST VALUE — SAVE 29%
                </Box>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, letterSpacing: 2 }}>
                  Annual
                </Typography>
                <Typography variant="h2" fontWeight={900} sx={{ mt: 1, mb: 0, color: 'white', fontSize: { xs: '3rem', md: '3.5rem' } }}>
                  $85
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }} mb={3}>
                  per year — only $7.08/mo
                </Typography>
                <Stack spacing={1.5} mb={4} width="100%" alignItems="flex-start">
                  {['Full access to all features', 'AI-generated care notes', 'Incident reporting', 'Weekly exports', 'Certification reminders', 'IHSS AI Assistant'].map(f => (
                    <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.8)', flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{f}</Typography>
                    </Box>
                  ))}
                </Stack>
                {!isAuthenticated && (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/register')}
                    sx={{ bgcolor: 'white', color: '#1565c0', fontWeight: 800, borderRadius: 3, py: 1.5, '&:hover': { bgcolor: '#e3f2fd' } }}
                  >
                    Start 7-Day Trial
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FINAL CTA */}
      {!isAuthenticated && (
        <Box
          sx={{
            background: 'linear-gradient(135deg, #6a1b9a 0%, #1976d2 100%)',
            color: 'white',
            py: { xs: 8, md: 10 },
            px: 2,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="sm">
            <Typography
              variant="h3"
              fontWeight={900}
              mb={2}
              sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' } }}
            >
              Ready to make caregiving easier?
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.88, mb: 5, fontSize: '1.05rem' }}>
              Join IHSS Care Guide users who spend less time on paperwork and more time on care.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: '#6a1b9a',
                fontWeight: 800,
                fontSize: '1.15rem',
                px: 6,
                py: 1.8,
                borderRadius: 3,
                '&:hover': { bgcolor: '#f3e5f5' },
              }}
            >
              Get Started
            </Button>
          </Container>
        </Box>
      )}

      {/* FOOTER */}
      <Box sx={{ bgcolor: '#212121', py: 4, px: 2 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="caption" color="grey.500">
              &copy; {new Date().getFullYear()} IHSS Care Guide
            </Typography>
            <Typography variant="caption" color="grey.600" sx={{ display: { xs: 'none', sm: 'block' } }}>
              |
            </Typography>
            <Link component={RouterLink} to="/terms" variant="caption" color="grey.400" underline="hover">
              Terms of Service
            </Link>
            <Link component={RouterLink} to="/privacy" variant="caption" color="grey.400" underline="hover">
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/disclaimer" variant="caption" color="grey.400" underline="hover">
              Disclaimer
            </Link>
          </Stack>
          <Typography variant="caption" color="grey.600" textAlign="center" display="block" mt={1.5}>
            IHSS Care Guide is not affiliated with CDSS, any county IHSS program, or the Electronic Services Portal (ESP).
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
