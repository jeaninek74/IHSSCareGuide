import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent,
  Switch, FormControlLabel, Alert, CircularProgress,
  Divider, Chip, Paper,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NavBar from '../components/NavBar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface ReminderRule {
  id: string;
  daysBeforeExpiration: number;
  enabled: boolean;
  certificationTypeId?: string;
}

export default function NotificationSettings() {
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/certifications/reminders/rules`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRules(d.data.rules);
        else setError('Failed to load reminder rules');
      })
      .catch(() => setError('Failed to load reminder rules'))
      .finally(() => setLoading(false));
  }, []);

  const toggleRule = async (rule: ReminderRule) => {
    setSaving(rule.id);
    try {
      const res = await fetch(`${API_BASE}/certifications/reminders/rules/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enabled: !rule.enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
      }
    } catch {
      setError('Failed to update reminder rule');
    } finally {
      setSaving(null);
    }
  };

  const labelForDays = (days: number) => {
    if (days === 1) return '1 day before expiration';
    if (days === 7) return '1 week before expiration';
    if (days === 30) return '30 days before expiration';
    return `${days} days before expiration`;
  };

  return (
    <>
      <NavBar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <NotificationsIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Notification Settings</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Control when you receive email reminders about expiring certifications.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Alert severity="info" sx={{ mb: 3 }}>
          Reminders are sent by email when a certification is approaching its expiration date. Toggle each reminder window on or off below.
        </Alert>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
        ) : rules.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No reminder rules found. Add a certification with an expiration date to auto-create default reminder rules (30, 7, and 1 day before expiration).
            </Typography>
          </Paper>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Email Reminder Schedule</Typography>
              <Divider sx={{ mb: 2 }} />
              {rules.map((rule, i) => (
                <Box key={rule.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>{labelForDays(rule.daysBeforeExpiration)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Send an email reminder {rule.daysBeforeExpiration} day{rule.daysBeforeExpiration !== 1 ? 's' : ''} before any certification expires
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={rule.enabled ? 'ON' : 'OFF'}
                        color={rule.enabled ? 'success' : 'default'}
                        size="small"
                      />
                      {saving === rule.id ? (
                        <CircularProgress size={24} />
                      ) : (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={rule.enabled}
                              onChange={() => toggleRule(rule)}
                              color="primary"
                            />
                          }
                          label=""
                        />
                      )}
                    </Box>
                  </Box>
                  {i < rules.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        <Paper sx={{ p: 3, mt: 3, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>How reminders work</Typography>
          <Typography variant="body2" color="text.secondary">
            When you add or update a certification with an expiration date, reminder events are automatically scheduled based on the rules above. The worker service checks for pending reminders every 5 minutes and sends email notifications. Reminders are only sent once and will not repeat.
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
