
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navCards = [
    {
      icon: <ScheduleIcon sx={{ fontSize: { xs: 36, sm: 48 } }} color="primary" />,
      title: 'Shift Companion',
      description: 'Start a new shift or view your active shift.',
      action: () => navigate('/shifts'),
      color: '#e3f2fd',
      borderColor: '#1976d2',
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: { xs: 36, sm: 48 } }} color="secondary" />,
      title: 'Weekly Export',
      description: 'Generate your weekly summary for ESP submission.',
      action: () => navigate('/exports'),
      color: '#f3e5f5',
      borderColor: '#7b1fa2',
    },
    {
      icon: <WarningAmberIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: '#f57c00' }} />,
      title: 'Incidents',
      description: 'Log and manage incident reports.',
      action: () => navigate('/incidents'),
      color: '#fff3e0',
      borderColor: '#f57c00',
    },
    {
      icon: <HelpOutlineIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: '#7b1fa2' }} />,
      title: 'Knowledge Assistant',
      description: 'Ask IHSS and ESP workflow questions.',
      action: () => navigate('/assistant'),
      color: '#ede7f6',
      borderColor: '#7b1fa2',
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: '#0288d1' }} />,
      title: 'Certifications',
      description: 'Track your IHSS training and certification expiration dates.',
      action: () => navigate('/certifications'),
      color: '#e1f5fe',
      borderColor: '#0288d1',
    },
  ];

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 4 }}>
          {/* Header */}
          <Box>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              fontWeight={700}
              gutterBottom
            >
              Welcome back{profile?.name ? `, ${profile.name}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              What would you like to do today?
            </Typography>
          </Box>

          {/* Navigation Cards */}
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            {navCards.map((card) => (
              <Grid item xs={6} sm={6} md={4} lg={2.4} key={card.title}>
                <Card
                  sx={{
                    height: '100%',
                    border: `2px solid ${card.borderColor}20`,
                    bgcolor: card.color,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={card.action}
                    sx={{ height: '100%', p: { xs: 1, sm: 0 } }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                      <Stack spacing={{ xs: 1, sm: 1.5 }} alignItems="center" textAlign="center">
                        {card.icon}
                        <Typography
                          variant={isMobile ? 'caption' : 'subtitle2'}
                          fontWeight={700}
                          lineHeight={1.2}
                        >
                          {card.title}
                        </Typography>
                        {!isMobile && (
                          <Typography variant="caption" color="text.secondary">
                            {card.description}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Disclaimer */}
          <Card sx={{ bgcolor: '#fff8e1', border: '1px solid #ffe082' }}>
            <CardContent sx={{ py: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Chip label="Note" size="small" color="warning" sx={{ flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary">
                  This app is a workflow support tool. Always verify information with official IHSS
                  resources before taking action.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </>
  );
};

export default Dashboard;
