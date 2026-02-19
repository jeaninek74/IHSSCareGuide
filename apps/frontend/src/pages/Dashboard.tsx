import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, CardActionArea,
  Stack, Grid, Chip, CircularProgress, useTheme, useMediaQuery,
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import { shiftsApi, incidentsApi } from '../services/apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface DashboardStats {
  activeShift: boolean;
  activeShiftStart: string | null;
  recipientName: string | null;
  expiringSoonCount: number;
  recentIncidentsCount: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [activeRes, incRes, certRes] = await Promise.allSettled([
          shiftsApi.getActive(),
          incidentsApi.getAll(),
          fetch(`${API_BASE}/certifications?status=expiring_soon`, { credentials: 'include' }).then((r) => r.json()),
        ]);

        const activeShiftData = activeRes.status === 'fulfilled' ? activeRes.value.data.shift : null;
        const incidents = incRes.status === 'fulfilled' ? incRes.value.data.incidents : [];
        const certs = certRes.status === 'fulfilled' && certRes.value?.data?.certifications
          ? certRes.value.data.certifications
          : [];

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentIncidents = incidents.filter(
          (inc: { createdAt: string }) => new Date(inc.createdAt) > thirtyDaysAgo
        );

        setStats({
          activeShift: !!activeShiftData,
          activeShiftStart: activeShiftData?.startedAt ?? null,
          recipientName: activeShiftData?.recipientName ?? null,
          expiringSoonCount: certs.length,
          recentIncidentsCount: recentIncidents.length,
        });
      } catch {
        setStats({ activeShift: false, activeShiftStart: null, recipientName: null, expiringSoonCount: 0, recentIncidentsCount: 0 });
      } finally {
        setStatsLoading(false);
      }
    };
    load();
  }, []);

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const navCards = [
    {
      icon: <ScheduleIcon sx={{ fontSize: { xs: 36, sm: 48 } }} color="primary" />,
      title: 'Shift Companion',
      description: 'Start a new shift or view your active shift.',
      action: () => navigate('/shifts'),
      color: '#e3f2fd',
      borderColor: '#1976d2',
      badge: stats?.activeShift ? (
        <Chip
          icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: '#4caf50 !important' }} />}
          label="Active"
          size="small"
          sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontSize: '0.65rem', height: 20 }}
        />
      ) : null,
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: { xs: 36, sm: 48 } }} color="secondary" />,
      title: 'Weekly Export',
      description: 'Generate your weekly summary for ESP submission.',
      action: () => navigate('/exports'),
      color: '#f3e5f5',
      borderColor: '#7b1fa2',
      badge: null,
    },
    {
      icon: <WarningAmberIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: '#f57c00' }} />,
      title: 'Incidents',
      description: 'Log and manage incident reports.',
      action: () => navigate('/incidents'),
      color: '#fff3e0',
      borderColor: '#f57c00',
      badge: stats && stats.recentIncidentsCount > 0 ? (
        <Chip
          label={`${stats.recentIncidentsCount} recent`}
          size="small"
          sx={{ bgcolor: '#fff3e0', color: '#e65100', fontSize: '0.65rem', height: 20 }}
        />
      ) : null,
    },
    {
      icon: <HelpOutlineIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: '#7b1fa2' }} />,
      title: 'Knowledge Assistant',
      description: 'Ask IHSS and ESP workflow questions.',
      action: () => navigate('/assistant'),
      color: '#ede7f6',
      borderColor: '#7b1fa2',
      badge: null,
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: '#0288d1' }} />,
      title: 'Certifications',
      description: 'Track your IHSS training and certification expiration dates.',
      action: () => navigate('/certifications'),
      color: '#e1f5fe',
      borderColor: '#0288d1',
      badge: stats && stats.expiringSoonCount > 0 ? (
        <Chip
          label={`${stats.expiringSoonCount} expiring`}
          size="small"
          color="warning"
          sx={{ fontSize: '0.65rem', height: 20 }}
        />
      ) : null,
    },
  ];

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 4 }}>
          <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
              Welcome back{profile?.name ? `, ${profile.name}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              What would you like to do today?
            </Typography>
          </Box>

          {/* Active Shift Banner */}
          {!statsLoading && stats?.activeShift && (
            <Card
              sx={{ bgcolor: '#e8f5e9', border: '1px solid #a5d6a7', cursor: 'pointer' }}
              onClick={() => navigate('/shifts')}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FiberManualRecordIcon sx={{ color: '#4caf50', fontSize: 14 }} />
                  <Typography variant="body2" fontWeight={600} color="#2e7d32">
                    Shift in progress{stats.recipientName ? ` — ${stats.recipientName}` : ''}
                    {stats.activeShiftStart ? ` · Started ${formatTime(stats.activeShiftStart)}` : ''}
                  </Typography>
                  <Chip label="View" size="small" sx={{ ml: 'auto !important', bgcolor: '#4caf50', color: 'white', fontSize: '0.65rem', height: 20 }} />
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Stats Row */}
          {!statsLoading && stats && (
            <Grid container spacing={1.5}>
              <Grid item xs={6} sm={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/shifts')}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="h5" fontWeight={700} color={stats.activeShift ? 'success.main' : 'text.secondary'}>
                      {stats.activeShift ? 'Active' : 'None'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Current Shift</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/certifications')}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="h5" fontWeight={700} color={stats.expiringSoonCount > 0 ? 'warning.main' : 'text.secondary'}>
                      {stats.expiringSoonCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Certs Expiring Soon</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card variant="outlined" sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/incidents')}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="h5" fontWeight={700} color={stats.recentIncidentsCount > 0 ? 'warning.main' : 'text.secondary'}>
                      {stats.recentIncidentsCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Incidents (30 days)</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {statsLoading && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          )}

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
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  }}
                >
                  <CardActionArea onClick={card.action} sx={{ height: '100%', p: { xs: 1, sm: 0 } }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                      <Stack spacing={{ xs: 1, sm: 1.5 }} alignItems="center" textAlign="center">
                        {card.icon}
                        <Typography variant={isMobile ? 'caption' : 'subtitle2'} fontWeight={700} lineHeight={1.2}>
                          {card.title}
                        </Typography>
                        {card.badge}
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
}
