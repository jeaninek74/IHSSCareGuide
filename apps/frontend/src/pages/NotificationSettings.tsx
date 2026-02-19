import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, CardContent,
  Switch, FormControlLabel, Alert, CircularProgress,
  Divider, Chip, Paper, Button, TextField, IconButton,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
  const [addingDays, setAddingDays] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const loadRules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // First try to seed defaults if none exist
      const seedRes = await fetch(`${API_BASE}/certifications/reminders/rules/seed`, {
        method: 'POST',
        credentials: 'include',
      });
      const seedData = await seedRes.json();
      if (seedData.success) {
        setRules(seedData.data.rules);
        return;
      }
      // Fallback: just fetch existing rules
      const res = await fetch(`${API_BASE}/certifications/reminders/rules`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setRules(data.data.rules);
      else setError('Failed to load notification settings');
    } catch {
      setError('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

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
      } else {
        setError('Failed to update reminder rule');
      }
    } catch {
      setError('Failed to update reminder rule');
    } finally {
      setSaving(null);
    }
  };

  const deleteRule = async (rule: ReminderRule) => {
    setSaving(rule.id);
    try {
      const res = await fetch(`${API_BASE}/certifications/reminders/rules/${rule.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setRules((prev) => prev.filter((r) => r.id !== rule.id));
      } else {
        setError('Failed to delete reminder rule');
      }
    } catch {
      setError('Failed to delete reminder rule');
    } finally {
      setSaving(null);
    }
  };

  const addRule = async () => {
    const days = parseInt(addingDays, 10);
    if (!days || days < 1 || days > 365) {
      setAddError('Enter a number between 1 and 365');
      return;
    }
    if (rules.some((r) => r.daysBeforeExpiration === days)) {
      setAddError(`A rule for ${days} day(s) already exists`);
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      const res = await fetch(`${API_BASE}/certifications/reminders/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ daysBeforeExpiration: days }),
      });
      const data = await res.json();
      if (data.success) {
        setRules((prev) => [...prev, data.data.rule].sort((a, b) => b.daysBeforeExpiration - a.daysBeforeExpiration));
        setAddingDays('');
      } else {
        setAddError(data.error?.message || 'Failed to add rule');
      }
    } catch {
      setAddError('Failed to add rule');
    } finally {
      setAddLoading(false);
    }
  };

  const labelForDays = (days: number) => {
    if (days === 1) return '1 day before expiration';
    if (days === 7) return '1 week before expiration';
    if (days === 14) return '2 weeks before expiration';
    if (days === 30) return '30 days before expiration';
    if (days === 60) return '60 days before expiration';
    if (days === 90) return '90 days before expiration';
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

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Alert severity="info" sx={{ mb: 3 }}>
          Reminders are sent by email when a certification is approaching its expiration date. Toggle each reminder window on or off below.
        </Alert>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
        ) : (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Email Reminder Schedule</Typography>
                <Divider sx={{ mb: 2 }} />
                {rules.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No reminder rules yet. Add one below.
                  </Typography>
                ) : (
                  rules.map((rule, i) => (
                    <Box key={rule.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>{labelForDays(rule.daysBeforeExpiration)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Send an email {rule.daysBeforeExpiration} day{rule.daysBeforeExpiration !== 1 ? 's' : ''} before any certification expires
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip
                            label={rule.enabled ? 'ON' : 'OFF'}
                            color={rule.enabled ? 'success' : 'default'}
                            size="small"
                          />
                          {saving === rule.id ? (
                            <CircularProgress size={24} sx={{ mx: 1 }} />
                          ) : (
                            <>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={rule.enabled}
                                    onChange={() => toggleRule(rule)}
                                    color="primary"
                                  />
                                }
                                label=""
                                sx={{ mr: 0 }}
                              />
                              <Tooltip title="Delete this rule">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => deleteRule(rule)}
                                  aria-label="delete rule"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </Box>
                      {i < rules.length - 1 && <Divider />}
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Add custom rule */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Add Custom Reminder</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    label="Days before expiration"
                    type="number"
                    size="small"
                    value={addingDays}
                    onChange={(e) => { setAddingDays(e.target.value); setAddError(''); }}
                    inputProps={{ min: 1, max: 365 }}
                    error={!!addError}
                    helperText={addError || 'e.g. 14, 45, 90'}
                    sx={{ width: 220 }}
                    onKeyDown={(e) => { if (e.key === 'Enter') addRule(); }}
                  />
                  <Button
                    variant="contained"
                    startIcon={addLoading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                    onClick={addRule}
                    disabled={addLoading || !addingDays}
                    sx={{ mt: 0.5 }}
                  >
                    Add Rule
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </>
        )}

        <Paper sx={{ p: 3, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>How reminders work</Typography>
          <Typography variant="body2" color="text.secondary">
            When you add or update a certification with an expiration date, reminder events are automatically scheduled based on the rules above. The worker service checks for pending reminders every 5 minutes and sends email notifications to your registered address. Reminders are sent once and will not repeat.
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
